// C:\Users\pedro\Desktop\project\src\components\settings\AboutSettings.tsx

import React from 'react';

// ELIMINADA: La interfaz AboutSettingsProps ya no es necesaria
// interface AboutSettingsProps {
//   // Podrías añadir isLoading o error si SettingsPage los pasa en el futuro
//   // isLoading?: boolean;
//   // error?: string | null;
// }

// CAMBIADO: React.FC sin un tipo de props específico, o con un objeto vacío si prefieres ser explícito
const AboutSettings: React.FC = () => { // O React.FC<{}>
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm p-6 text-white">
      <h3 className="text-xl font-semibold text-white mb-4">Acerca de NeoStock</h3>
      <p className="text-gray-300 mb-4">
        Descubre más sobre la aplicación NeoStock, su versión, créditos y enlaces útiles.
      </p>

      <div className="bg-slate-700/50 p-4 rounded-lg mt-4 text-slate-300">
        <h4 className="font-semibold text-white mb-2">Versión</h4>
        <p>Versión actual: 1.0.0 (Beta)</p>
      </div>

      <div className="bg-slate-700/50 p-4 rounded-lg mt-4 text-slate-300">
        <h4 className="font-semibold text-white mb-2">Créditos</h4>
        <p>Desarrollado por:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Pedro Canelón</li>
          <li>Genesis Torrealba</li>
          <li>Fanny Hernandez</li>
          <li>Eleidys Loyo</li>
          <li>Jhoangelis Pacheco</li>
        </ul>
        <p className="mt-2">Diseño e Interfaz: Inspirado en estética cyberpunk.</p>
      </div>

      <div className="bg-slate-700/50 p-4 rounded-lg mt-4 text-slate-300">
        <h4 className="font-semibold text-white mb-2">Enlaces Útiles</h4>
        <ul className="list-disc list-inside ml-4">
          <li><a href="#" className="text-purple-400 hover:underline">Soporte Técnico</a></li>
          <li><a href="#" className="text-purple-400 hover:underline">Documentación</a></li>
          <li><a href="#" className="text-purple-400 hover:underline">Política de Privacidad</a></li>
        </ul>
      </div>
    </div>
  );
};

export default AboutSettings;
