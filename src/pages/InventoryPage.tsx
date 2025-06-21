// C:\Users\pedro\Desktop\project\src\pages\InventoryPage.tsx

import React from 'react';
import InventoryTable from '../components/InventoryTable'; 
import { User } from '../types/index'; // <-- CAMBIO AQUÍ

interface InventoryPageProps {
  currentUser: User | null; 
}

const InventoryPage: React.FC<InventoryPageProps> = ({ currentUser }) => {
  return (
    <div>
      <InventoryTable user={currentUser} /> 
    </div>
  );
};

export default InventoryPage;
