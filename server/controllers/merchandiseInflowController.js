// C:\Users\pedro\Desktop\project\server\controllers\merchandiseInflowController.js

import MerchandiseInflow from '../models/MerchandiseInflow.js';
import MerchandiseInflowItem from '../models/MerchandiseInflowItem.js';
import Product from '../models/Product.js'; // Necesario para actualizar la cantidad
import User from '../models/User.js';     // Necesario si se necesita el usuario que registra
import { buildApiResponse } from '../utils/apiResponse.js';
import { Op } from 'sequelize';

// --- Función para crear una nueva entrada de mercadería ---
export const createMerchandiseInflow = async (req, res) => {
  const userId = req.user.id; // Asumiendo que el ID del usuario está en req.user.id (del authMiddleware)
  console.log(`🔵 [Backend] Recibida petición para crear entrada de mercadería por usuario ID: ${userId}. req.body:`, req.body);

  const { referenceNumber, supplier, inflowDate, notes, inflowItems } = req.body;

  // Validaciones básicas
  if (!referenceNumber || !supplier || !inflowDate || !Array.isArray(inflowItems) || inflowItems.length === 0) {
    return res.status(400).json(buildApiResponse(false, null, 'Número de referencia, proveedor, fecha de entrada y al menos un artículo son obligatorios.'));
  }

  let transaction;
  try {
    transaction = await MerchandiseInflow.sequelize.transaction();

    // 1. Crear la entrada principal de mercadería
    const newInflow = await MerchandiseInflow.create({
      userId: userId,
      referenceNumber: referenceNumber.trim(),
      supplier: supplier.trim(),
      inflowDate: new Date(inflowDate), // Convertir a objeto Date
      notes: notes ? notes.trim() : null,
    }, { transaction });

    const inflowItemsToCreate = [];
    for (const item of inflowItems) {
      // Validar cada ítem
      if (!item.productId || !item.quantityReceived) {
        throw new Error('Cada artículo de entrada debe tener un ID de producto y una cantidad recibida.');
      }
      if (item.quantityReceived <= 0) {
        throw new Error(`La cantidad recibida para el producto ${item.productId} debe ser mayor que cero.`);
      }

      // 2. Encontrar el producto y actualizar su cantidad
      const product = await Product.findByPk(item.productId, { transaction });
      if (!product) {
        throw new Error(`Producto con ID ${item.productId} no encontrado. No se pudo registrar el ítem de entrada.`);
      }

      product.quantity += item.quantityReceived; // Incrementar la cantidad del producto
      await product.save({ transaction }); // Guardar el producto con la cantidad actualizada
      console.log(`✅ Stock de producto '${product.name}' (SKU: ${product.sku}) actualizado. Nuevo stock: ${product.quantity}`);

      // Preparar el ítem para la creación masiva
      inflowItemsToCreate.push({
        merchandiseInflowId: newInflow.id,
        productId: item.productId,
        quantityReceived: item.quantityReceived,
        unitCost: item.unitCost || null, // Opcional
        lotNumber: item.lotNumber ? item.lotNumber.trim() : null, // Opcional
        expirationDate: item.expirationDate ? new Date(item.expirationDate) : null, // Opcional
      });
    }

    // 3. Crear los ítems de la entrada de mercadería
    await MerchandiseInflowItem.bulkCreate(inflowItemsToCreate, { transaction });

    await transaction.commit();

    console.log('✅ Entrada de mercadería creada exitosamente:', newInflow.toJSON());
    res.status(201).json(buildApiResponse(true, newInflow, 'Entrada de mercadería registrada correctamente.'));

  } catch (error) {
    console.error('❌ Error al crear entrada de mercadería en el backend (DETALLE):', error);
    if (transaction && !transaction.finished) {
      await transaction.rollback();
      console.error('🚫 Transacción de entrada de mercadería revertida debido a un error.');
    }
    const errorMessage = error.message || 'Error interno del servidor al registrar la entrada de mercadería.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

// --- Función para obtener todas las entradas de mercadería (con paginación y filtros) ---
// REVERTIDO: Nombre de la función a 'getMerchandiseInflows' (plural)
export const getMerchandiseInflows = async (req, res) => { 
  const userId = req.user.id; // Asumiendo que quieres filtrar por usuario
  console.log('🔵 [Backend] Recibida petición para obtener entradas de mercadería. req.query:', req.query);

  try {
    const { page = 1, limit = 10, searchTerm, supplier, startDate, endDate } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = { userId: userId }; // Filtrar por el usuario autenticado

    if (searchTerm) {
      const lowerSearchTerm = `%${String(searchTerm).toLowerCase()}%`;
      whereClause[Op.or] = [
        { referenceNumber: { [Op.like]: lowerSearchTerm } },
        { supplier: { [Op.like]: lowerSearchTerm } },
        { notes: { [Op.like]: lowerSearchTerm } },
      ];
    }
    
    if (supplier) {
      whereClause.supplier = { [Op.like]: `%${String(supplier).toLowerCase()}%` };
    }

    // Filtro por rango de fechas
    if (startDate && endDate) {
      whereClause.inflowDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereClause.inflowDate = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereClause.inflowDate = { [Op.lte]: new Date(endDate) };
    }

    const { count, rows: inflows } = await MerchandiseInflow.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: MerchandiseInflowItem,
          as: 'inflowItems',
          // Opcional: incluir el producto para mostrar detalles en la tabla principal si es necesario
          // include: [{ model: Product, as: 'inflowProduct' }] 
        },
        {
          model: User,
          as: 'registeredBy', // El alias definido en associations.js
          attributes: ['username', 'email'], 
        }
      ],
      limit: Number(limit),
      offset: offset,
      order: [['createdAt', 'DESC']], // Ordenar por la fecha de creación descendente (más reciente primero)
    });

    const totalCount = count;
    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json(buildApiResponse(true, {
      items: inflows,
      totalCount: totalCount,
      pagination: {
        currentPage: Number(page),
        limit: Number(limit),
        totalPages: totalPages,
        hasNextPage: Number(page) < totalPages,
        hasPreviousPage: Number(page) > 1,
      }
    }, 'Entradas de mercadería obtenidas correctamente.'));

  } catch (error) {
    console.error('❌ Error al obtener entradas de mercadería en el backend:', error);
    const errorMessage = error.message || 'Error interno del servidor al obtener las entradas de mercadería.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

// --- Función para obtener una entrada de mercadería por su ID ---
export const getMerchandiseInflowById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  console.log(`🔵 [Backend] Recibida petición para getMerchandiseInflowById (ID: ${id}) por usuario ${userId}.`);

  try {
    const inflow = await MerchandiseInflow.findOne({
      where: {
        id: Number(id),
        userId: userId // Asegurarse de que el usuario solo pueda ver sus propias entradas
      },
      include: [
        {
          model: MerchandiseInflowItem,
          as: 'inflowItems',
          include: [{ model: Product, as: 'inflowProduct' }] // Incluir el producto asociado a cada ítem
        },
        {
          model: User,
          as: 'registeredBy',
          attributes: ['username', 'email'],
        }
      ],
    });

    if (!inflow) {
      return res.status(404).json(buildApiResponse(false, null, 'Entrada de mercadería no encontrada o no pertenece a su cuenta.'));
    }

    res.status(200).json(buildApiResponse(true, inflow, 'Entrada de mercadería obtenida correctamente.'));

  } catch (error) {
    console.error('❌ Error al obtener entrada de mercadería por ID en el backend (DETALLE):', error);
    const errorMessage = error.message || 'Error interno del servidor al obtener la entrada de mercadería.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};


// (Opcional) Funciones para updateMerchandiseInflow y deleteMerchandiseInflow
// Estas son más complejas debido al impacto en el stock y deberían ser implementadas
// con una lógica muy cuidadosa para revertir o ajustar cantidades de productos.
