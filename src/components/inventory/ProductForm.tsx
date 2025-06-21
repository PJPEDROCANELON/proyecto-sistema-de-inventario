// C:\Users\pedro\Desktop\project\src\components\inventory\ProductForm.tsx

import React, { useState, useEffect } from 'react';
import { Product } from '../../types/index'; 
import { X, Save, Loader2 } from 'lucide-react'; 

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void; 
  onSave: (productData: Partial<Product>) => Promise<void>; 
  initialData?: Product | null; 
  isSaving: boolean; 
  saveError: string | null; 
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null,
  isSaving,
  saveError
}) => {
  // ATENCIÓN: Los estados para cantidad, minStock y precio ahora son STRING
  // para permitir una escritura más fluida en el input type="number"
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [category, setCategory] = useState(initialData?.category || ''); 
  const [quantityInput, setQuantityInput] = useState(String(initialData?.quantity ?? '')); // Inicializa como string
  const [minStockInput, setMinStockInput] = useState(String(initialData?.minStock ?? '')); // Inicializa como string
  const [priceInput, setPriceInput] = useState(String(initialData?.price ?? ''));         // Inicializa como string
  const [location, setLocation] = useState(initialData?.location || '');
  const [formError, setFormError] = useState<string | null>(null); 

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setSku(initialData?.sku || '');
      setCategory(initialData?.category || '');
      // Reinicializa los inputs numéricos como strings
      setQuantityInput(String(initialData?.quantity ?? '')); 
      setMinStockInput(String(initialData?.minStock ?? '')); 
      setPriceInput(String(initialData?.price ?? ''));     
      setLocation(initialData?.location || '');
      setFormError(null); 
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Convertimos las cadenas a números y realizamos la validación
    const parsedQuantity = Number(quantityInput);
    const parsedMinStock = Number(minStockInput);
    const parsedPrice = Number(priceInput);

    if (!name.trim()) { setFormError('El nombre del producto es requerido.'); return; }
    if (!sku.trim()) { setFormError('El SKU del producto es requerido.'); return; }
    if (!category.trim()) { setFormError('La categoría del producto es requerida.'); return; }
    
    if (isNaN(parsedQuantity) || parsedQuantity < 0) { setFormError('La cantidad es requerida y debe ser un número positivo.'); return; }
    if (isNaN(parsedPrice) || parsedPrice < 0) { setFormError('El precio es requerido y debe ser un número positivo.'); return; }
    if (isNaN(parsedMinStock) || parsedMinStock < 0) { setFormError('El stock mínimo debe ser un número positivo.'); return; }


    const productData: Partial<Product> = {
      name: name.trim(),
      description: description.trim() || undefined, 
      sku: sku.trim(),
      category: category.trim() || undefined, 
      quantity: parsedQuantity, // Usa el número parseado
      minStock: parsedMinStock, // Usa el número parseado
      price: parsedPrice,     // Usa el número parseado
      location: location.trim() || undefined, 
    };

    if (initialData?.id) {
      productData.id = initialData.id;
    }

    try {
      await onSave(productData);
    } catch (error) {
      console.error("Error al guardar desde el formulario:", error);
    }
  };

  const commonInputClasses = "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500";
  const labelClasses = "block text-gray-300 text-sm font-medium mb-1";

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4"
      translate="no" 
    >
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 animate-scaleIn">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {initialData ? 'Editar Producto' : 'Añadir Nuevo Producto'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-slate-700"
            translate="no" 
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {(formError || saveError) && (
            <div className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-md p-3 text-sm text-center">
              {formError || saveError}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className={labelClasses}>Nombre del Producto <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className={commonInputClasses} 
                required 
                translate="no" 
              />
            </div>
            <div>
              <label htmlFor="sku" className={labelClasses}>SKU <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                id="sku" 
                value={sku} 
                onChange={(e) => setSku(e.target.value)} 
                className={commonInputClasses} 
                required 
                translate="no" 
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className={labelClasses}>Descripción</label>
            <textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className={`${commonInputClasses} h-24 resize-y`} 
              translate="no" 
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className={labelClasses}>Categoría <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                id="category" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className={commonInputClasses} 
                required 
                translate="no" 
              />
            </div>
            <div>
              <label htmlFor="quantity" className={labelClasses}>Cantidad <span className="text-red-400">*</span></label>
              <input 
                type="number" 
                id="quantity" 
                value={quantityInput} // Usa el estado string
                onChange={(e) => setQuantityInput(e.target.value)} // Actualiza el estado string
                className={commonInputClasses} 
                min="0" 
                required 
                translate="no" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minStock" className={labelClasses}>Mínimo Stock</label>
              <input 
                type="number" 
                id="minStock" 
                value={minStockInput} // Usa el estado string
                onChange={(e) => setMinStockInput(e.target.value)} // Actualiza el estado string
                className={commonInputClasses} 
                min="0" 
                translate="no" 
              />
            </div>
            <div>
              <label htmlFor="price" className={labelClasses}>Precio <span className="text-red-400">*</span></label>
              <input 
                type="number" 
                id="price" 
                value={priceInput} // Usa el estado string
                onChange={(e) => setPriceInput(e.target.value)} // Actualiza el estado string
                className={commonInputClasses} 
                min="0" 
                step="0.01" 
                required 
                translate="no" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4"> 
            <div>
              <label htmlFor="location" className={labelClasses}>Ubicación</label>
              <input 
                type="text" 
                id="location" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                className={commonInputClasses} 
                translate="no" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              translate="no" 
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              translate="no" 
            >
              {isSaving ? (
                <span className="flex items-center gap-2"> 
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-2"> 
                  <Save className="w-5 h-5" />
                  Guardar Producto
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
