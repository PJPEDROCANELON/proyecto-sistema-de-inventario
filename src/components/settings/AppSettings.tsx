// C:\Users\pedro\Desktop\project\src\components\settings\AppSettings.tsx

import React from 'react';
// Eliminamos las importaciones de User, useState, useEffect, toast, axios
// ya que este componente será estático por ahora.

// La interfaz de props se simplifica considerablemente.
interface AppSettingsProps {
  // Mantendremos isLoading y error por si SettingsPage todavía las pasa,
  // aunque AppSettings no las usará activamente para guardar.
  isLoading?: boolean; // Hacemos opcional por si no se necesitan pasar
  error?: string | null; // Hacemos opcional
}

const AppSettings: React.FC<AppSettingsProps> = ({ isLoading, error }) => {
  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6 text-center">
      <h3 className="text-xl font-semibold text-white mb-4">Preferencias de la Aplicación</h3>
      <p className="text-gray-300 mb-4">
        Esta área está actualmente en mantenimiento.
      </p>
      <p className="text-gray-400 text-sm">
        Estará disponible para la próxima actualización con nuevas opciones de personalización.
      </p>
      {/* Puedes dejar aquí un indicador de carga o error si quieres que se muestre,
          pero por ahora no hay lógica activa que los use. */}
      {isLoading && (
        <p className="text-blue-400 mt-4">Cargando...</p>
      )}
      {error && (
        <p className="text-red-400 mt-4">Error: {error}</p>
      )}
    </div>
  );
};

export default AppSettings;
