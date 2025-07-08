// C:\Users\pedro\Desktop\project\src\pages\OrdersPage.tsx

import React, { useState, useEffect, useCallback } from 'react'; 
import { useNavigate } from 'react-router-dom';
import inventoryService from '../api/inventoryService'; 
import exchangeRateService from '../api/exchangeRateService'; 
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns'; 
import { es } from 'date-fns/locale';
import axios from 'axios'; 
import { useQuery, useQueryClient } from '@tanstack/react-query'; 
import { Loader2, DollarSign } from 'lucide-react'; 

import { 
    Order, 
    PaginatedResponse, 
    OrderStatus, 
    User, 
    ExchangeRate 
} from '../types'; 

interface OrdersPageProps {
    currentUser: User | null; 
}

const OrdersPage: React.FC<OrdersPageProps> = ({ currentUser }) => { 
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<string>('all'); 
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null); 

    const queryClient = useQueryClient(); 

    const validOrderStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Completed', 'Canceled'];

    const userCurrencySymbol = currentUser?.defaultCurrencySymbol || '$';

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
        data: paginatedOrders, 
        isLoading, 
        isFetching, 
        error, 
        refetch 
    } = useQuery<PaginatedResponse<Order>, Error>({
        queryKey: ['orders', currentPage, statusFilter, searchTerm], 
        queryFn: () => inventoryService.getOrders({
            page: currentPage,
            limit: 10, 
            status: statusFilter === 'all' ? undefined : (statusFilter as OrderStatus),
            searchTerm: searchTerm || undefined,
        }),
        placeholderData: (previousData) => previousData, 
        staleTime: 60 * 1000, 
    });

    const orders: Order[] = paginatedOrders?.items || [];
    const pagination = paginatedOrders?.pagination;

    useEffect(() => {
        if (orders.length > 0) {
            // console.log(`DEBUG OrdersPage: Órdenes cargadas: ${orders.length}`); // Eliminado log de depuración
        }
    }, [orders, isLoading, isFetching, error]);

    // Función para formatear valores monetarios
    const formatCurrency = useCallback((value: number | undefined | null, includeSymbol: boolean = true) => {
        // console.log("DEBUG formatCurrency: Valor de entrada:", value); // Eliminado log de depuración
        // console.log("DEBUG formatCurrency: userCurrencySymbol:", userCurrencySymbol); // Eliminado log de depuración
        // console.log("DEBUG formatCurrency: latestExchangeRate (dentro de useCallback):", latestExchangeRate); // Eliminado log de depuración

        if (value === undefined || value === null) return 'N/A';
        
        let displayValue = value;
        let symbol = '$'; 

        if (userCurrencySymbol === 'Bs' && latestExchangeRate?.rate && latestExchangeRate.rate > 0) {
            displayValue = value * latestExchangeRate.rate;
            symbol = 'Bs '; 
            // console.log(`DEBUG formatCurrency: Convirtiendo a Bs. Valor original: ${value}, Tasa: ${latestExchangeRate.rate}, Valor convertido: ${displayValue}`); // Eliminado log de depuración
        } else {
            // console.log("DEBUG formatCurrency: Manteniendo en USD o tasa no válida."); // Eliminado log de depuración
        }

        const formattedString = displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        // console.log("DEBUG formatCurrency: Resultado final:", `${symbol}${formattedString}`); // Eliminado log de depuración
        return includeSymbol ? `${symbol}${formattedString}` : formattedString;
    }, [userCurrencySymbol, latestExchangeRate]);


    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1); 
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault(); 
        setCurrentPage(1); 
    };

    const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
        setUpdatingOrderId(orderId); 
        try {
            const response = await inventoryService.updateOrderStatus(orderId, newStatus);
            toast.success(`Orden ${orderId} actualizada a ${response.status}.`, { theme: "dark" }); 
            
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['products'] }); 
            queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] }); 
            queryClient.invalidateQueries({ queryKey: ['inventoryAnalytics'] }); 

        } catch (err: unknown) { 
            console.error('Error al actualizar el estado de la orden:', err);
            let errorMessage = 'Error de red al actualizar el estado de la orden.';
            if (axios.isAxiosError(err)) { 
                if (err.response && typeof err.response.data === 'object' && err.response.data !== null && 'message' in err.response.data) {
                    errorMessage = (err.response.data as { message?: string }).message || err.message;
                } else {
                    errorMessage = err.message;
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            toast.error(errorMessage, { theme: "dark" });
        } finally {
            setUpdatingOrderId(null); 
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
        } catch (e) {
            console.error("Error al formatear la fecha:", e, "Entrada:", dateString);
            return dateString; 
        }
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), 'HH:mm', { locale: es });
        } catch (e) {
            console.error("Error al formatear la hora:", e, "Entrada:", dateString);
            return 'N/A'; 
        }
    };

    // Obtener el SKU del primer (y único) producto de la orden
    const getSkuDisplay = (order: Order) => {
        if (order.orderItems && order.orderItems.length > 0) {
            return order.orderItems[0].sku || 'N/A';
        }
        return 'N/A';
    };


    if (isLoading || isLoadingExchangeRate) { 
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900" translate="no"> 
                <Loader2 className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500" /> 
                <p className="ml-4 text-gray-300">Cargando órdenes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-red-400" translate="no"> 
                <p>Error: {error.message}</p>
                <button
                    onClick={() => refetch()} 
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition duration-300"
                >
                    Reintentar Carga
                </button>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 px-6 py-2 bg-slate-700 text-white rounded-lg shadow hover:bg-slate-600 transition duration-300"
                >
                    Volver al Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg"> 
            <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Gestión de Órdenes</h1> 

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-slate-800 rounded-lg shadow border border-slate-700"> 
                <div className="w-full sm:w-auto">
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-300 mb-1"> 
                        Filtrar por Estado: 
                    </label>
                    <select
                        id="statusFilter"
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-slate-700 text-white" 
                    >
                        <option value="all">Todos los Estados</option> 
                        {validOrderStatuses.map(status => (
                            <option key={status} value={status}>
                                {status === 'Pending' && 'Pendiente'}
                                {status === 'Processing' && 'Procesando'}
                                {status === 'Shipped' && 'Enviado'}
                                {status === 'Completed' && 'Completado'}
                                {status === 'Canceled' && 'Cancelado'}
                            </option>
                        ))}
                    </select>
                </div>
                <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto flex">
                    <input
                        type="text"
                        placeholder="Buscar por estado o notas..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="block w-full pl-3 pr-3 py-2 text-base border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-l-md bg-slate-700 text-white" 
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 text-white rounded-r-md shadow hover:bg-purple-700 transition duration-300"
                        disabled={isFetching || isLoadingExchangeRate} 
                    >
                        {isFetching ? <Loader2 className="animate-spin w-5 h-5" /> : 'Buscar'} 
                    </button>
                </form>
            </div>

            {orders.length === 0 && !isLoading && !isFetching ? ( 
                <p className="text-center text-gray-400 mt-8">No se encontraron órdenes para los criterios seleccionados.</p> 
            ) : (
                <div className="overflow-x-auto bg-slate-800 rounded-lg shadow border border-slate-700"> 
                    <table className="min-w-full divide-y divide-slate-700"> 
                        <thead className="bg-slate-700"> 
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tl-lg">ID Orden</th> 
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha Orden</th> 
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Hora</th> 
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">SKU</th> 
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider flex items-center gap-1">
                                    Monto Total <DollarSign className="w-4 h-4" /> 
                                </th> 
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th> 
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha Esperada</th> 
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha Real</th> 
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado Entrega</th> 
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tr-lg">Acciones</th> 
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700 bg-slate-800"> 
                            {orders.map((order: Order) => ( 
                                <tr key={order.id} className="hover:bg-slate-700"> 
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{order.id}</td> 
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{formatDate(order.orderDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{formatTime(order.orderDate)}</td> 
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{getSkuDisplay(order)}</td> 
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{formatCurrency(order.totalAmount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                            order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            order.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            order.status === 'Canceled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            order.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                            order.status === 'Shipped' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                                            'bg-slate-500/10 text-slate-400 border-slate-500/20' 
                                        }`}>
                                            {order.status === 'Pending' && 'Pendiente'} 
                                            {order.status === 'Processing' && 'Procesando'} 
                                            {order.status === 'Shipped' && 'Enviado'} 
                                            {order.status === 'Completed' && 'Completado'} 
                                            {order.status === 'Canceled' && 'Cancelado'} 
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{formatDate(order.deliveryDateExpected)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{formatDate(order.deliveryDateActual)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                            order.deliveryStatus === 'On Time' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            order.deliveryStatus === 'In Transit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            order.deliveryStatus === 'Delayed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            order.deliveryStatus === 'Not Applicable' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 
                                            'bg-slate-500/10 text-slate-400 border-slate-500/20' 
                                        }`}>
                                            {order.deliveryStatus === 'On Time' && 'A Tiempo'} 
                                            {order.deliveryStatus === 'In Transit' && 'En Tránsito'} 
                                            {order.deliveryStatus === 'Delayed' && 'Retrasado'} 
                                            {order.deliveryStatus === 'Not Applicable' && 'No Aplicable'} 
                                            {order.deliveryStatus === 'Unknown' && 'Desconocido'} 
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-slate-700 text-white" 
                                            disabled={updatingOrderId === order.id || isLoading || isFetching || isLoadingExchangeRate} 
                                        >
                                            {validOrderStatuses.map(status => (
                                                <option key={status} value={status}>
                                                    {status === 'Pending' && 'Pendiente'} 
                                                    {status === 'Processing' && 'Procesando'} 
                                                    {status === 'Shipped' && 'Enviado'} 
                                                    {status === 'Completed' && 'Completado'} 
                                                    {status === 'Canceled' && 'Cancelado'} 
                                                </option>
                                            ))}
                                        </select>
                                        {updatingOrderId === order.id && (
                                            <p className="text-purple-500 text-xs mt-1">Actualizando...</p> 
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination && ( 
                <div className="mt-6 flex justify-center items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPreviousPage || isLoading || isFetching || isLoadingExchangeRate}
                        className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition duration-300" 
                    >
                        Anterior 
                    </button>
                    <span className="text-gray-300"> 
                        Página {currentPage} de {pagination.totalPages} 
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNextPage || isLoading || isFetching || isLoadingExchangeRate}
                        className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition duration-300" 
                    >
                        Siguiente 
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
