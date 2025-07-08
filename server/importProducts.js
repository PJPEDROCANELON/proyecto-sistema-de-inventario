// C:\Users\pedro\Desktop\project\server\importProducts.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './config/database.js'; // Asegúrate de que esta ruta sea correcta
import Product from './models/Product.js';
import User from './models/User.js';

// --- Configuración ---
const USER_EMAIL_TO_IMPORT_FOR = 'canelonpedro1@gmail.com';
const PRODUCTS_JSON_FILE = 'products_to_import.json'; // Asegúrate de que este sea el nombre de tu archivo JSON

// Obtener el directorio actual para resolver rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegúrate de que la carpeta 'data' exista dentro de 'server'
const jsonDirectory = path.join(__dirname, 'data');
const jsonFilePath = path.join(jsonDirectory, PRODUCTS_JSON_FILE);

async function importProducts() {
    console.log('--- Iniciando Importación Masiva de Productos ---');
    console.log(`Buscando usuario: ${USER_EMAIL_TO_IMPORT_FOR}`);
    console.log(`Esperando archivo de productos en: ${jsonFilePath}`);

    let transaction;
    try {
        // 1. Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');

        // 2. Encontrar el ID del usuario
        const user = await User.findOne({ where: { email: USER_EMAIL_TO_IMPORT_FOR } });

        if (!user) {
            console.error(`❌ Error: Usuario con email "${USER_EMAIL_TO_IMPORT_FOR}" no encontrado.`);
            console.error('Asegúrate de que el usuario exista en tu base de datos antes de ejecutar el script.');
            return;
        }

        const userId = user.id;
        console.log(`🔍 Usuario encontrado: ${user.username} (ID: ${userId})`);

        // 3. Leer el archivo JSON de productos
        if (!fs.existsSync(jsonFilePath)) {
            console.error(`❌ Error: El archivo JSON "${jsonFilePath}" no se encontró.`);
            console.error('Asegúrate de haber creado el archivo con la lista de productos en la ruta especificada.');
            return;
        }

        const productsDataRaw = fs.readFileSync(jsonFilePath, 'utf8');
        const productsToImport = JSON.parse(productsDataRaw);
        console.log(`📄 ${productsToImport.length} productos encontrados en el archivo JSON.`);

        if (productsToImport.length === 0) {
            console.warn('⚠️ No hay productos para importar en el archivo JSON. Saliendo.');
            return;
        }

        // Obtener los SKUs existentes para este usuario para evitar duplicados
        const existingProducts = await Product.findAll({
            where: { userId: userId },
            attributes: ['sku']
        });
        const existingSkus = new Set(existingProducts.map(p => p.sku));

        const productsToCreate = [];
        const skippedProducts = [];

        // Validar y preparar los productos para la inserción masiva
        for (const product of productsToImport) {
            // Convertir tipos si es necesario
            const quantity = Number(product.quantity);
            const minStock = Number(product.minStock);
            const price = Number(product.price);

            // Validar campos obligatorios y SKU
            if (!product.name || !product.sku || !product.category || isNaN(quantity) || isNaN(price)) {
                console.warn(`⚠️ Saltando producto inválido (faltan campos o tipos incorrectos): ${JSON.stringify(product)}`);
                skippedProducts.push(product);
                continue;
            }

            // Validar si el SKU ya existe para este usuario
            if (existingSkus.has(product.sku)) {
                console.warn(`⚠️ Saltando producto con SKU "${product.sku}" porque ya existe para este usuario.`);
                skippedProducts.push(product);
                continue;
            }

            // Validar el estado si está presente, si no, usar 'Unknown' o 'In Stock' si quantity > 0
            let productStatus = product.status;
            const validStatuses = ['In Stock', 'Low Stock', 'Out of Stock', 'Overstocked', 'Unknown'];
            if (!productStatus || !validStatuses.includes(productStatus)) {
                // Inferir un estado básico si no es válido
                if (quantity === 0) {
                    productStatus = 'Out of Stock';
                } else if (minStock > 0 && quantity <= minStock) {
                    productStatus = 'Low Stock';
                } else if (quantity > 0) {
                    productStatus = 'In Stock';
                } else {
                    productStatus = 'Unknown';
                }
            }


            productsToCreate.push({
                name: product.name,
                description: product.description || null, // Permite null
                sku: product.sku,
                category: product.category,
                quantity: quantity,
                minStock: minStock,
                price: price,
                status: productStatus,
                location: product.location || null, // Permite null
                lastUpdated: new Date(),
                userId: userId,
            });
            existingSkus.add(product.sku); // Añadir el SKU para evitar duplicados en la misma importación
        }

        if (productsToCreate.length === 0) {
            console.warn('⚠️ No hay productos válidos para importar después de las validaciones. Saliendo.');
            if (skippedProducts.length > 0) {
                console.warn(`Productos saltados debido a errores o duplicados: ${skippedProducts.length}`);
            }
            return;
        }

        // 4. Iniciar una transacción
        transaction = await sequelize.transaction();
        console.log('🔄 Iniciando transacción para la importación...');

        // 5. Insertar productos en masa
        const createdProducts = await Product.bulkCreate(productsToCreate, {
            transaction: transaction,
            validate: true // Esto aplicará las validaciones del modelo de Sequelize
        });

        await transaction.commit();
        console.log(`🎉 ¡Importación masiva completada! Se añadieron ${createdProducts.length} productos.`);

        if (skippedProducts.length > 0) {
            console.warn(`⚠️ Se saltaron ${skippedProducts.length} productos debido a SKUs duplicados o datos inválidos.`);
            console.warn('Revisa los logs anteriores para ver detalles de los productos saltados.');
        }

    } catch (error) {
        if (transaction && !transaction.finished) {
            await transaction.rollback();
            console.error('🚫 Transacción revertida debido a un error.');
        }
        console.error('❌ Error durante la importación masiva:', error.message);
        console.error('Detalles del error:', error);
    } finally {
        await sequelize.close();
        console.log('🔌 Conexión a la base de datos cerrada.');
        console.log('--- Fin de la Importación Masiva ---');
    }
}

importProducts();