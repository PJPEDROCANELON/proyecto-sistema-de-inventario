// C:\Users\pedro\Desktop\project\src\components\common\ProductSearchInput.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Product, NeoStockResponse, PaginatedResponse } from '../../types';
import merchandiseInflowService from '../../api/merchandiseInflowService'; // Usamos el servicio de inflow para buscar productos
import { Search, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface ProductSearchInputProps {
  onProductSelect: (product: Product | null) => void;
  initialProduct?: Product | null; // Para pre-seleccionar un producto (ej. en edición)
  className?: string; // Para aplicar clases CSS adicionales al input
}

const ProductSearchInput: React.FC<ProductSearchInputProps> = ({ onProductSelect, initialProduct, className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Inicializar con un producto si se proporciona
  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
      setSearchTerm(initialProduct.name);
    }
  }, [initialProduct]);

  // Manejar la búsqueda de productos
  useEffect(() => {
    // Si el término de búsqueda es muy corto o es igual al nombre del producto seleccionado, no buscar
    if (searchTerm.length < 2 || (selectedProduct && selectedProduct.name === searchTerm)) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const response: NeoStockResponse<PaginatedResponse<Product>> = await merchandiseInflowService.searchProducts(searchTerm);
        if (response.success && response.data) {
          setSearchResults(response.data.items);
          setShowResults(true);
        } else {
          toast.error(response.message || 'Error al buscar productos.', { theme: "dark" });
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error en la búsqueda de productos:', error);
        toast.error('Error de conexión al buscar productos.', { theme: "dark" });
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Retraso de 300ms para evitar muchas peticiones

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedProduct]);

  // Manejar clics fuera para cerrar los resultados
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        resultsRef.current && !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedProduct(null); // Deseleccionar producto si el usuario empieza a escribir
    onProductSelect(null); // Notificar al padre que el producto ha sido deseleccionado
    setShowResults(true); // Mostrar resultados mientras el usuario escribe
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name); // Mostrar el nombre completo en el input
    onProductSelect(product); // Notificar al padre
    setShowResults(false); // Ocultar resultados
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
    setSearchTerm('');
    onProductSelect(null);
    setShowResults(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)} // Mostrar resultados al enfocar
          className={`w-full p-2 pl-10 rounded-md bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${className}`}
          placeholder="Buscar producto por nombre o SKU..."
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        {selectedProduct && searchTerm && (
          <button
            type="button"
            onClick={handleClearSelection}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400 transition-colors"
            title="Limpiar selección"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {showResults && searchTerm.length >= 2 && (
        <div ref={resultsRef} className="absolute z-10 w-full bg-slate-800 border border-slate-700 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-slate-400 text-center">Buscando...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map(product => (
              <div
                key={product.id}
                className="p-3 cursor-pointer hover:bg-slate-700 flex justify-between items-center"
                onClick={() => handleSelectProduct(product)}
              >
                <div>
                  <p className="text-white font-medium">{product.name}</p>
                  <p className="text-sm text-slate-400">SKU: {product.sku}</p>
                </div>
                <div className="text-sm text-slate-500">Stock: {product.quantity}</div>
              </div>
            ))
          ) : (
            <div className="p-3 text-slate-400 text-center">No se encontraron productos.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearchInput;
