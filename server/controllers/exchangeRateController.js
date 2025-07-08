// C:\Users\pedro\Desktop\project\server\controllers\exchangeRateController.js

import ExchangeRate from '../models/ExchangeRate.js'; // Importa el nuevo modelo de Tasa de Cambio
import { buildApiResponse } from '../utils/apiResponse.js';
import { Op } from 'sequelize'; // Necesario para operadores de Sequelize

// Función para añadir una nueva tasa de cambio
export const addExchangeRate = async (req, res) => {
  // No necesitamos userId aquí, ya que las tasas de cambio son globales para la aplicación
  console.log('🔵 [Backend] Recibida petición para addExchangeRate. req.body:', req.body);

  try {
    const { date, fromCurrency, toCurrency, rate } = req.body;

    // Validaciones básicas
    if (!date || !fromCurrency || !toCurrency || rate === undefined || rate === null || isNaN(Number(rate)) || Number(rate) <= 0) {
      return res.status(400).json(buildApiResponse(false, null, 'Todos los campos (fecha, moneda origen, moneda destino, tasa) son obligatorios y la tasa debe ser un número positivo.'));
    }

    // Convertir la tasa a número
    const numericRate = Number(rate);

    // Intentar crear la tasa de cambio
    const newExchangeRate = await ExchangeRate.create({
      date,
      fromCurrency: fromCurrency.toUpperCase(), // Guardar en mayúsculas para consistencia
      toCurrency: toCurrency.toUpperCase(),     // Guardar en mayúsculas para consistencia
      rate: numericRate,
    });

    console.log('✅ Tasa de cambio añadida exitosamente en el backend:', newExchangeRate.toJSON());
    res.status(201).json(buildApiResponse(true, newExchangeRate, 'Tasa de cambio registrada correctamente.'));

  } catch (error) {
    console.error('❌ Error al añadir tasa de cambio en el backend (DETALLE):', error);
    // Manejar el error de unicidad si ya existe una tasa para esa fecha y monedas
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json(buildApiResponse(false, null, 'Ya existe una tasa de cambio registrada para esta fecha y par de monedas.'));
    }
    const errorMessage = error.message || 'Error interno del servidor al añadir la tasa de cambio.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

// Función para obtener la tasa de cambio más reciente para un par de monedas
export const getLatestExchangeRate = async (req, res) => {
  // No necesitamos userId aquí
  console.log('🔵 [Backend] Recibida petición para getLatestExchangeRate. req.query:', req.query);

  try {
    const { fromCurrency = 'USD', toCurrency = 'Bs' } = req.query; // Valores por defecto

    // Buscar la tasa más reciente para el par de monedas específico
    const latestRate = await ExchangeRate.findOne({
      where: {
        fromCurrency: String(fromCurrency).toUpperCase(),
        toCurrency: String(toCurrency).toUpperCase(),
      },
      order: [['date', 'DESC'], ['createdAt', 'DESC']], // Ordenar por fecha y luego por creación para la más reciente
    });

    if (!latestRate) {
      return res.status(404).json(buildApiResponse(false, null, `No se encontró una tasa de cambio para ${fromCurrency.toUpperCase()} a ${toCurrency.toUpperCase()}.`));
    }

    console.log('✅ Tasa de cambio más reciente obtenida exitosamente:', latestRate.toJSON());
    res.status(200).json(buildApiResponse(true, latestRate, 'Tasa de cambio más reciente obtenida correctamente.'));

  } catch (error) {
    console.error('❌ Error al obtener la tasa de cambio más reciente en el backend (DETALLE):', error);
    const errorMessage = error.message || 'Error interno del servidor al obtener la tasa de cambio.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};