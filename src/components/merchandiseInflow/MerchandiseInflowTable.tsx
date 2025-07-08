// C:\Users\pedro\Desktop\project\src\components\merchandiseInflow\MerchandiseInflowTable.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import {
  MerchandiseInflow,
  MerchandiseInflowQueryOptions,
  PaginatedResponse,
  NeoStockResponse,
  User, 
  ExchangeRate 
} from '../../types';
import merchandiseInflowService from '../../api/merchandiseInflowService';
import exchangeRateService from '../../api/exchangeRateService'; 
import { toast } from 'react-toastify';
import {
  Search,
  Calendar, 
  Truck, 
  ChevronLeft,
  ChevronRight,
  Eye, 
  X,
  DollarSign 
} from 'lucide-react';
import { format } from 'date-fns'; // CORREGIDO: Eliminado '= '
import { es } from 'date-fns/locale'; // CORREGIDO: Eliminado '= '
import { useQuery } from '@tanstack/react-query'; // CORREGIDO: Eliminado '= '

// Componente para mostrar los detalles de una entrada de mercadería específica
interface InflowDetailsModalProps {
  inflow: MerchandiseInflow | null;
  onClose: () => void;
  user: User | null; 
  exchangeRate: ExchangeRate | null; 
}

const InflowDetailsModal: React.FC<InflowDetailsModalProps> = ({ inflow, onClose, user, exchangeRate }) => {
  // Función para formatear valores monetarios (copia de Dashboard/InventoryTable)
  const formatCurrency = useCallback((value: number | undefined | null, includeSymbol: boolean = true) => {
    if (value === undefined || value === null) return 'N/A';
    
    let displayValue = value;
    let symbol = '$'; 

    const userCurrencySymbol = user?.defaultCurrencySymbol || '$';

    if (userCurrencySymbol === 'Bs' && exchangeRate?.rate && exchangeRate.rate > 0) {
      displayValue = value * exchangeRate.rate;
      symbol = 'Bs '; 
    }

    return includeSymbol ? `${symbol}${displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [user, exchangeRate]);

  // Calcular el costo total de la entrada
  const totalInflowCost = useMemo(() => {
    if (!inflow || !inflow.inflowItems) return 0;
    return inflow.inflowItems.reduce((sum, item) => {
      const unitCost = item.unitCost !== undefined && item.unitCost !== null ? item.unitCost : 0;
      const quantity = item.quantityReceived || 0;
      return sum + (unitCost * quantity);
    }, 0);
  }, [inflow]);


  if (!inflow) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-cyan-700/50 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} /> 
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">Detalles de Entrada de Mercadería</h2>

        <div className="space-y-4 text-slate-300">
          <p><strong>Número de Referencia:</strong> <span className="text-white">{inflow.referenceNumber}</span></p>
          <p><strong>Proveedor:</strong> <span className="text-white">{inflow.supplier}</span></p>
          <p><strong>Fecha de Recepción:</strong> <span className="text-white">{format(new Date(inflow.inflowDate), 'dd/MM/yyyy', { locale: es })}</span></p>
          <p><strong>Registrado Por:</strong> <span className="text-white">{inflow.registeredBy?.username || 'N/A'} ({inflow.registeredBy?.email || 'N/A'})</span></p>
          <p><strong>Notas:</strong> <span className="text-white">{inflow.notes || 'Sin notas'}</span></p>
        </div>

        <h3 className="text-xl font-bold text-white mt-6 mb-4">Artículos Recibidos</h3>
        {inflow.inflowItems && inflow.inflowItems.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Producto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">SKU</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Cantidad</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    Costo Unit. <DollarSign className="w-3 h-3" /> 
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    Costo Total <DollarSign className="w-3 h-3" /> 
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Lote</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Fecha Venc.</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {inflow.inflowItems.map((item, index) => {
                  const itemTotalCost = (item.unitCost !== undefined && item.unitCost !== null ? item.unitCost : 0) * (item.quantityReceived || 0);
                  return (
                    <tr key={item.id || index}> 
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.inflowProduct?.name || item.productName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{item.inflowProduct?.sku || item.sku || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{item.quantityReceived}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatCurrency(item.unitCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatCurrency(itemTotalCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{item.lotNumber || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {item.expirationDate ? format(new Date(item.expirationDate), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400">No hay artículos para esta entrada.</p>
        )}

        {/* Mostrar el costo total de la entrada */}
        {inflow.inflowItems && inflow.inflowItems.length > 0 && (
          <div className="mt-6 text-right text-xl font-bold text-white">
            Costo Total de la Entrada: <span className="text-cyan-400">{formatCurrency(totalInflowCost)}</span>
          </div>
        )}
      </div>
    </div>
  );
};


// Componente principal de la tabla de entradas de mercadería
interface MerchandiseInflowTableProps {
  currentUser: User | null; 
}

const MerchandiseInflowTable: React.FC<MerchandiseInflowTableProps> = ({ currentUser }) => {
  const [inflows, setInflows] = useState<MerchandiseInflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10); 
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState(''); 

  // Estado para el modal de detalles
  const [selectedInflowForDetails, setSelectedInflowForDetails] = useState<MerchandiseInflow | null>(null);

  // Obtener la última tasa de cambio (similar a Dashboard/InventoryTable)
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

  // Función para cargar los datos de las entradas de mercadería
  const fetchMerchandiseInflows = useCallback(async () => {
    setLoading(true);
    try {
      const options: MerchandiseInflowQueryOptions = {
        page: currentPage,
        limit: limit,
        searchTerm: searchTerm || undefined,
        supplier: supplierFilter || undefined,
        startDate: startDateFilter || undefined,
        endDate: endDateFilter || undefined, 
      };
      
      const response: NeoStockResponse<PaginatedResponse<MerchandiseInflow>> = await merchandiseInflowService.getMerchandiseInflows(options);
      
      if (response.success && response.data) {
        setInflows(response.data.items);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.totalCount);
      } else {
        toast.error(response.message || 'Error al cargar entradas de mercadería.', { theme: "dark" });
        setInflows([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar entradas de mercadería en el backend:', error);
      toast.error('Error de conexión al cargar entradas de mercadería.', { theme: "dark" });
      setInflows([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, supplierFilter, startDateFilter, endDateFilter]); 

  // Efecto para cargar datos al montar o al cambiar la paginación/filtros
  useEffect(() => {
    fetchMerchandiseInflows();
  }, [fetchMerchandiseInflows]);

  // Manejo de paginación
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Manejo de filtros
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const handleSupplierFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSupplierFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStartDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDateFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleEndDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDateFilter(e.target.value); 
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSupplierFilter('');
    setStartDateFilter('');
    setEndDateFilter(''); 
    setCurrentPage(1);
  };

  // Manejo de detalles del modal
  const handleViewDetails = async (inflowId: number) => {
    try {
      setLoading(true); 
      const response = await merchandiseInflowService.getMerchandiseInflowById(inflowId);
      if (response.success && response.data) {
        setSelectedInflowForDetails(response.data);
      } else {
        toast.error(response.message || 'No se pudieron cargar los detalles de la entrada.', { theme: "dark" });
        setSelectedInflowForDetails(null); 
      }
    } catch (error) {
      console.error('❌ Error al obtener detalles de entrada:', error);
      toast.error('Error de conexión al obtener detalles de entrada.', { theme: "dark" });
      setSelectedInflowForDetails(null); 
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setSelectedInflowForDetails(null);
  };

  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6 mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Historial de Entradas de Mercadería</h2>

      {/* Sección de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por referencia, proveedor, notas..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-2 pl-10 rounded-md bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Filtrar por Proveedor..."
            value={supplierFilter}
            onChange={handleSupplierFilterChange}
            className="w-full p-2 pl-10 rounded-md bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /> 
        </div>
        <div className="relative">
          <input
            type="date"
            value={startDateFilter}
            onChange={handleStartDateFilterChange}
            className="w-full p-2 pr-2 rounded-md bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            title="Fecha de inicio"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <input
            type="date"
            value={endDateFilter}
            onChange={handleEndDateFilterChange} 
            className="w-full p-2 pr-2 rounded-md bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            title="Fecha de fin"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
        <button
          onClick={handleClearFilters}
          className="md:col-span-4 lg:col-span-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors duration-200"
        >
          Limpiar Filtros
        </button>
      </div>

      {loading || isLoadingExchangeRate ? ( 
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mr-3"></div>
          <p className="text-white">Cargando entradas...</p>
        </div>
      ) : inflows.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <p className="text-lg">No se encontraron entradas de mercadería que coincidan con los filtros.</p>
          <p className="text-sm mt-2">Intenta ajustar tus criterios de búsqueda o agrega una nueva entrada.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-700 shadow-lg">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Referencia</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Proveedor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Fecha</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Total Ítems</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Registrado Por</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {inflows.map((inflow) => (
                  <tr key={inflow.id} className="hover:bg-slate-700 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{inflow.referenceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{inflow.supplier}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{format(new Date(inflow.inflowDate), 'dd/MM/yyyy', { locale: es })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{inflow.inflowItems?.length || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{inflow.registeredBy?.username || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(inflow.id!)} 
                        className="text-cyan-400 hover:text-cyan-500 transition-colors duration-150"
                        title="Ver detalles de la entrada"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading || isLoadingExchangeRate}
              className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-slate-300">Página {currentPage} de {totalPages} ({totalCount} entradas)</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading || isLoadingExchangeRate}
              className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* Modal de detalles de entrada */}
      <InflowDetailsModal 
        inflow={selectedInflowForDetails} 
        onClose={handleCloseDetailsModal} 
        user={currentUser} 
        exchangeRate={latestExchangeRate || null} 
      />
    </div>
  );
};

export default MerchandiseInflowTable;
