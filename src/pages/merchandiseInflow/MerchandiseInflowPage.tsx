// C:\Users\pedro\Desktop\project\src\pages\merchandiseInflow\MerchandiseInflowPage.tsx

import React, { useState, useRef } from 'react'; 
import { Plus } from 'lucide-react'; 
import MerchandiseInflowForm from '../../components/merchandiseInflow/MerchandiseInflowForm';
import MerchandiseInflowTable from '../../components/merchandiseInflow/MerchandiseInflowTable';
import { MerchandiseInflow, User } from '../../types'; // Importar User

interface MerchandiseInflowPageProps {
  onMerchandiseInflowSave: () => void; 
  currentUser: User | null; // NUEVO: Añadir currentUser como prop
}

const MerchandiseInflowPage: React.FC<MerchandiseInflowPageProps> = ({ onMerchandiseInflowSave, currentUser }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const tableRefreshKey = useRef(0); 

  const handleOpenFormModal = () => {
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    console.log("MerchandiseInflowPage: Llamando a handleCloseFormModal para cerrar el modal.");
    setIsFormModalOpen(false);
  };

  const handleMerchandiseInflowSaveSuccess = (newInflow: MerchandiseInflow) => {
    console.log('🎉 Nueva entrada de mercadería registrada con éxito:', newInflow);
    tableRefreshKey.current += 1; 
    
    console.log("MerchandiseInflowPage: Intentando llamar a onMerchandiseInflowSave.");
    if (typeof onMerchandiseInflowSave === 'function') {
      onMerchandiseInflowSave(); 
      console.log("MerchandiseInflowPage: onMerchandiseInflowSave llamado con éxito.");
    } else {
      console.error("MerchandiseInflowPage: onMerchandiseInflowSave NO ES UNA FUNCIÓN, no se pudo refrescar el inventario.");
    }
    
    console.log("MerchandiseInflowPage: Cerrando el modal después de guardar con éxito.");
    setIsFormModalOpen(false); 
  };

  return (
    <div className="space-y-6 p-4 md:p-8 bg-gray-900 text-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Entrada de Mercadería</h1>
          <p className="text-slate-400 mt-1">Registra y visualiza la mercadería que ingresa a tu inventario.</p>
        </div>
        <button 
          onClick={handleOpenFormModal} 
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-green-500/25"
        >
          <Plus className="w-5 h-5" />
          Registrar Nueva Entrada
        </button>
      </div>

      {/* CAMBIO CLAVE: Pasar currentUser a MerchandiseInflowTable */}
      <MerchandiseInflowTable key={tableRefreshKey.current} currentUser={currentUser} />

      <MerchandiseInflowForm 
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal} 
        onSaveSuccess={handleMerchandiseInflowSaveSuccess} 
        currentUser={currentUser} // Asegurarse de pasar currentUser si MerchandiseInflowForm lo necesita
      />
    </div>
  );
};

export default MerchandiseInflowPage;
