// C:\Users\pedro\Desktop\project\src\components\inventory\ProductForm.tsx

import React, { useState, useEffect } from 'react'; // CAMBIO: Eliminada la importación de useCallback
import { Product, User } from '../../types/index'; 
import { X, Save, Loader2, DollarSign } from 'lucide-react'; 
import exchangeRateService from '../../api/exchangeRateService'; 
import { toast } from 'react-toastify';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void; 
  onSave: (productData: Partial<Product>) => Promise<void>; 
  initialData?: Product | null; 
  isSaving: boolean; 
  saveError: string | null; 
  currentUser: User | null; 
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null,
  isSaving,
  saveError,
  currentUser 
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [category, setCategory] = useState(initialData?.category || ''); 
  const [quantityInput, setQuantityInput] = useState(String(initialData?.quantity ?? '')); 
  const [minStockInput, setMinStockInput] = useState(String(initialData?.minStock ?? '')); 
  const [priceInput, setPriceInput] = useState(String(initialData?.price ?? '')); 
  const [location, setLocation] = useState(initialData?.location || '');
  const [formError, setFormError] = useState<string | null>(null); 

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  // CAMBIO: Inicializar inputCurrency con la preferencia del usuario o 'USD' por defecto
  const [inputCurrency, setInputCurrency] = useState<'USD' | 'Bs'>(
    (currentUser?.defaultCurrencySymbol === 'Bs' ? 'Bs' : 'USD') // Si la preferencia es Bs, comenzar en Bs, si no, en USD
  ); 
  const [isRateLoading, setIsRateLoading] = useState(false);

  // Función para cargar la última tasa de cambio
  const fetchLatestRate = async () => {
    setIsRateLoading(true);
    const response = await exchangeRateService.getLatestExchangeRate('USD', 'Bs');
    if (response.success && response.data) {
      setExchangeRate(Number(response.data.rate));
    } else {
      setExchangeRate(null);
      toast.warn('No se pudo obtener la última tasa de cambio. Los precios se guardarán en USD.', { theme: "dark" });
    }
    setIsRateLoading(false);
  };

  // Efecto para inicializar el formulario y cargar la tasa al abrir
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setSku(initialData?.sku || '');
      setCategory(initialData?.category || '');
      setQuantityInput(String(initialData?.quantity ?? '')); 
      setMinStockInput(String(initialData?.minStock ?? '')); 
      
      // Al editar, el precio siempre se muestra en USD (como está en la BD)
      setPriceInput(String(initialData?.price ?? '')); 
      setInputCurrency('USD'); // Al editar, la moneda de entrada siempre vuelve a USD

      setLocation(initialData?.location || '');
      setFormError(null); 
      fetchLatestRate(); // Cargar la tasa al abrir el modal
    }
  }, [isOpen, initialData]); // Dependencias: isOpen y initialData

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedQuantity = Number(quantityInput);
    const parsedMinStock = Number(minStockInput);
    let finalPriceInUSD = Number(priceInput); // Precio que se enviará al backend (siempre en USD)

    if (!name.trim()) { setFormError('El nombre del producto es requerido.'); return; }
    if (!sku.trim()) { setFormError('El SKU del producto es requerido.'); return; }
    if (!category.trim()) { setFormError('La categoría del producto es requerida.'); return; }
    
    if (isNaN(parsedQuantity) || parsedQuantity < 0) { setFormError('La cantidad es requerida y debe ser un número positivo.'); return; }
    if (isNaN(Number(priceInput)) || Number(priceInput) < 0) { setFormError('El precio es requerido y debe ser un número positivo.'); return; }
    if (isNaN(parsedMinStock) || parsedMinStock < 0) { setFormError('El stock mínimo debe ser un número positivo.'); return; }

    // Lógica de conversión de precio si se ingresó en Bs
    if (inputCurrency === 'Bs') {
      if (exchangeRate === null || exchangeRate <= 0) {
        setFormError('No se pudo obtener una tasa de cambio válida para convertir de Bs a USD. Por favor, registra una tasa o ingresa el precio en USD.');
        toast.error('No se pudo obtener una tasa de cambio válida para convertir de Bs a USD. Por favor, registra una tasa o ingresa el precio en USD.', { theme: "dark" });
        return;
      }
      finalPriceInUSD = Number(priceInput) / exchangeRate;
      // Opcional: Redondear el precio convertido si es necesario
      // finalPriceInUSD = parseFloat(finalPriceInUSD.toFixed(2)); 
    }

    const productData: Partial<Product> = {
      name: name.trim(),
      description: description.trim() || undefined, 
      sku: sku.trim(),
      category: category.trim() || undefined, 
      quantity: parsedQuantity, 
      minStock: parsedMinStock, 
      price: finalPriceInUSD, // Este es el precio que se guarda en USD
      location: location.trim() || undefined, 
    };

    if (initialData?.id) {
      productData.id = initialData.id;
    }

    try {
      await onSave(productData);
      // Después de guardar, si es un nuevo producto, resetear el input de precio a USD por defecto
      if (!initialData) {
        setPriceInput('');
        setInputCurrency('USD'); // Resetear a USD para nueva entrada
      }
    } catch (error) {
      console.error("Error al guardar desde el formulario:", error);
      // El error se maneja en el componente padre (InventoryPage)
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
              />
            </div>
            <div>
              <label htmlFor="quantity" className={labelClasses}>Cantidad <span className="text-red-400">*</span></label>
              <input 
                type="number" 
                id="quantity" 
                value={quantityInput} 
                onChange={(e) => setQuantityInput(e.target.value)} 
                className={commonInputClasses} 
                min="0" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minStock" className={labelClasses}>Mínimo Stock</label>
              <input 
                type="number" 
                id="minStock" 
                value={minStockInput} 
                onChange={(e) => setMinStockInput(e.target.value)} 
                className={commonInputClasses} 
                min="0" 
              />
            </div>
            {/* Campo de Precio con Selector de Moneda */}
            <div>
              <label htmlFor="price" className={labelClasses}>Precio <span className="text-red-400">*</span></label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  id="price" 
                  value={priceInput} 
                  onChange={(e) => setPriceInput(e.target.value)} 
                  className={commonInputClasses} 
                  min="0" 
                  step="0.01" 
                  required 
                  disabled={isRateLoading} 
                />
                <select
                  value={inputCurrency}
                  onChange={(e) => setInputCurrency(e.target.value as 'USD' | 'Bs')}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  disabled={isRateLoading}
                >
                  <option value="USD">USD</option>
                  <option value="Bs">Bs</option>
                </select>
              </div>
              {inputCurrency === 'Bs' && exchangeRate !== null && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> 1 USD = Bs {exchangeRate.toFixed(4)}
                  {isRateLoading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                </p>
              )}
              {inputCurrency === 'Bs' && exchangeRate === null && !isRateLoading && (
                <p className="text-xs text-red-400 mt-1">
                  No hay tasa de cambio disponible para Bs. El precio se guardará en USD.
                </p>
              )}
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
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || isRateLoading} 
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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