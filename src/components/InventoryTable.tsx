import React, { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { Product } from '../types';
import { mockProducts } from '../data/mockData';

const InventoryTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
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
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const statuses = ['all', ...Array.from(new Set(products.map(p => p.status)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
          <p className="text-slate-400 mt-1">Manage and monitor your inventory in real-time</p>
        </div>
        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-cyan-500/25">
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
          >
            {categories.map(category => (
              <option key={category} value={category} className="bg-slate-800">
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
          >
            {statuses.map(status => (
              <option key={status} value={status} className="bg-slate-800">
                {status === 'all' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-slate-400">
        <Filter className="w-4 h-4" />
        <span>Showing {filteredProducts.length} of {products.length} products</span>
      </div>

      {/* Table */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600/50">
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
              {filteredProducts.map((product, index) => (
                <tr 
                  key={product.id} 
                  className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-slate-800/10' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-white font-medium">{product.name}</div>
                      <div className="text-slate-400 text-sm mt-1">{product.description}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-300 font-mono text-sm">
                    {product.sku}
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-sm">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">{product.quantity}</div>
                    <div className="text-slate-400 text-sm">Min: {product.minStock}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(product.status)}`}>
                      {getStatusIcon(product.status)}
                      {product.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    {product.location}
                  </td>
                  <td className="py-4 px-6 text-white font-medium">
                    ${(product.quantity * product.price).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl text-slate-400 mb-2">No products found</h3>
          <p className="text-slate-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;