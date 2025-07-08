// C:\Users\pedro\Desktop\project\server\controllers\inventoryController.js
console.log('--- VERSION FINAL Y CORRECTA DE INVENTORY CONTROLLER ---'); 

import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js'; 
import User from '../models/User.js'; 
import { buildApiResponse } from '../utils/apiResponse.js';
import { Op, Sequelize } from 'sequelize'; 
import { parseISO, isFuture, isBefore } from 'date-fns'; 

// --- Funciones de Utilidad ---
const calculateOrderTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.quantity * item.priceAtSale), 0);
};

const calculateProductStatusBackend = (quantity, minStock) => {
  if (quantity === 0) {
    return 'Out of Stock';
  } else if (minStock !== undefined && quantity <= minStock) {
    return 'Low Stock';
  } else if (minStock !== undefined && quantity > minStock * 2) { 
    return 'Overstocked';
  } else if (quantity > 0) {
    return 'In Stock';
  }
  return 'Unknown'; 
};

const buildStatusCondition = (statusFilter) => {
  switch (statusFilter) {
    case 'Out of Stock':
      return { quantity: 0 };
    case 'Low Stock':
      return { 
        quantity: { [Op.gt]: 0 },
        minStock: { [Op.not]: null, [Op.gt]: 0 }, 
        [Op.and]: Sequelize.where(
          Sequelize.col('quantity'), 
          { [Op.lte]: Sequelize.col('minStock') }
        )
      };
    case 'Overstocked':
      return { 
        quantity: { [Op.gt]: 0 }, 
        minStock: { [Op.not]: null, [Op.gt]: 0 }, 
        [Op.and]: Sequelize.where(
          Sequelize.col('quantity'), 
          { [Op.gt]: Sequelize.literal('Product.minStock * 2') }
        )
      };
    case 'In Stock':
      return {
        quantity: { [Op.gt]: 0 }, 
        [Op.or]: [
          { minStock: { [Op.eq]: null } }, 
          { minStock: 0 }, 
          { [Op.and]: [
              { minStock: { [Op.not]: null, [Op.gt]: 0 } }, 
              Sequelize.where(
                Sequelize.col('quantity'), 
                { [Op.gt]: Sequelize.col('minStock') }
              )
            ]
          }
        ],
        [Op.and]: [ 
          {
            [Op.or]: [
              { minStock: { [Op.eq]: null } },
              { minStock: 0 },
              Sequelize.where(
                Sequelize.col('quantity'), 
                { [Op.lte]: Sequelize.literal('Product.minStock * 2') }
              )
            ]
          }
        ]
      };
    case 'Unknown':
      return {
        quantity: { [Op.eq]: null } 
      };
    default:
      return {}; 
  }
};


