// C:\Users\pedro\Desktop\project\server\controllers\inventoryController.js

import Product from '../models/Product.js'; 
import { buildApiResponse } from '../utils/apiResponse.js'; 
import { Op, Sequelize } from 'sequelize'; 

// Función auxiliar para calcular el estado del producto (replicando la lógica del frontend)
// Movida al principio para que sea accesible por todas las funciones
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

// Función auxiliar para construir la condición de estado de Sequelize
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


// --- CRUD Operations ---

export const addProduct = async (req, res) => {
  const userId = req.user.id; // <-- OBTENEMOS EL USER ID DEL TOKEN
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

    if (!name) { return res.status(400).json(buildApiResponse(false, null, 'El nombre del producto es requerido.')); }
    if (!sku) { return res.status(400).json(buildApiResponse(false, null, 'El SKU del producto es requerido.')); }
    if (!category) { return res.status(400).json(buildApiResponse(false, null, 'La categoría del producto es requerida.')); }
    if (quantity === undefined || quantity === null || isNaN(Number(quantity))) { return res.status(400).json(buildApiResponse(false, null, 'La cantidad es requerida y debe ser un número.')); }
    if (price === undefined || price === null || isNaN(Number(price))) { return res.status(400).json(buildApiResponse(false, null, 'El precio es requerido y debe ser un número.')); }

    // Verificar si ya existe un producto con este SKU PARA ESTE USUARIO
    const existingProduct = await Product.findOne({ where: { sku, userId: userId } }); // <-- FILTRO POR USER ID
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
      userId: userId, // <-- ASIGNAMOS EL USER ID AL PRODUCTO
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
  const userId = req.user.id; // <-- OBTENEMOS EL USER ID DEL TOKEN
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

    // Buscar el producto por ID y por USER ID para asegurar pertenencia
    const product = await Product.findOne({ 
      where: { id: Number(id), userId: userId } // <-- FILTRO POR USER ID
    }); 

    if (!product) {
      return res.status(404).json(buildApiResponse(false, null, 'Producto no encontrado o no pertenece a su cuenta.'));
    }

    // Si el SKU se va a cambiar, verificar unicidad DENTRO DEL USUARIO
    if (sku && sku !== product.sku) {
      const existingProductWithSku = await Product.findOne({ where: { sku, userId: userId } }); // <-- FILTRO POR USER ID
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
  const userId = req.user.id; // <-- OBTENEMOS EL USER ID DEL TOKEN
  console.log(`🔵 [Backend] Recibida petición para deleteProduct (ID: ${req.params.id}) por usuario ${userId}.`);

  try {
    const { id } = req.params;
    const result = await Product.destroy({
      where: { 
        id: Number(id), 
        userId: userId // <-- FILTRO POR USER ID
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
  const userId = req.user.id; // <-- OBTENEMOS EL USER ID DEL TOKEN
  console.log('🔵 [Backend] Recibida petición para getProducts. req.query:', req.query);
  console.log(`[Backend] Productos solicitados por el usuario ID: ${userId}`);

  try {
    const { page = 1, limit = 10, searchTerm, category, status } = req.query;

    let whereClause = { userId: userId }; // <-- INICIALIZAMOS CON EL FILTRO DE USER ID

    if (searchTerm) {
      const lowerSearchTerm = `%${String(searchTerm).toLowerCase()}%`; 
      // Combinar el filtro de userId con el searchTerm usando Op.and
      whereClause[Op.and] = [
        { userId: userId }, // Reafirmamos el filtro de userId para claridad
        { [Op.or]: [
          { name: { [Op.like]: lowerSearchTerm } },
          { description: { [Op.like]: lowerSearchTerm } },
          { sku: { [Op.like]: lowerSearchTerm } },
          { category: { [Op.like]: lowerSearchTerm } },
          { location: { [Op.like]: lowerSearchTerm } },
        ]}
      ];
    } else {
        // Si no hay searchTerm, nos aseguramos de que userId siga siendo el único filtro en el objeto principal
        whereClause = { userId: userId };
    }

    if (category && category !== 'all') {
        // Combinar con el filtro de categoría
        if (whereClause[Op.and]) {
            whereClause[Op.and].push({ category: category }); 
        } else {
            // Si solo hay userId, o si whereClause es solo { userId: userId }, añadir category directamente
            whereClause = { ...whereClause, category: category };
        }
    }

    if (status && status !== 'all') {
      const statusCondition = buildStatusCondition(status);
      if (Object.keys(statusCondition).length > 0) { 
        // Combinar con el filtro de estado
        if (whereClause[Op.and]) {
            whereClause[Op.and].push(statusCondition);
        } else {
            // Si solo hay userId o category, combinar con statusCondition
            whereClause = { ...whereClause, ...statusCondition };
        }
      }
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause, 
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


// NUEVA FUNCIÓN: getProductById (añadida de nuevo para resolver el SyntaxError)
export const getProductById = async (req, res) => {
  const userId = req.user.id; // <-- OBTENEMOS EL USER ID DEL TOKEN
  const { id } = req.params;
  console.log(`🔵 [Backend] Recibida petición para getProductById (ID: ${id}) por usuario ${userId}.`);

  try {
    const product = await Product.findOne({
      where: { 
        id: Number(id), 
        userId: userId // <-- FILTRO POR USER ID
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


export const getInventoryAnalytics = async (req, res) => {
  const userId = req.user.id; // <-- OBTENEMOS EL USER ID DEL TOKEN
  console.log(`🔵 [Backend] Recibida petición para getInventoryAnalytics por usuario ${userId}.`);

  try {
    // Contar productos solo para el usuario autenticado
    const totalProductsCount = await Product.count({ where: { userId: userId } }); // <-- FILTRO POR USER ID
    
    // Obtener todos los productos del usuario autenticado para cálculos
    const allProducts = await Product.findAll({
      where: { userId: userId }, // <-- FILTRO POR USER ID
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
        case 'In Stock':
          inStockCount++;
          break;
        case 'Low Stock':
          lowStockCount++;
          break;
        case 'Out of Stock':
          outOfStockCount++;
          break;
        case 'Overstocked':
          overstockedCount++;
          break;
        case 'Unknown':
          unknownStatusCount++;
          break;
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
        fulfillmentRate: 'N/A', 
        deliveryOnTime: 'N/A'
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

// FUNCIÓN DE ALERTAS
export const getInventoryAlerts = async (req, res) => {
  const userId = req.user.id; // <-- OBTENEMOS EL USER ID DEL TOKEN
  console.log(`🔵 [Backend] Recibida petición para getInventoryAlerts por usuario ${userId}.`);

  try {
    // Obtener todos los productos del usuario autenticado para generar alertas
    const allProducts = await Product.findAll({
      where: { userId: userId }, // <-- FILTRO POR USER ID
      attributes: ['id', 'name', 'sku', 'category', 'quantity', 'minStock', 'location', 'lastUpdated'],
    });

    const alerts = [];

    allProducts.forEach(product => {
      const quantity = Number(product.quantity) || 0;
      const minStock = Number(product.minStock) || 0;
      const status = calculateProductStatusBackend(quantity, minStock); // Reutiliza la lógica de estado

      let priority = 'Low'; // Prioridad por defecto
      let isAlert = false; // Bandera para determinar si es una alerta

      switch (status) {
        case 'Out of Stock':
          priority = 'Critical';
          isAlert = true;
          break;
        case 'Low Stock':
          priority = 'High';
          isAlert = true;
          break;
        case 'Overstocked':
          priority = 'Medium';
          isAlert = true;
          break;
        case 'Unknown':
          priority = 'Low'; // El estado desconocido también requiere atención
          isAlert = true;
          break;
        // 'In Stock' no genera una alerta, así que no se añade
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
          status: status,    // El estado calculado del producto
          priority: priority, // La prioridad asignada
          lastUpdated: product.lastUpdated,
          isRead: false, // Por defecto a false, se gestionará en el frontend
        });
      }
    });

    // Ordenar alertas por prioridad (Critical > High > Medium > Low)
    const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    alerts.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    res.status(200).json(buildApiResponse(true, alerts, 'Alertas de inventario obtenidas correctamente.'));

  } catch (error) {
    console.error('❌ Error al obtener alertas de inventario en el backend:', error);
    res.status(500).json(buildApiResponse(false, null, 'Error interno del servidor al obtener alertas.'));
  }
};
