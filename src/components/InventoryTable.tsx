import React, { useState, useEffect, useMemo } from 'react';
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
  Loader2 
} from 'lucide-react';
import { useInventory } from '../hooks/useInventory'; 
import { Product, User } from '../types/index'; 
import ProductForm from './inventory/ProductForm'; 
import InventoryService from '../api/inventoryService'; 
import axios from 'axios'; 
import { useQueryClient } from '@tanstack/react-query'; // Importa useQueryClient

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
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const [isProductFormModalOpen, setIsProductFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); 
  const [isSavingProduct, setIsSavingProduct] = useState(false); 
  const [saveProductError, setSaveProductError] = useState<string | null>(null); 
  
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<number | null>(null);

  const queryClient = useQueryClient(); // Obtiene la instancia de queryClient

  const { 
    items, 
    totalCount, 
    pagination, 
    isLoading, 
    error, 
    refetch,
    isFetching // Se ha marcado como no usado en tu reporte, pero lo podemos mantener por si se usa en el futuro para un spinner o similar
  } = useInventory({
    page: currentPage,
    limit: itemsPerPage,
    searchTerm: searchTerm,
    category: filterCategory === 'all' ? undefined : filterCategory, 
    status: filterStatus === 'all' ? undefined : filterStatus, 
  });

  const products = items; 

  useEffect(() => {
    refetch(); 
  }, [searchTerm, filterCategory, filterStatus, currentPage, refetch]);

  useMemo(() => {
    const ids = products.map((p: Product) => p.id); 
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      console.warn('⚠️ IDs de productos duplicadas encontradas! Esto puede causar problemas de renderizado:', ids);
    }
  }, [products]);

  const calculateProductStatus = (product: Product): Product['status'] => {
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

  const uniqueStatuses = ['all', 'In Stock', 'Low Stock', 'Out of Stock', 'Overstocked', 'Unknown Status']; // Se mantiene por la lista del select

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
        await InventoryService.updateProduct(editingProduct.id, productData);
      } else {
        await InventoryService.addProduct(productData);
      }
      
      await refetch(); // Refresca la tabla de inventario
      queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] }); // ¡Invalidar las alertas!
      handleCloseProductModal(); 

    } catch (err) { 
      console.error("Inventario: Error al guardar el producto (capturado en InventoryTable):", err); 
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setSaveProductError(err.response.data.message);
      } else if (err instanceof Error) {
        setSaveProductError(err.message);
      } else {
        setSaveProductError('Error desconocido al guardar el producto.');
      }
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteClick = (productId: number) => {
    setProductToDeleteId(productId); 
    setShowConfirmationModal(true); 
  };

  const handleConfirmDelete = async () => {
    if (productToDeleteId !== null) {
      try {
        await InventoryService.deleteProduct(productToDeleteId); 
        await refetch(); 
        queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] }); // ¡Invalidar las alertas también al eliminar!
      } catch (err) {
        console.error("Eliminar: Error al eliminar el producto:", err); 
        let errorMessage = 'Error desconocido al eliminar el producto.';
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        alert(`Error al eliminar: ${errorMessage}`); 
      } finally {
        setProductToDeleteId(null); 
        setShowConfirmationModal(false); 
      }
    }
  };

  const handleCancelDelete = () => {
    setProductToDeleteId(null); 
    setShowConfirmationModal(false); 
  };

  return (
    <div className="space-y-6" translate="no"> 
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
          <p className="text-slate-400 mt-1">Manage and monitor your inventory in real-time</p>
          
          {user && (
            <p className="text-slate-300 mt-2 flex items-center">
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded-md text-sm">
                Acceso de: {user.nombre}
              </span>
            </p>
          )}
        </div>
        <button 
          onClick={handleOpenAddProductModal} 
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-cyan-500/25"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6" translate="no"> 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
              translate="no" 
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} 
            className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
            translate="no" 
          >
            {uniqueCategories.map(category => (
              <option key={category} value={category} className="bg-slate-800">
                {category === 'all' ? 'All Categories' : category || 'Uncategorized'} 
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} 
            className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
            translate="no" 
          >
            <option value="all">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Overstocked">Overstocked</option>
            <option value="Unknown">Unknown Status</option> 
          </select>
        </div>
      </div>

      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm overflow-hidden" translate="no"> 
        {isLoading ? (
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
            <h3 className="text-xl text-slate-400 mb-2">No products found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria or add new products.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-slate-400 p-6 pb-0"> 
              <Filter className="w-4 h-4" />
              <span>Showing {products.length} of {totalCount} products</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50 border-b border-slate-600/50" translate="no"> 
                  <tr>
                    <th className="text-left py-4 px-6 text-slate-300 font-medium">Product</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-medium">SKU</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-medium">Category</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-medium">Quantity</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-medium">Location</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-medium">Value</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: Product) => { 
                    const currentStatus = calculateProductStatus(product); 
                    return (
                      <tr 
                        key={product.id} 
                        className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-200`} 
                        translate="no" 
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
                            {currentStatus} 
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {product.location ?? 'N/A'} 
                        </td>
                        <td className="py-4 px-6 text-white font-medium">
                          ${((product.quantity || 0) * (product.price ?? 0)).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleOpenEditProductModal(product)} 
                              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(product.id)} 
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-50/10 rounded-lg transition-all duration-200"
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
                disabled={!hasPreviousPage || isLoading}
                className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors duration-200"
              >
                Previous
              </button>
              <span className="text-slate-400">Page {currentPage} of {totalPages}</span>
              <button
                onClick={handleNextPage}
                disabled={!hasNextPage || isLoading}
                className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      <ProductForm 
        isOpen={isProductFormModalOpen}
        onClose={handleCloseProductModal} 
        onSave={handleSaveProduct}
        initialData={editingProduct} 
        isSaving={isSavingProduct}
        saveError={saveProductError}
      />

      {showConfirmationModal && (
        <ConfirmationModal
          message="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default InventoryTable;