// --- CRUD de Productos ---
export const addProduct = async (req, res) => {
  const userId = req.user.id; 
  console.log('🔵 [Backend] Recibida petición para addProduct. req.body:', req.body);
  console.log(`[Backend] Producto para añadir por el usuario ID: ${userId}`);

  try {
    const { 
      name, 
      description, 
      sku, 
      category, 
      quantity, 
      minStock, 
      price, 
      status, 
      location 
    } = req.body;

    if (!name || !sku || !category || quantity === undefined || quantity === null || isNaN(Number(quantity)) || price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json(buildApiResponse(false, null, 'Todos los campos requeridos (nombre, SKU, categoría, cantidad, precio) deben ser válidos.'));
    }

    const existingProduct = await Product.findOne({ where: { sku, userId: userId } }); 
    if (existingProduct) {
      return res.status(400).json(buildApiResponse(false, null, 'Ya existe un producto con este SKU para su cuenta.'));
    }

    const newProduct = await Product.create({
      name,
      description,
      sku,
      category,
      quantity: Number(quantity), 
      minStock: Number(minStock) || 0, 
      price: Number(price), 
      status: status || 'In Stock', 
      location,
      lastUpdated: new Date(), 
      userId: userId, 
    });

    console.log('✅ Producto añadido exitosamente en el backend:', newProduct.toJSON());
    res.status(201).json(buildApiResponse(true, newProduct, 'Producto añadido correctamente.'));

  } catch (error) {
    console.error('❌ Error al añadir producto en el backend (DETALLE):', error);
    const errorMessage = error.message || 'Error interno del servidor al añadir el producto.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

export const updateProduct = async (req, res) => {
  const userId = req.user.id; 
  console.log(`🔵 [Backend] Recibida petición para updateProduct (ID: ${req.params.id}) por usuario ${userId}. req.body:`, req.body);

  try {
    const { id } = req.params; 
    const { 
      name, 
      description, 
      sku, 
      category, 
      quantity, 
      minStock, 
      price, 
      status, 
      location 
    } = req.body;

    const product = await Product.findOne({ 
      where: { id: Number(id), userId: userId } 
    }); 

    if (!product) {
      return res.status(404).json(buildApiResponse(false, null, 'Producto no encontrado o no pertenece a su cuenta.'));
    }

    if (sku && sku !== product.sku) {
      const existingProductWithSku = await Product.findOne({ where: { sku, userId: userId } }); 
      if (existingProductWithSku && existingProductWithSku.id !== product.id) {
        return res.status(400).json(buildApiResponse(false, null, 'Ya existe otro producto con este SKU en su cuenta.'));
      }
    }

    product.name = name !== undefined ? name : product.name;
    product.description = description !== undefined ? description : product.description;
    product.sku = sku !== undefined ? sku : product.sku;
    product.category = category !== undefined ? category : product.category;
    product.quantity = quantity !== undefined ? Number(quantity) : product.quantity;
    product.minStock = minStock !== undefined ? Number(minStock) : product.minStock;
    product.price = price !== undefined ? Number(price) : product.price;
    product.status = status !== undefined ? status : product.status; 
    product.location = location !== undefined ? location : product.location;
    product.lastUpdated = new Date(); 

    await product.save(); 

    console.log('✅ Producto actualizado exitosamente en el backend:', product.toJSON());
    res.status(200).json(buildApiResponse(true, product, 'Producto actualizado correctamente.'));

  } catch (error) {
    console.error('❌ Error al actualizar producto en el backend (DETALLE):', error);
    const errorMessage = error.message || 'Error interno del servidor al actualizar el producto.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

export const deleteProduct = async (req, res) => {
  const userId = req.user.id; 
  console.log(`🔵 [Backend] Recibida petición para deleteProduct (ID: ${req.params.id}) por usuario ${userId}.`);

  try {
    const { id } = req.params;
    const result = await Product.destroy({
      where: { 
        id: Number(id), 
        userId: userId 
      }
    });

    if (result === 0) {
      return res.status(404).json(buildApiResponse(false, null, 'Producto no encontrado o no pertenece a su cuenta para eliminar.'));
    }

    console.log(`✅ Producto con ID ${id} eliminado exitosamente del backend para el usuario ${userId}.`);
    res.status(200).json(buildApiResponse(true, null, 'Producto eliminado correctamente.'));

  } catch (error) {
    console.error('❌ Error al eliminar producto en el backend (DETALLE):', error);
    const errorMessage = error.message || 'Error interno del servidor al eliminar el producto.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

export const getProducts = async (req, res) => {
  const userId = req.user.id; 
  console.log('🔵 [Backend] Recibida petición para getProducts. req.query:', req.query);
  console.log(`[Backend] Productos solicitados por el usuario ID: ${userId}`);

  try {
    const { page = 1, limit = 10, searchTerm, category, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Iniciar con un array de condiciones para Op.and
    let conditions = [{ userId: userId }]; 

    if (searchTerm) {
      const lowerSearchTerm = `%${String(searchTerm).toLowerCase()}%`; 
      conditions.push({ // Añadir la condición de búsqueda a las demás
        [Op.or]: [
          { name: { [Op.like]: lowerSearchTerm } },
          { description: { [Op.like]: lowerSearchTerm } },
          { sku: { [Op.like]: lowerSearchTerm } },
          { category: { [Op.like]: lowerSearchTerm } },
          { location: { [Op.like]: lowerSearchTerm } },
        ]
      });
    }

    if (category && category !== 'all') {
      conditions.push({ category: category }); // Añadir la condición de categoría
    }

    if (status && status !== 'all') {
      const statusCondition = buildStatusCondition(status);
      if (Object.keys(statusCondition).length > 0) { 
        conditions.push(statusCondition); // Añadir la condición de estado
      }
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: { [Op.and]: conditions }, // Aplicar todas las condiciones con Op.and
      limit: Number(limit),
      offset: offset,
      order: [['name', 'ASC']], 
    });
    
    const totalCount = count;
    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json(buildApiResponse(true, { 
      items: products,
      totalCount: totalCount,
      pagination: {
        currentPage: Number(page),
        limit: Number(limit),
        totalPages: totalPages,
        hasNextPage: Number(page) < totalPages,
        hasPreviousPage: Number(page) > 1,
      }
    }, 'Productos obtenidos correctamente.'));

  } catch (error) {
    console.error('❌ Error al obtener productos en el backend:', error);
    res.status(500).json(buildApiResponse(false, null, 'Error interno del servidor al obtener productos.'));
  }
};


export const getProductById = async (req, res) => {
  const userId = req.user.id; 
  console.log(`🔵 [Backend] Recibida petición para getProductById (ID: ${req.params.id}) por usuario ${userId}.`);

  try {
    const { id } = req.params; // Necesitas destructurar id de req.params aquí
    const product = await Product.findOne({
      where: { 
        id: Number(id), 
        userId: userId 
      }
    });

    if (!product) {
      return res.status(404).json(buildApiResponse(false, null, 'Producto no encontrado o no pertenece a su cuenta.'));
    }

    res.status(200).json(buildApiResponse(true, product, 'Producto obtenido correctamente.'));

  } catch (error) {
    console.error('❌ Error al obtener producto por ID en el backend (DETALLE):', error);
    const errorMessage = error.message || 'Error interno del servidor al obtener el producto.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};


// --- FUNCIÓN recordSale (venta de un solo producto) ---
export const recordSale = async (req, res) => {
  const userId = req.user.id; 
  console.log(`🔵 [Backend] Recibida petición para registrar venta por usuario ID: ${userId}.`);

  const { productId, quantity, priceAtSale, deliveryDateExpected, notes } = req.body;

  if (!productId || !quantity || quantity <= 0 || !priceAtSale || priceAtSale <= 0) {
    return res.status(400).json(buildApiResponse(false, null, 'Producto ID, cantidad y precio de venta son obligatorios y deben ser positivos.'));
  }

  let transaction; 
  try {
    transaction = await Product.sequelize.transaction(); 

    // 1. Encontrar el producto y verificar stock (filtrado por userId)
    const product = await Product.findOne({
      where: {
        id: productId,
        userId: userId 
      },
      transaction 
    });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json(buildApiResponse(false, null, 'Producto no encontrado o no pertenece a su cuenta.'));
    }

    if (product.quantity < quantity) {
      await transaction.rollback();
      return res.status(400).json(buildApiResponse(false, null, `Stock insuficiente para el producto "${product.name}". Disponible: ${product.quantity}, solicitado: ${quantity}`));
    }

    // 2. Deducir la cantidad del inventario del producto
    await product.update({ quantity: product.quantity - quantity }, { transaction });

    // 3. Calcular el monto total de la venta
    const totalSaleAmount = quantity * priceAtSale;

    // Lógica para determinar el estado inicial de la orden y entrega
    let orderStatus = 'Completed';
    let actualDeliveryDate = new Date(); // Por defecto, si es venta inmediata
    let deliveryStatus = 'On Time';

    if (deliveryDateExpected) {
        const expectedDate = parseISO(deliveryDateExpected); // Convertir a objeto Date
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalizar a inicio del día para comparación

        if (isFuture(expectedDate, { now: now })) { // Si la fecha esperada es futura
            orderStatus = 'Pending'; // O 'Processing'
            actualDeliveryDate = null; // No hay fecha de entrega real aún
            deliveryStatus = 'In Transit';
        } else if (isBefore(expectedDate, now)) { // Si la fecha esperada es pasada (y hoy no es la fecha esperada)
            orderStatus = 'Processing'; // O 'Pending'
            actualDeliveryDate = null; // No hay fecha de entrega real aún
            deliveryStatus = 'Delayed'; // Si ya debería haberse entregado
        }
        // Si expectedDate es hoy, se mantiene el default de Completed/On Time (venta inmediata)
    }

    // 4. Crear la orden principal
    const newOrder = await Order.create({
      userId: userId,
      orderDate: new Date(),
      totalAmount: totalSaleAmount,
      status: orderStatus, // Estado dinámico
      deliveryDateExpected: deliveryDateExpected || null, // Guardar la fecha esperada o null
      deliveryDateActual: actualDeliveryDate, // Fecha real o null
      deliveryStatus: deliveryStatus, // Estado de entrega dinámico
      notes: notes || `Venta directa de ${quantity} x ${product.name}`,
    }, { transaction });

    // 5. Crear el OrderItem asociado a la nueva orden
    const newOrderItem = await OrderItem.create({
      orderId: newOrder.id,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: quantity,
      priceAtSale: priceAtSale,
      category: product.category,
    }, { transaction });

    await transaction.commit(); 

    console.log('✅ Venta registrada como orden exitosamente:', newOrder.toJSON());
    res.status(201).json(buildApiResponse(true, { order: newOrder, orderItem: newOrderItem }, 'Venta registrada y stock actualizado correctamente.'));

  } catch (error) {
    console.error('❌ Error al registrar venta en el backend (DETALLE):', error);
    if (transaction && !transaction.finished) { 
      await transaction.rollback(); 
      console.error('🚫 Transacción de venta revertida debido a un error.');
    }
    const errorMessage = error.message || 'Error interno del servidor al registrar la venta.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};


// --- CRUD de Órdenes (manteniendo tus get y añadiendo updateOrderStatus) ---

export const getOrders = async (req, res) => { // Renombrado de getAllOrders para consistencia con frontend paginado
  const userId = req.user.id;
  console.log('🔵 [Backend] Recibida petición para getOrders. req.query:', req.query);

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
        // Puedes añadir búsqueda en OrderItems si es necesario, pero es más complejo con joins
      ];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          // attributes: ['productName', 'quantity'], // Puedes limitar los atributos si quieres
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [['orderDate', 'DESC']], // Siempre ordenar las órdenes por fecha
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
          // include: {
          //   model: Product, // Asegúrate de que Product esté asociado con OrderItem si quieres sus datos
          //   attributes: ['name', 'price'], 
          // },
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

// NUEVA FUNCIÓN: Actualizar el estado de una orden
export const updateOrderStatus = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params; // ID de la orden desde los parámetros de la URL
  const { status } = req.body; // Nuevo estado desde el cuerpo de la petición

  console.log(`🔵 [Backend] Recibida petición para actualizar estado de orden ${id} a "${status}" por usuario ${userId}.`); // Debug log

  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Completed', 'Canceled'];

  if (!status || !validStatuses.includes(status)) {
    console.warn(`⚠️ [Backend] Intento de actualización de estado de orden con estado inválido: ${status}`); // Debug log
    return res.status(400).json(buildApiResponse(false, null, `Estado inválido proporcionado. Debe ser uno de: ${validStatuses.join(', ')}`));
  }

  let transaction; 
  try {
    transaction = await Product.sequelize.transaction(); 

    const order = await Order.findOne({
      where: {
        id: Number(id),
        userId: userId 
      },
      transaction
    });

    if (!order) {
      console.warn(`⚠️ [Backend] Orden ${id} no encontrada o no pertenece al usuario ${userId}.`); // Debug log
      await transaction.rollback();
      return res.status(404).json(buildApiResponse(false, null, 'Orden no encontrada o no pertenece a su cuenta.'));
    }

    console.log(`🔎 [Backend] Estado actual de la orden ${order.id}: ${order.status}. Nuevo estado solicitado: ${status}`); // Debug log

    let newDeliveryStatus = order.deliveryStatus;
    let newDeliveryDateActual = order.deliveryDateActual;

    // Lógica para manejar stock si la orden se cancela y no se había enviado
    if (status === 'Canceled' && order.status !== 'Completed' && order.status !== 'Shipped') {
        const orderItems = await OrderItem.findAll({ where: { orderId: order.id }, transaction });
        for (const item of orderItems) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (product) {
                await product.update({ quantity: product.quantity + item.quantity }, { transaction });
                console.log(`✅ Stock revertido para producto ${product.name}: +${item.quantity}`);
            }
        }
        newDeliveryStatus = 'Not Applicable';
        newDeliveryDateActual = null;
    } else if (status === 'Completed') {
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
    } else if (status === 'Shipped') {
        newDeliveryStatus = 'In Transit';
    } else {
        // Para 'Pending' o 'Processing', el deliveryStatus se mantiene
        // o si es un cambio inválido a un estado anterior, podría requerir más lógica
    }

    // Actualizar la orden
    await order.update({
      status: status,
      deliveryStatus: newDeliveryStatus,
      deliveryDateActual: newDeliveryDateActual,
    }, { transaction });

    await transaction.commit();

    console.log(`✅ [Backend] Orden ${id} status actualizado exitosamente a ${status} por usuario ${userId}.`); // Debug log de éxito
    res.status(200).json(buildApiResponse(true, order, `Estado de la orden ${id} actualizado a ${status}.`));

  } catch (error) {
    console.error('❌ [Backend] Error al actualizar estado de la orden en el backend (DETALLE):', error); // Debug log de error detallado
    if (transaction && !transaction.finished) { 
      await transaction.rollback(); 
      console.error('🚫 Transacción de actualización de orden revertida debido a un error.');
    }
    const errorMessage = error.message || 'Error interno del servidor al actualizar el estado de la orden.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};


// --- Analíticas de Inventario ---
export const getInventoryAnalytics = async (req, res) => {
  const userId = req.user.id; 
  console.log(`🔵 [Backend] Recibida petición para getInventoryAnalytics por usuario ${userId}.`);

  try {
    const totalProductsCount = await Product.count({ where: { userId: userId } }); 
    
    const allProducts = await Product.findAll({
      where: { userId: userId }, 
      attributes: [
        'id', 
        'quantity', 
        'price', 
        'minStock', 
        'category',
        'name',
        'sku'
      ]
    });

    let totalItemsInStock = 0;
    let totalValue = 0;
    const categoriesDistribution = {};
    const topProductsByValue = []; 

    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let overstockedCount = 0;
    let unknownStatusCount = 0;

    allProducts.forEach(product => {
      const quantity = Number(product.quantity) || 0; 
      const price = Number(product.price) || 0;     
      const minStock = Number(product.minStock) || 0;
      const category = product.category || 'Uncategorized';

      totalItemsInStock += quantity;
      totalValue += (quantity * price);

      const status = calculateProductStatusBackend(quantity, minStock);
      switch (status) {
        case 'In Stock': inStockCount++; break;
        case 'Low Stock': lowStockCount++; break;
        case 'Out of Stock': outOfStockCount++; break;
        case 'Overstocked': overstockedCount++; break;
        case 'Unknown': unknownStatusCount++; break;
      }

      categoriesDistribution[category] = (categoriesDistribution[category] || 0) + 1;

      topProductsByValue.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        quantity: quantity,
        price: price, 
        value: quantity * price, 
      });
    });

    topProductsByValue.sort((a, b) => b.value - a.value);
    const top5Products = topProductsByValue.slice(0, 5);

    // --- Calcular Métricas de Rendimiento desde Órdenes ---
    const allOrders = await Order.findAll({
      where: { userId: userId },
      attributes: ['status', 'deliveryStatus', 'orderDate', 'deliveryDateActual', 'deliveryDateExpected'],
    });

    let completedOrders = 0;
    let totalOrders = allOrders.length;
    let onTimeDeliveries = 0;
    let totalDeliveries = 0; 

    allOrders.forEach(order => {
      if (order.status === 'Completed') {
        completedOrders++;
      }
      if (order.deliveryDateActual) { 
        totalDeliveries++;
        if (order.deliveryStatus === 'On Time') {
          onTimeDeliveries++;
        }
      }
    });

    const fulfillmentRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) + '%' : 'N/A';
    const deliveryOnTime = totalDeliveries > 0 ? ((onTimeDeliveries / totalDeliveries) * 100).toFixed(2) + '%' : 'N/A';

    // DEBUG LOG: What data is being sent for analytics
    console.log('✅ [Backend Analytics] Datos enviados al frontend:', {
      totalProducts: totalProductsCount, 
      totalItemsInStock: totalItemsInStock, 
      totalValue: totalValue,
      lowStockItems: lowStockCount, 
      outOfStockItems: outOfStockCount, 
      inStockItems: inStockCount, 
      overstockedItems: overstockedCount, 
      unknownStatusItems: unknownStatusCount, 
      categoriesDistribution: categoriesDistribution,
      topProductsByValue: top5Products,
      performanceMetrics: { 
        fulfillmentRate: fulfillmentRate, 
        deliveryOnTime: deliveryOnTime 
      },
      systemStatus: { 
        databaseConnection: 'OK', 
        serverUptime: 'OK'
      }
    });

    res.status(200).json(buildApiResponse(true, {
      totalProducts: totalProductsCount, 
      totalItemsInStock: totalItemsInStock, 
      totalValue: totalValue,
      lowStockItems: lowStockCount, 
      outOfStockItems: outOfStockCount, 
      inStockItems: inStockCount, 
      overstockedItems: overstockedCount, 
      unknownStatusItems: unknownStatusCount, 
      categoriesDistribution: categoriesDistribution,
      topProductsByValue: top5Products,
      performanceMetrics: { 
        fulfillmentRate: fulfillmentRate, 
        deliveryOnTime: deliveryOnTime 
      },
      systemStatus: { 
        databaseConnection: 'OK', 
        serverUptime: 'OK'
      }
    }, 'Analíticas de inventario obtenidas correctamente.'));

  } catch (error) {
    console.error('❌ Error al obtener analíticas de inventario en el backend:', error);
    res.status(500).json(buildApiResponse(false, null, 'Error interno del servidor al obtener analíticas.'));
  }
};

// --- FUNCIÓN DE ALERTAS ---
export const getInventoryAlerts = async (req, res) => {
  const userId = req.user.id; 
  console.log(`🔵 [Backend] Recibida petición para getInventoryAlerts por usuario ${userId}.`);

  try {
    const allProducts = await Product.findAll({
      where: { userId: userId }, 
      attributes: ['id', 'name', 'sku', 'category', 'quantity', 'minStock', 'location', 'lastUpdated'],
    });

    const alerts = [];

    allProducts.forEach(product => {
      const quantity = Number(product.quantity) || 0;
      const minStock = Number(product.minStock) || 0;
      const status = calculateProductStatusBackend(quantity, minStock); 

      let priority = 'Low'; 
      let isAlert = false; 

      switch (status) {
        case 'Out of Stock': priority = 'Critical'; isAlert = true; break;
        case 'Low Stock': priority = 'High'; isAlert = true; break;
        case 'Overstocked': priority = 'Medium'; isAlert = true; break;
        case 'Unknown': priority = 'Low'; isAlert = true; break;
      }

      if (isAlert) {
        alerts.push({
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          quantity: product.quantity,
          minStock: product.minStock,
          location: product.location,
          status: status,    
          priority: priority, 
          lastUpdated: product.lastUpdated,
          isRead: false, 
        });
      }
    });

    const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    alerts.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    // DEBUG LOG: What alerts data is being sent
    console.log('✅ [Backend Alerts] Alertas enviadas al frontend:', alerts);

    res.status(200).json(buildApiResponse(true, alerts, 'Alertas de inventario obtenidas correctamente.'));

  } catch (error) {
    console.error('❌ Error al obtener alertas de inventario en el backend:', error);
    res.status(500).json(buildApiResponse(false, null, 'Error interno del servidor al obtener alertas.'));
  }
};
