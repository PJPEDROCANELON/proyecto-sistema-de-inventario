// C:\Users\pedro\Desktop\project\src\components\inventory\ProductSellModal.tsx

import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { X, Loader2, CheckCircle } from 'lucide-react'; 
import { toast } from 'react-toastify'; 

interface ProductSellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSell: (productId: number, quantity: number, priceAtSale: number, deliveryDateExpected?: string) => Promise<void>; 
  product: Product;
  isSelling: boolean;
  sellError: string | null;
}

const ProductSellModal: React.FC<ProductSellModalProps> = ({ isOpen, onClose, onSell, product, isSelling, sellError }) => {
  const [quantityToSell, setQuantityToSell] = useState<number>(1);
  const [priceAtSale, setPriceAtSale] = useState<number>(product.price);
  const [deliveryDateExpected, setDeliveryDateExpected] = useState<string>(''); 

  useEffect(() => {
    if (isOpen) {
      setQuantityToSell(1);
      setPriceAtSale(product.price);
      setDeliveryDateExpected(''); 
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityToSell <= 0 || isNaN(quantityToSell)) {
      toast.error('La cantidad a vender debe ser un número positivo.');
      return;
    }
    if (priceAtSale <= 0 || isNaN(priceAtSale)) {
      toast.error('El precio de venta debe ser un número positivo.');
      return;
    }
    if (quantityToSell > product.quantity) {
      toast.error(`No hay suficiente stock. Stock disponible: ${product.quantity}.`);
      return;
    }

    await onSell(product.id, quantityToSell, priceAtSale, deliveryDateExpected || undefined);
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center p-4 z-50"
      translate="no" 
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative border border-slate-700"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-slate-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">
          Registrar Venta para "{product.name}"
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentQuantity" className="block text-sm font-medium text-gray-300">
              Stock Actual:
            </label>
            <p id="currentQuantity" className="mt-1 text-lg font-semibold text-purple-400">
              {product.quantity} unidades
            </p>
          </div>

          <div>
            <label htmlFor="quantityToSell" className="block text-sm font-medium text-gray-300">
              Cantidad a Vender:
            </label>
            <input
              type="number"
              id="quantityToSell"
              value={quantityToSell}
              onChange={(e) => setQuantityToSell(Number(e.target.value))}
              min="1"
              max={product.quantity} 
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-slate-700 text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="priceAtSale" className="block text-sm font-medium text-gray-300">
              Precio de Venta (por unidad):
            </label>
            <input
              type="number"
              id="priceAtSale"
              value={priceAtSale}
              onChange={(e) => setPriceAtSale(Number(e.target.value))}
              min="0.01"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-slate-700 text-white"
              required
            />
          </div>

          {/* Campo: Fecha de Entrega Prevista */}
          <div>
            <label htmlFor="deliveryDateExpected" className="block text-sm font-medium text-gray-300">
              Fecha de Entrega Prevista (Opcional):
            </label>
            <input
              type="date"
              id="deliveryDateExpected"
              value={deliveryDateExpected}
              onChange={(e) => setDeliveryDateExpected(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-slate-700 text-white"
            />
          </div>

          {sellError && (
            <div className="text-red-400 bg-red-500/20 border border-red-500/30 rounded-md p-3 text-sm mt-2 text-center">
              <p>Error: {sellError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-slate-700/50 hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              disabled={isSelling}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSelling ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700' 
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
              disabled={isSelling}
            >
              {isSelling ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2" size={18} /> Registrando...
                </span>
              ) : (
                <span className="flex items-center">
                  <CheckCircle className="mr-2" size={18} /> Confirmar Venta
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductSellModal;
