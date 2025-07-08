// C:\Users\pedro\Desktop\project\src\components\InventoryTable.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react'; 
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Package,
  Loader2,
  ShoppingCart,
  DollarSign 
} from 'lucide-react';
import { useInventory } from '../hooks/useInventory'; 
import inventoryService from '../api/inventoryService'; 
import exchangeRateService from '../api/exchangeRateService'; 
import { Product, User, ProductStatus, ExchangeRate } from '../types'; 
import ProductForm from './inventory/ProductForm'; 
import axios from 'axios'; 
import { useQueryClient, useQuery } from '@tanstack/react-query'; 
import ProductSellModal from './inventory/ProductSellModal'; 
import { toast } from 'react-toastify'; 

// Componente de Modal de Confirmación
interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50" translate="no">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm m-4 sm:m-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Acción</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};


interface InventoryTableProps {
  user: User | null; 
}

const InventoryTable: React.FC<InventoryTableProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<ProductStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const [isProductFormModalOpen, setIsProductFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); 
  const [isSavingProduct, setIsSavingProduct] = useState(false); 
  const [saveProductError, setSaveProductError] = useState<string | null>(null); 
  
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<number | null>(null);

  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [productToSell, setProductToSell] = useState<Product | null>(null);
  const [isRecordingSale, setIsRecordingSale] = useState(false);
  const [saleError, setSaleError] = useState<string | null>(null);

  const queryClient = useQueryClient(); 

  const userCurrencySymbol = user?.defaultCurrencySymbol || '$';

  const {
    data: latestExchangeRate,
    isLoading: isLoadingExchangeRate,
  } = useQuery<ExchangeRate | null, Error>({
    queryKey: ['latestExchangeRate', 'USD', 'Bs'],
    queryFn: async (): Promise<ExchangeRate | null> => { 
      const res = await exchangeRateService.getLatestExchangeRate('USD', 'Bs');
      return res.success && res.data ? res.data : null; 
    },
    staleTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });

  const { 
    items, 
    totalCount, 
    pagination, 
    isLoading, 
    error, 
    isFetching,
  } = useInventory({
    page: currentPage,
    limit: itemsPerPage,
    searchTerm: searchTerm,
    category: filterCategory === 'all' ? undefined : filterCategory, 
    status: filterStatus === 'all' ? undefined : filterStatus, 
  });

  const products = items; 

  // CAMBIO: useEffect para usar la importación y evitar la advertencia
  useEffect(() => {
    // Este useEffect ahora tiene un propósito simple para usar la importación.
    // En un caso real, aquí podrías tener lógica que dependa de los productos,
    // pero que no sea parte de useQuery.
    if (products.length > 0) {
      console.log(`Productos cargados: ${products.length}`);
    }
  }, [products]);


  // Función para formatear valores monetarios
  const formatCurrency = useCallback((value: number | undefined | null, includeSymbol: boolean = true) => {
    if (value === undefined || value === null) return 'N/A';
    
    let displayValue = value;
    let symbol = '$'; 

    if (userCurrencySymbol === 'Bs' && latestExchangeRate?.rate && latestExchangeRate.rate > 0) {
      displayValue = value * latestExchangeRate.rate;
      symbol = 'Bs '; 
    }

    return includeSymbol ? `${symbol}${displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [userCurrencySymbol, latestExchangeRate]);


  const calculateProductStatus = (product: Product): ProductStatus => {
    const { quantity, minStock } = product;
    if (quantity === 0) {
      return 'Out of Stock';
    } else if (minStock !== undefined && quantity <= minStock) {
      return 'Low Stock';
    } else if (minStock !== undefined && quantity > minStock * 2) { 
      return 'Overstocked';
    } else if (quantity > 0) {
      return 'In Stock';
    }
    return 'Unknown'; 
  };

  const getStatusIcon = (product: Product) => {
    const status = calculateProductStatus(product); 
    switch (status) {
      case 'In Stock':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'Low Stock':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'Out of Stock':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'Overstocked':
        return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      default: 
        return <Package className="w-4 h-4 text-gray-400" />; 
    }
  };

  const getStatusColor = (product: Product) => {
    const status = calculateProductStatus(product); 
    switch (status) {
      case 'In Stock':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Low Stock':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Out of Stock':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Overstocked':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: 
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    products.forEach(p => {
      if (p.category) {
        categories.add(p.category);
      }
    });
    const sortedCategories = Array.from(categories).sort((a, b) => a.localeCompare(b));
    return ['all', ...sortedCategories];
  }, [products]); 

  const totalPages = pagination?.totalPages || 1;
  const hasNextPage = pagination?.hasNextPage || false;
  const hasPreviousPage = pagination?.hasPreviousPage || false;

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1); 
    }
  };

  const handleOpenAddProductModal = () => {
    setEditingProduct(null); 
    setIsProductFormModalOpen(true);
    setSaveProductError(null); 
  };

  const handleOpenEditProductModal = (product: Product) => {
    setEditingProduct(product); 
    setIsProductFormModalOpen(true);
    setSaveProductError(null); 
  };

  const handleCloseProductModal = () => {
    setIsProductFormModalOpen(false);
    setEditingProduct(null); 
    setSaveProductError(null); 
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    setIsSavingProduct(true);
    setSaveProductError(null);
    try {
      if (editingProduct && editingProduct.id) {
        await inventoryService.updateProduct(editingProduct.id, productData);
        toast.success(`Producto "${productData.name}" actualizado con éxito.`, { theme: "dark" }); 
      } else {
        await inventoryService.addProduct(productData);
        toast.success(`Producto "${productData.name}" añadido con éxito.`, { theme: "dark" }); 
      }
      
      queryClient.invalidateQueries({ queryKey: ['products'] }); 
      queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] }); 
      queryClient.invalidateQueries({ queryKey: ['inventoryAnalytics'] }); 
      
      handleCloseProductModal(); 

    } catch (err: unknown) {
      console.error("Inventario: Error al guardar el producto (capturado en InventoryTable):", err); 
      let errorMessage = 'Error desconocido al guardar el producto.';
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setSaveProductError(errorMessage);
      toast.error(`Error al guardar: ${errorMessage}`, { theme: "dark" }); 
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteClick = (productId: number) => {
    setProductToDeleteId(productId); 
    setShowConfirmationModal(true); 
  };

  const handleCancelDelete = () => {
    setProductToDeleteId(null);
    setShowConfirmationModal(false);
  };

  const handleConfirmDelete = async () => {
    if (productToDeleteId !== null) {
      try {
        await inventoryService.deleteProduct(productToDeleteId); 
        toast.success(`Producto eliminado con éxito.`, { theme: "dark" }); 
        queryClient.invalidateQueries({ queryKey: ['products'] }); 
        queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] }); 
        queryClient.invalidateQueries({ queryKey: ['inventoryAnalytics'] }); 
      } catch (err: unknown) {
        console.error("Eliminar: Error al eliminar el producto:", err); 
        let errorMessage = 'Error desconocido al eliminar el producto.';
        if (axios.isAxiosError(err)) {
          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        toast.error(`Error al eliminar: ${errorMessage}`, { theme: "dark" }); 
      } finally {
        setProductToDeleteId(null); 
        setShowConfirmationModal(false); 
      }
    }
  };

  const handleOpenSellProductModal = (product: Product) => {
    setProductToSell(product);
    setIsSellModalOpen(true);
    setSaleError(null); 
  };

  const handleCloseSellModal = () => {
    setIsSellModalOpen(false);
    setProductToSell(null);
    setSaleError(null);
  };

  const handleRecordSale = async (productId: number, quantity: number, priceAtSale: number, deliveryDateExpected?: string) => {
    setIsRecordingSale(true);
    setSaleError(null);
    try {
      await inventoryService.recordSale({ productId, quantity, priceAtSale, deliveryDateExpected });
      toast.success(`Venta de ${quantity} unidades de "${productToSell?.name}" registrada con éxito.`, { theme: "dark" }); 
      
      queryClient.invalidateQueries({ queryKey: ['products'] }); 
      queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] }); 
      queryClient.invalidateQueries({ queryKey: ['inventoryAnalytics'] }); 
      queryClient.invalidateQueries({ queryKey: ['orders'] }); 

      handleCloseSellModal();
    } catch (err: unknown) {
      console.error("Venta: Error al registrar la venta (capturado en InventoryTable):", err);
      let errorMessage = 'Error desconocido al registrar la venta.';
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setSaleError(errorMessage);
      toast.error(`Error al registrar venta: ${errorMessage}`, { theme: "dark" });
    } finally {
      setIsRecordingSale(false);
    }
  };


  return (
    <>
      <div className="space-y-6"> 
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestión de Inventario</h1>
            <p className="text-slate-400 mt-1">Administra y monitorea tu inventario en tiempo real</p>
            
            {user && (
              <p className="text-slate-300 mt-2 flex items-center">
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded-md text-sm">
                  Acceso de: {user.username}
                </span>
              </p>
            )}
          </div>
          <button 
            onClick={handleOpenAddProductModal} 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-cyan-500/25"
          >
            <Plus className="w-5 h-5" />
            Añadir Producto 
          </button>
        </div>

        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6"> 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar productos..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} 
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
            >
              {uniqueCategories.map(category => (
                <option key={category} value={category} className="bg-slate-800">
                  {category === 'all' ? 'Todas las Categorías' : category || 'Sin Categoría'} 
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value as ProductStatus | 'all'); setCurrentPage(1); }} 
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
            >
              <option value="all">Todos los Estados</option> 
              <option value="In Stock">En Stock</option> 
              <option value="Low Stock">Poco Stock</option> 
              <option value="Out of Stock">Sin Stock</option> 
              <option value="Overstocked">Sobrestock</option> 
              <option value="Unknown">Estado Desconocido</option> 
            </select>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm overflow-hidden"> 
          {isLoading || isFetching || isLoadingExchangeRate ? ( 
            <div className="text-center py-12 flex justify-center items-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mr-2" /> Cargando productos...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">
              <p>Error al cargar productos: {error instanceof Error ? error.message : String(error)}</p>
              <p>Asegúrate de que tu backend esté funcionando y los endpoints de inventario estén configurados.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl text-slate-400 mb-2">No se encontraron productos</h3> 
              <p className="text-slate-500">Intenta ajustar tu búsqueda o criterios de filtro o añade nuevos productos.</p> 
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-slate-400 p-6 pb-0"> 
                <Filter className="w-4 h-4" />
                <span>Mostrando {products.length} de {totalCount} productos</span> 
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50 border-b border-slate-600/50"> 
                    <tr>
                      <th className="text-left py-4 px-6 text-slate-300 font-medium">Producto</th> 
                      <th className="text-left py-4 px-6 text-slate-300 font-medium">SKU</th>
                      <th className="text-left py-4 px-6 text-slate-300 font-medium">Categoría</th> 
                      <th className="text-left py-4 px-6 text-slate-300 font-medium">Cantidad</th> 
                      <th className="text-left py-4 px-6 text-slate-300 font-medium">Estado</th> 
                      <th className="text-left py-4 px-6 text-slate-300 font-medium">Ubicación</th> 
                      <th className="text-left py-4 px-6 text-slate-300 font-medium flex items-center gap-1">
                        Precio Unitario <DollarSign className="w-4 h-4" /> {/* CAMBIO: Usar DollarSign aquí */}
                      </th> 
                      <th className="text-left py-4 px-6 text-slate-300 font-medium">Valor Total</th> 
                      <th className="text-left py-4 px-6 text-slate-300 font-medium">Acciones</th> 
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: Product) => { 
                      const currentStatus = calculateProductStatus(product); 
                      return (
                        <tr 
                          key={product.id} 
                          className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-200`} 
                        >
                          <td className="py-4 px-6">
                            <div>
                              <div className="text-white font-medium">{product.name}</div>
                              <div className="text-slate-400 text-sm mt-1">{product.description ?? 'N/A'}</div> 
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-300 font-mono text-sm">
                            {product.sku}
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-sm">
                              {product.category ?? 'N/A'} 
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-white font-medium">{product.quantity}</div>
                            <div className="text-slate-400 text-sm">Min: {product.minStock ?? 'N/A'}</div> 
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(product)}`}>
                              {getStatusIcon(product)}
                              {currentStatus === 'In Stock' && 'En Stock'} 
                              {currentStatus === 'Low Stock' && 'Poco Stock'} 
                              {currentStatus === 'Out of Stock' && 'Sin Stock'} 
                              {currentStatus === 'Overstocked' && 'Sobrestock'} 
                              {currentStatus === 'Unknown' && 'Desconocido'} 
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-300">
                            {product.location ?? 'N/A'} 
                          </td>
                          <td className="py-4 px-6 text-white font-medium">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="py-4 px-6 text-white font-medium">
                            {formatCurrency((product.quantity || 0) * (product.price ?? 0))}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button 
                                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200"
                                title="Ver Detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleOpenEditProductModal(product)} 
                                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                                title="Editar Producto"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleOpenSellProductModal(product)} 
                                className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-200"
                                title="Registrar Venta"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(product.id)} 
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-50/10 rounded-lg transition-all duration-200"
                                title="Eliminar Producto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-6 p-6 pt-0"> 
                <button
                  onClick={handlePrevPage}
                  disabled={!hasPreviousPage || isLoading || isFetching || isLoadingExchangeRate} 
                  className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors duration-200"
                >
                  Anterior
                </button>
                <span className="text-slate-400">Página {currentPage} de {totalPages}</span>
                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage || isLoading || isFetching || isLoadingExchangeRate} 
                  className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors duration-200"
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ProductForm 
        isOpen={isProductFormModalOpen}
        onClose={handleCloseProductModal} 
        onSave={handleSaveProduct}
        initialData={editingProduct} 
        isSaving={isSavingProduct}
        saveError={saveProductError}
        currentUser={user} 
      />

      {isSellModalOpen && productToSell && (
        <ProductSellModal
          isOpen={isSellModalOpen}
          onClose={handleCloseSellModal}
          onSell={handleRecordSale}
          product={productToSell} 
          isSelling={isRecordingSale}
          sellError={saleError}
        />
      )}

      {showConfirmationModal && (
        <ConfirmationModal
          message="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
};

export default InventoryTable;