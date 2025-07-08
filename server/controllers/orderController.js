// C:\Users\pedro\Desktop\project\server\controllers\orderController.js

import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js'; 
import { buildApiResponse } from '../utils/apiResponse.js';
import { Op, Sequelize } from 'sequelize';
import { parseISO, isFuture, isBefore } from 'date-fns'; 

// --- CRUD de Órdenes ---

export const createOrder = async (req, res) => {
  const userId = req.user.id;
  console.log(`🔵 [Backend] Recibida petición para crear orden por usuario ID: ${userId}. req.body:`, req.body);

  const { totalAmount, status, deliveryDateExpected, notes, items } = req.body; 

  if (!totalAmount || !status || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json(buildApiResponse(false, null, 'Monto total, estado y al menos un artículo son obligatorios.'));
  }

  let transaction;
  try {
    transaction = await Order.sequelize.transaction();

    const newOrder = await Order.create({
      userId: userId,
      orderDate: new Date(),
      totalAmount: totalAmount,
      status: status,
      deliveryDateExpected: deliveryDateExpected || null,
      deliveryDateActual: null, 
      deliveryStatus: 'Pending', 
      notes: notes || null,
    }, { transaction });

    const orderItems = items.map(item => ({
      orderId: newOrder.id,
      productId: item.productId,
      productName: item.productName, 
      sku: item.sku,               
      quantity: item.quantity,
      priceAtSale: item.priceAtSale,
      category: item.category,     
    }));

    await OrderItem.bulkCreate(orderItems, { transaction });

    await transaction.commit();

    console.log('✅ Orden creada exitosamente:', newOrder.toJSON());
    res.status(201).json(buildApiResponse(true, newOrder, 'Orden creada correctamente.'));

  } catch (error) {
    console.error('❌ Error al crear orden en el backend (DETALLE):', error);
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    const errorMessage = error.message || 'Error interno del servidor al crear la orden.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

export const getOrders = async (req, res) => {
  const userId = req.user.id;
  console.log('🔵 [Backend] Recibida petición para obtener órdenes. req.query:', req.query);

  try {
    const { page = 1, limit = 10, status, searchTerm } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = { userId: userId };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (searchTerm) {
      const lowerSearchTerm = `%${String(searchTerm).toLowerCase()}%`;
      whereClause[Op.or] = [
        { status: { [Op.like]: lowerSearchTerm } },
        { notes: { [Op.like]: lowerSearchTerm } },
      ];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'orderItems', 
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [['orderDate', 'DESC']],
    });

    const totalCount = count;
    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json(buildApiResponse(true, { 
      items: orders,
      totalCount: totalCount,
      pagination: {
        currentPage: Number(page),
        limit: Number(limit),
        totalPages: totalPages,
        hasNextPage: Number(page) < totalPages,
        hasPreviousPage: Number(page) > 1,
      }
    }, 'Órdenes obtenidas correctamente.'));

  } catch (error) {
    console.error('❌ Error al obtener órdenes en el backend:', error);
    res.status(500).json(buildApiResponse(false, null, 'Error interno del servidor al obtener órdenes.'));
  }
};

export const getOrderById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  console.log(`🔵 [Backend] Recibida petición para getOrderById (ID: ${id}) por usuario ${userId}.`);

  try {
    const order = await Order.findOne({
      where: { 
        id: Number(id), 
        userId: userId 
      },
      include: [
        {
          model: OrderItem,
          as: 'orderItems', 
        },
      ],
    });

    if (!order) {
      return res.status(404).json(buildApiResponse(false, null, 'Orden no encontrada o no pertenece a su cuenta.'));
    }

    res.status(200).json(buildApiResponse(true, order, 'Orden obtenida correctamente.'));

  } catch (error) {
    console.error('❌ Error al obtener orden por ID en el backend (DETALLE):', error);
    const errorMessage = error.message || 'Error interno del servidor al obtener la orden.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

export const updateOrder = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  console.log(`🔵 [Backend] Recibida petición para updateOrder (ID: ${id}) por usuario ${userId}. req.body:`, req.body);

  try {
    const order = await Order.findOne({
      where: { id: Number(id), userId: userId }
    });

    if (!order) {
      return res.status(404).json(buildApiResponse(false, null, 'Orden no encontrada o no pertenece a su cuenta.'));
    }

    const { totalAmount, status, deliveryDateExpected, deliveryDateActual, deliveryStatus, notes } = req.body;

    await order.update({
      totalAmount: totalAmount !== undefined ? totalAmount : order.totalAmount,
      status: status !== undefined ? status : order.status,
      deliveryDateExpected: deliveryDateExpected !== undefined ? deliveryDateExpected : order.deliveryDateExpected,
      deliveryDateActual: deliveryDateActual !== undefined ? deliveryDateActual : order.deliveryDateActual,
      deliveryStatus: deliveryStatus !== undefined ? deliveryStatus : order.deliveryStatus,
      notes: notes !== undefined ? notes : order.notes,
    });

    console.log(`✅ Orden ${id} actualizada exitosamente en el backend.`);
    res.status(200).json(buildApiResponse(true, order, 'Orden actualizada correctamente.'));

  } catch (error) {
    console.error('❌ Error al actualizar orden en el backend (DETALLE):', error);
    const errorMessage = error.message || 'Error interno del servidor al actualizar la orden.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

export const deleteOrder = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  console.log(`🔵 [Backend] Recibida petición para deleteOrder (ID: ${id}) por usuario ${userId}.`);

  let transaction;
  try {
    transaction = await Order.sequelize.transaction();

    const order = await Order.findOne({
      where: { id: Number(id), userId: userId },
      include: [{ model: OrderItem, as: 'orderItems', include: [{ model: Product, as: 'relatedProduct' }] }], // ALIAS 'relatedProduct'
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json(buildApiResponse(false, null, 'Orden no encontrada o no pertenece a su cuenta.'));
    }

    // La lógica de devolución de stock en deleteOrder es correcta tal como está,
    // ya que solo devuelve stock si la orden NO había sido completada o enviada.
    // Esta es una lógica de "limpieza" al eliminar, no al cambiar de estado.
    if (order.status !== 'Completed' && order.status !== 'Shipped' && order.orderItems && order.orderItems.length > 0) { 
      for (const item of order.orderItems) { 
        const product = item.relatedProduct; // USAR 'relatedProduct'
        if (product) {
          await product.update({ quantity: product.quantity + item.quantity }, { transaction });
          console.log(`✅ Stock revertido para producto ${product.name} (ID: ${product.id}): +${item.quantity}`);
        }
      }
    }

    await OrderItem.destroy({
      where: { orderId: order.id },
      transaction
    });

    await order.destroy({ transaction });

    await transaction.commit();

    console.log(`✅ Orden ${id} eliminada exitosamente del backend para el usuario ${userId}.`);
    res.status(200).json(buildApiResponse(true, null, 'Orden eliminada correctamente y stock revertido si aplica.'));

  } catch (error) {
    console.error('❌ Error al eliminar orden en el backend (DETALLE):', error);
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    const errorMessage = error.message || 'Error interno del servidor al eliminar la orden.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

// --- FUNCIÓN: Actualizar el estado de una orden ---
export const updateOrderStatus = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { status: newStatus } = req.body; 

  console.log(`🔵 [Backend] Recibida petición para actualizar estado de orden ${id} a "${newStatus}" por usuario ${userId}.`);

  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Completed', 'Canceled'];

  if (!newStatus || !validStatuses.includes(newStatus)) {
    console.warn(`⚠️ [Backend] Intento de actualización de estado de orden con estado inválido: ${newStatus}`);
    return res.status(400).json(buildApiResponse(false, null, `Estado inválido proporcionado. Debe ser uno de: ${validStatuses.join(', ')}`));
  }

  let transaction; 
  try {
    transaction = await Order.sequelize.transaction(); 

    // CRÍTICO: Incluir OrderItem Y Product para poder acceder al stock
    // Usamos 'relatedProduct' como alias para el Product dentro de OrderItem
    const order = await Order.findOne({
      where: {
        id: Number(id),
        userId: userId 
      },
      include: [{ 
        model: OrderItem, 
        as: 'orderItems',
        include: [{ model: Product, as: 'relatedProduct' }] // AHORA CON EL ALIAS 'as: 'relatedProduct''
      }], 
      transaction
    });

    if (!order) {
      console.warn(`⚠️ [Backend] Orden ${id} no encontrada o no pertenece al usuario ${userId}.`);
      await transaction.rollback();
      return res.status(404).json(buildApiResponse(false, null, 'Orden no encontrada o no pertenece a su cuenta.'));
    }

    const oldStatus = order.status; // Capturar el estado ANTES de actualizar
    console.log(`🔎 [Backend] Estado actual de la orden ${order.id}: ${oldStatus}. Nuevo estado solicitado: ${newStatus}`);

    let newDeliveryStatus = order.deliveryStatus;
    let newDeliveryDateActual = order.deliveryDateActual;

    // Definir los estados desde los cuales la cancelación DEBE DEVOLVER stock.
    const statusesThatHadDeductedStock = ['Pending', 'Processing', 'Shipped', 'Completed'];

    // Lógica para DEVOLVER stock: Si la orden pasa a 'Canceled' desde un estado que descontó stock
    if (newStatus === 'Canceled' && statusesThatHadDeductedStock.includes(oldStatus)) {
      console.log(`🟢 [Backend] Transición detectada: ${oldStatus} -> Canceled. Devolviendo stock.`);
      if (order.orderItems && order.orderItems.length > 0) {
        for (const item of order.orderItems) {
          // Acceder al producto incluido usando el alias 'relatedProduct'
          const product = item.relatedProduct; // ¡CAMBIADO a item.relatedProduct!
          if (product) {
            await product.update({ quantity: product.quantity + item.quantity }, { transaction });
            console.log(`✅ Stock revertido para producto '${product.name}' (ID: ${product.id}): +${item.quantity}. Nuevo stock: ${product.quantity}`);
          } else {
            console.warn(`⚠️ [Backend] Producto no encontrado para OrderItem ID: ${item.id}. No se pudo devolver el stock.`);
          }
        }
      }
      newDeliveryStatus = 'Not Applicable'; 
      newDeliveryDateActual = null;
    } 
    // Lógica para DEDUCIR stock nuevamente: Si la orden pasa de 'Canceled' a un estado que requiere stock
    else if (oldStatus === 'Canceled' && statusesThatHadDeductedStock.includes(newStatus)) {
      console.log(`🟠 [Backend] Transición detectada: Canceled -> ${newStatus}. Dediucendo stock nuevamente.`);
      if (order.orderItems && order.orderItems.length > 0) {
        for (const item of order.orderItems) {
          // Acceder al producto incluido usando el alias 'relatedProduct'
          const product = item.relatedProduct; // ¡CAMBIADO a item.relatedProduct!
          if (product) {
            if (product.quantity >= item.quantity) {
              await product.update({ quantity: product.quantity - item.quantity }, { transaction });
              console.log(`✅ Stock deducido para producto '${product.name}' (ID: ${product.id}): -${item.quantity}. Nuevo stock: ${product.quantity}`);
            } else {
              console.warn(`⚠️ [Backend] Stock insuficiente para deducir ${item.quantity} de '${product.name}' (ID: ${product.id}) al reactivar la orden ${order.id}. Stock actual: ${product.quantity}.`);
              await product.update({ quantity: product.quantity - item.quantity }, { transaction }); 
            }
          }
        }
      }
    }

    // Actualizar deliveryStatus y deliveryDateActual basados en el nuevo estado (newStatus)
    if (newStatus === 'Completed') {
      newDeliveryDateActual = new Date();
      if (order.deliveryDateExpected) {
        const expected = parseISO(order.deliveryDateExpected);
        expected.setHours(0, 0, 0, 0); 
        const actual = new Date(newDeliveryDateActual);
        actual.setHours(0, 0, 0, 0); 

        if (isBefore(actual, expected) || actual.getTime() === expected.getTime()) {
          newDeliveryStatus = 'On Time';
        } else {
          newDeliveryStatus = 'Delayed';
        }
      } else {
        newDeliveryStatus = 'On Time'; 
      }
    } else if (newStatus === 'Shipped') { 
      newDeliveryStatus = 'In Transit';
    } else if (newStatus === 'Pending' || newStatus === 'Processing') { 
      newDeliveryStatus = 'Pending'; 
    }


    await order.update({
      status: newStatus, 
      deliveryStatus: newDeliveryStatus,
      deliveryDateActual: newDeliveryDateActual,
    }, { transaction });

    await transaction.commit();

    console.log(`✅ [Backend] Orden ${id} status actualizado exitosamente a ${newStatus} por usuario ${userId}.`);
    res.status(200).json(buildApiResponse(true, order, `Estado de la orden ${id} actualizado a ${newStatus}.`));

  } catch (error) {
    console.error('❌ [Backend] Error al actualizar estado de la orden en el backend (DETALLE):', error);
    if (transaction && !transaction.finished) { 
      await transaction.rollback(); 
      console.error('🚫 Transacción de actualización de orden revertida debido a un error.');
    }
    const errorMessage = error.message || 'Error interno del servidor al actualizar el estado de la orden.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};
