// C:\Users\pedro\Desktop\project\src\components\merchandiseInflow\MerchandiseInflowForm.tsx

import React, { useState, useEffect, useCallback } from 'react'; // Añadido useCallback
import { MerchandiseInflow, MerchandiseInflowItem, Product, NeoStockResponse, User } from '../../types'; // Añadido User
import merchandiseInflowService from '../../api/merchandiseInflowService';
import exchangeRateService from '../../api/exchangeRateService'; // NUEVO: Importar servicio de tasa de cambio
import { toast } from 'react-toastify';
import { X, Plus, Trash2, Package, DollarSign, Loader2 } from 'lucide-react'; // Añadidos DollarSign, Loader2

// Importa el componente ProductSearchInput
import ProductSearchInput from '../common/ProductSearchInput'; 

interface MerchandiseInflowFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (newInflow: MerchandiseInflow) => void; // Callback al guardar con éxito
  currentUser: User | null; // NUEVO: Pasar el currentUser para la preferencia de moneda
}

// Interfaz para el estado local de un item de entrada (incluye datos del producto para display)
interface LocalInflowItem extends MerchandiseInflowItem {
  productData?: Product; // El objeto completo del producto seleccionado
  inputCurrency?: 'USD' | 'Bs'; // Moneda seleccionada para la entrada de costo unitario de este ítem
}

