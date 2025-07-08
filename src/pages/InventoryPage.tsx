// C:\Users\pedro\Desktop\project\src\pages\InventoryPage.tsx

import React from 'react';
import InventoryTable from '../components/InventoryTable'; 
import { User } from '../types/index';

interface InventoryPageProps {
  currentUser: User | null; 
  // NUEVO: Prop para forzar la actualización de la tabla de inventario
  // Esta clave cambiará cuando se registre una nueva entrada de mercadería.
  inventoryRefreshKey: number; 
}

const InventoryPage: React.FC<InventoryPageProps> = ({ currentUser, inventoryRefreshKey }) => {
  return (
    // Pasamos el inventoryRefreshKey como la 'key' del componente InventoryTable.
    // Cuando la 'key' de un componente cambia, React lo desmonta y lo vuelve a montar,
    // forzando un re-renderizado completo y, por lo tanto, una nueva carga de datos.
    <div>
      <InventoryTable user={currentUser} key={inventoryRefreshKey} /> 
    </div>
  );
};

export default InventoryPage;