const MerchandiseInflowForm: React.FC<MerchandiseInflowFormProps> = ({ isOpen, onClose, onSaveSuccess, currentUser }) => {
  // Estado para los campos principales de la entrada de mercadería
  const [formData, setFormData] = useState<MerchandiseInflow>({
    referenceNumber: '',
    supplier: '',
    inflowDate: new Date().toISOString().split('T')[0], // Fecha actual en formato ISO (YYYY-MM-DD)
    notes: '',
    inflowItems: [], // Los ítems de la entrada
  });

  // Estado para los ítems de la entrada con datos extendidos del producto
  const [inflowItems, setInflowItems] = useState<LocalInflowItem[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({}); // Errores de validación
  const [itemErrors, setItemErrors] = useState<Record<number, Record<string, string>>>({}); // Errores por item

  // NUEVOS ESTADOS PARA LA CONVERSIÓN DE MONEDA
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isRateLoading, setIsRateLoading] = useState(false);

  // Función para cargar la última tasa de cambio
  const fetchLatestRate = useCallback(async () => {
    setIsRateLoading(true);
    const response = await exchangeRateService.getLatestExchangeRate('USD', 'Bs');
    if (response.success && response.data) {
      setExchangeRate(Number(response.data.rate));
    } else {
      setExchangeRate(null);
      toast.warn('No se pudo obtener la última tasa de cambio. Los costos se guardarán en USD.', { theme: "dark" });
    }
    setIsRateLoading(false);
  }, []);

  // Efecto para inicializar el formulario si se abre y cargar la tasa
  useEffect(() => {
    if (isOpen) {
      setFormData({
        referenceNumber: '',
        supplier: '',
        inflowDate: new Date().toISOString().split('T')[0],
        notes: '',
        inflowItems: [],
      });
      setInflowItems([]);
      setErrors({});
      setItemErrors({});
      fetchLatestRate(); // Cargar la tasa al abrir el modal
    }
  }, [isOpen, fetchLatestRate]);

  if (!isOpen) return null; // No renderiza si el modal no está abierto

  // --- Manejo de cambios en los campos principales ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error al cambiar el campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // --- Manejo de cambios en los ítems de la entrada ---
  const handleItemChange = (index: number, field: keyof LocalInflowItem, value: string | number) => { 
    const updatedItems = [...inflowItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setInflowItems(updatedItems);

    // Limpiar errores específicos del ítem al cambiar
    if (itemErrors[index]?.[field]) {
      setItemErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[index]) {
          delete newErrors[index][field];
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index];
          }
        }
        return newErrors;
      });
    }
  };

  // --- Añadir un nuevo ítem de entrada ---
  const handleAddItem = () => {
    setInflowItems(prev => [
      ...prev,
      { 
        productId: 0, 
        quantityReceived: 1, 
        unitCost: 0, 
        inputCurrency: (currentUser?.defaultCurrencySymbol === 'Bs' ? 'Bs' : 'USD') // Inicializar con preferencia del usuario
      } 
    ]);
  };

  // --- Eliminar un ítem de entrada ---
  const handleRemoveItem = (index: number) => {
    setInflowItems(prev => prev.filter((_, i) => i !== index));
    setItemErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index]; // Eliminar errores asociados al ítem
      return newErrors;
    });
  };

  // --- Manejo de selección de producto en el ProductSearchInput ---
  const handleProductSelect = (index: number, product: Product | null) => { 
    const updatedItems = [...inflowItems];
    if (product) {
      updatedItems[index] = {
        ...updatedItems[index],
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        productData: product, // Guardar el objeto completo del producto para referencia
      };
    } else {
      // Si el producto es deseleccionado o no válido, limpiar los datos del producto
      updatedItems[index] = {
        ...updatedItems[index],
        productId: 0, // Resetear a un ID inválido
        productName: undefined,
        sku: undefined,
        productData: undefined,
      };
    }
    setInflowItems(updatedItems);

    // Limpiar error de producto si ya se seleccionó uno válido
    if (itemErrors[index]?.productId) {
      setItemErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[index]) {
          delete newErrors[index].productId;
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index];
          }
        }
        return newErrors;
      });
    }
  };

  // --- Lógica de validación del formulario ---
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const newItemErrors: Record<number, Record<string, string>> = {};
    let isValid = true;

    if (!formData.referenceNumber.trim()) {
      newErrors.referenceNumber = 'El número de referencia es obligatorio.';
      isValid = false;
    }
    if (!formData.supplier.trim()) {
      newErrors.supplier = 'El proveedor es obligatorio.';
      isValid = false;
    }
    if (!formData.inflowDate) {
      newErrors.inflowDate = 'La fecha de recepción es obligatoria.';
      isValid = false;
    }

    if (inflowItems.length === 0) {
      newErrors.items = 'Debe agregar al menos un artículo a la entrada.';
      isValid = false;
    } else {
      inflowItems.forEach((item, index) => {
        const currentItemErrors: Record<string, string> = {};
        if (!item.productId || item.productId === 0) {
          currentItemErrors.productId = 'Debe seleccionar un producto.';
          isValid = false;
        }
        if (!item.quantityReceived || item.quantityReceived <= 0) {
          currentItemErrors.quantityReceived = 'La cantidad debe ser mayor que cero.';
          isValid = false;
        }
        // Validar costo unitario si está presente
        if (item.unitCost !== undefined && item.unitCost < 0) {
          currentItemErrors.unitCost = 'El costo unitario no puede ser negativo.';
          isValid = false;
        }

        if (Object.keys(currentItemErrors).length > 0) {
          newItemErrors[index] = currentItemErrors;
        }
      });
    }

    setErrors(newErrors);
    setItemErrors(newItemErrors);
    return isValid;
  };

  // --- Manejo del envío del formulario ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor, corrige los errores en el formulario.', { theme: "dark" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Mapear inflowItems a la estructura esperada por el backend
      const itemsForBackend: MerchandiseInflowItem[] = await Promise.all(inflowItems.map(async (item) => {
        let finalUnitCost = item.unitCost;

        // Lógica de conversión si el costo unitario se ingresó en Bs
        if (item.inputCurrency === 'Bs') {
          if (exchangeRate === null || exchangeRate <= 0) {
            // Si no hay tasa, no podemos convertir. Mostrar error y detener.
            toast.error(`No se pudo obtener una tasa de cambio válida para convertir el costo del producto ${item.productName || item.sku || 'desconocido'} de Bs a USD.`, { theme: "dark" });
            throw new Error('No exchange rate available for conversion.'); // Lanzar error para detener el submit
          }
          if (item.unitCost !== undefined && item.unitCost !== null) {
            finalUnitCost = Number(item.unitCost) / exchangeRate;
            // Opcional: Redondear el costo convertido si es necesario
            // finalUnitCost = parseFloat(finalUnitCost.toFixed(4)); 
          }
        }

        return {
          productId: item.productId,
          quantityReceived: item.quantityReceived,
          unitCost: finalUnitCost, 
          lotNumber: item.lotNumber ? item.lotNumber.trim() : undefined,
          expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : undefined,
        };
      }));

      const payload: MerchandiseInflow = {
        ...formData,
        inflowItems: itemsForBackend,
      };

      const response: NeoStockResponse<MerchandiseInflow> = await merchandiseInflowService.createMerchandiseInflow(payload);
      if (response.success && response.data) {
        toast.success(response.message || 'Entrada de mercadería registrada con éxito.', { theme: "dark" });
        onSaveSuccess(response.data); 
      } else {
        toast.error(response.message || 'Error al registrar la entrada de mercadería.', { theme: "dark" });
        console.error('Error al registrar entrada:', response);
      }
    } catch (error: unknown) { 
      console.error('Error general al enviar el formulario:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Error de conexión o del servidor al registrar la entrada.', { theme: "dark" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonInputClasses = "w-full p-2 rounded-md bg-slate-700 text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500";
  const labelClasses = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-4xl border border-cyan-700/50 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">Registrar Nueva Entrada de Mercadería</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección de Datos Generales de la Entrada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-700/30 p-4 rounded-lg border border-slate-600">
            <div>
              <label htmlFor="referenceNumber" className={labelClasses}>Número de Referencia:</label>
              <input
                type="text"
                id="referenceNumber"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                className={`${commonInputClasses} ${errors.referenceNumber ? 'border-red-500' : 'border-slate-600'}`}
                placeholder="Ej. Factura #12345"
              />
              {errors.referenceNumber && <p className="text-red-400 text-xs mt-1">{errors.referenceNumber}</p>}
            </div>
            <div>
              <label htmlFor="supplier" className={labelClasses}>Proveedor:</label>
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className={`${commonInputClasses} ${errors.supplier ? 'border-red-500' : 'border-slate-600'}`}
                placeholder="Ej. Suministros ABC"
              />
              {errors.supplier && <p className="text-red-400 text-xs mt-1">{errors.supplier}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="inflowDate" className={labelClasses}>Fecha de Recepción:</label>
              <input
                type="date"
                id="inflowDate"
                name="inflowDate"
                value={formData.inflowDate}
                onChange={handleChange}
                className={`${commonInputClasses} ${errors.inflowDate ? 'border-red-500' : 'border-slate-600'}`}
              />
              {errors.inflowDate && <p className="text-red-400 text-xs mt-1">{errors.inflowDate}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="notes" className={labelClasses}>Notas (opcional):</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className={`${commonInputClasses} resize-y`}
                placeholder="Cualquier observación sobre la recepción..."
              ></textarea>
            </div>
          </div>

          {/* Sección de Artículos de la Entrada */}
          <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400"/>
              Artículos Recibidos
            </h3>
            {inflowItems.length === 0 && (
              <p className="text-slate-400 text-center py-4">Aún no se han añadido artículos.</p>
            )}

            <div className="space-y-4">
              {inflowItems.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row items-end gap-3 p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-md">
                  {/* Product input */}
                  <div className="w-full md:w-2/5">
                    <label className={labelClasses}>Producto:</label>
                    <ProductSearchInput
                      onProductSelect={(product: Product | null) => handleProductSelect(index, product)} 
                      initialProduct={item.productData || null}
                      className={itemErrors[index]?.productId ? 'border-red-500' : 'border-slate-600'}
                    />
                    {itemErrors[index]?.productId && <p className="text-red-400 text-xs mt-1">{itemErrors[index].productId}</p>}
                    {item.productData && (
                      <p className="text-xs text-slate-500 mt-1">
                        SKU: {item.productData.sku} | Cantidad en stock: {item.productData.quantity}
                      </p>
                    )}
                  </div>
                  
                  {/* Quantity input */}
                  <div className="w-full md:w-1/5">
                    <label className={labelClasses}>Cantidad:</label>
                    <input
                      type="number"
                      value={item.quantityReceived || ''}
                      onChange={(e) => handleItemChange(index, 'quantityReceived', Number(e.target.value))}
                      className={`${commonInputClasses} ${itemErrors[index]?.quantityReceived ? 'border-red-500' : 'border-slate-600'}`}
                      min="1"
                    />
                    {itemErrors[index]?.quantityReceived && <p className="text-red-400 text-xs mt-1">{itemErrors[index].quantityReceived}</p>}
                  </div>

                  {/* Unit Cost input with currency selector */}
                  <div className="w-full md:w-1/5">
                    <label className={labelClasses}>Costo Unitario (opc.):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.unitCost || ''}
                        onChange={(e) => handleItemChange(index, 'unitCost', Number(e.target.value))}
                        className={`${commonInputClasses} ${itemErrors[index]?.unitCost ? 'border-red-500' : 'border-slate-600'}`}
                        step="0.01"
                        min="0"
                        disabled={isRateLoading}
                      />
                      <select
                        value={item.inputCurrency || 'USD'} // Usar el estado del ítem o 'USD' por defecto
                        onChange={(e) => handleItemChange(index, 'inputCurrency', e.target.value as 'USD' | 'Bs')}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        disabled={isRateLoading}
                      >
                        <option value="USD">USD</option>
                        <option value="Bs">Bs</option>
                      </select>
                    </div>
                    {item.inputCurrency === 'Bs' && exchangeRate !== null && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> 1 USD = Bs {exchangeRate.toFixed(4)}
                        {isRateLoading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                      </p>
                    )}
                    {item.inputCurrency === 'Bs' && exchangeRate === null && !isRateLoading && (
                      <p className="text-xs text-red-400 mt-1">
                        No hay tasa de cambio disponible para Bs. El costo se guardará en USD.
                      </p>
                    )}
                    {itemErrors[index]?.unitCost && <p className="text-red-400 text-xs mt-1">{itemErrors[index].unitCost}</p>}
                  </div>

                  {/* Lot input */}
                  <div className="w-full md:w-1/10">
                    <label className={labelClasses}>Lote (opc.):</label>
                    <input
                      type="text"
                      value={item.lotNumber || ''}
                      onChange={(e) => handleItemChange(index, 'lotNumber', e.target.value)}
                      className={`${commonInputClasses} border-slate-600`}
                    />
                  </div>

                  {/* Expiration Date input */}
                  <div className="w-full md:w-1/10">
                    <label className={labelClasses}>Fecha Venc. (opc.):</label>
                    <input
                      type="date"
                      value={item.expirationDate || ''}
                      onChange={(e) => handleItemChange(index, 'expirationDate', e.target.value)}
                      className={`${commonInputClasses} border-slate-600`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-400 hover:text-red-500 transition-colors self-center md:self-end flex-shrink-0"
                    title="Eliminar artículo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {errors.items && <p className="text-red-400 text-xs mt-2">{errors.items}</p>}

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-4 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Añadir Artículo
            </button>
          </div>

          {/* Botones de Acción del Formulario */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2"
              disabled={isSubmitting || isRateLoading} // Deshabilitar si la tasa está cargando
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
                  Guardando...
                </>
              ) : (
                'Guardar Entrada'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchandiseInflowForm;