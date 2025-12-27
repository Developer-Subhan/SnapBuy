import React, { useState, useEffect } from 'react';
import { 
    Package, Clock, DollarSign, ChevronDown, ChevronUp, 
    MapPin, Mail, Phone, ShoppingCart, Truck
} from 'lucide-react';
import { useError } from './ErrorContext.jsx';
import Loader from './Loader.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

const OrderItemRow = ({ order, onUpdateStatus }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(order.status || 'Pending');
    const [isUpdating, setIsUpdating] = useState(false);
    const [localError, setLocalError] = useState(null); 

    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    
    const statusClasses = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Processing': 'bg-orange-100 text-orange-800',
        'Shipped': 'bg-blue-100 text-blue-800',
        'Delivered': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800',
    };
    
    const date = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
    
    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        const previousStatus = currentStatus;
        
        setCurrentStatus(newStatus); 
        setIsUpdating(true);
        setLocalError(null); 
        
        try {
            await onUpdateStatus(order._id, newStatus);
        } catch (err) {
            setLocalError(err.message);
            setCurrentStatus(previousStatus); 
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="border-b border-gray-200">
            <div 
                className={`p-4 grid grid-cols-12 gap-4 text-sm items-center cursor-pointer transition duration-150 ${isExpanded ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="col-span-3 font-medium text-gray-900 truncate font-mono">
                    #{order._id}
                </div>
                <div className="col-span-3 text-gray-700">
                    <p className="font-medium">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                </div>
                <div className="col-span-2 font-semibold text-gray-900">
                    Rs. {order.summary.total.toFixed(2)}
                </div>
                <div className="col-span-2 text-gray-500">
                    {date}
                </div>
                <div className="col-span-1" onClick={(e) => e.stopPropagation()}> 
                    <select
                        value={currentStatus}
                        onChange={handleStatusChange}
                        disabled={isUpdating}
                        className={`w-full py-1 px-2 text-xs font-semibold rounded-md border ${statusClasses[currentStatus]} focus:ring-blue-500 focus:border-blue-500 disabled:opacity-75`}
                    >
                        {allowedStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-1 text-right text-gray-500">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </div>
            {localError && <p className="col-span-12 text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1 px-4 pb-2">Update Failed: {localError}</p>}

            {isExpanded && (
                <div className="bg-gray-50 p-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm border-t border-gray-200">
                    
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center border-b pb-2"><MapPin className="w-4 h-4 mr-2 text-blue-500" /> Shipping</h4>
                        <p className="font-medium">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                        <p className="text-gray-600">{order.customerInfo.address}, {order.customerInfo.apartment}</p>
                        <p className="text-gray-600">{order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.zip}</p>
                        <div className="mt-3 space-y-1 text-gray-500">
                            <p className="flex items-center"><Mail className="w-3.5 h-3.5 mr-2" /> {order.customerInfo.email}</p>
                            <p className="flex items-center"><Phone className="w-3.5 h-3.5 mr-2" /> {order.customerInfo.phone}</p>
                        </div>
                    </div>
                    
                    
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center border-b pb-2"><ShoppingCart className="w-4 h-4 mr-2 text-blue-500" /> Items ({order.items.length})</h4>
                        <ul className="space-y-3">
                            {order.items.map((item, index) => (
                                <li key={index} className="flex justify-between items-start">
                                    <span className="text-gray-700">
                                        {item.name} 
                                        <span className="text-[10px] text-gray-400 block uppercase">
                                            {item.size || 'No Size'} • {item.color}
                                        </span>
                                    </span>
                                    <span className="font-semibold text-gray-900">x{item.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center border-b pb-2"><DollarSign className="w-4 h-4 mr-2 text-blue-500" /> Payment</h4>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>Rs. {order.summary.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-gray-500"><span>Shipping</span><span>Rs. {order.summary.shipping.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-blue-600 text-lg border-t pt-2 mt-2">
                                <span>TOTAL</span><span>Rs. {order.summary.total.toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 text-center uppercase tracking-widest">Paid via {order.customerInfo.delivery}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default function AdminDashboard() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { setError } = useError(); 

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
                    credentials: 'include' 
                }); 
                
            
                if (response.status === 401 || response.status === 403) {
                    throw {
                        message: "Admin Access Required. You do not have permission to view this page.",
                        status: response.status,
                        statusText: "Unauthorized"
                    };
                }

          
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw {
                        message: errorData.message || "Failed to retrieve orders from the server.",
                        status: response.status,
                        statusText: response.statusText
                    };
                }

                const data = await response.json();
                const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedData); 
            } catch (err) {
                const finalError = err.message === "Failed to fetch" 
                    ? { message: "Network connection lost. Please check your internet.", status: 503 } 
                    : err;
                
                setError(finalError);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [setError]);

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ newStatus: newStatus }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Could not update status.");
        }

        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        return await response.json();
    };

    if (isLoading) return <Loader />;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
                        <Package className="w-8 h-8 mr-3 text-indigo-600" />
                        Order Management
                        <span className="ml-4 text-sm font-medium bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                            {orders.length} Total
                        </span>
                    </h1>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center p-20 bg-white rounded-[2rem] shadow-sm border border-gray-200">
                        <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShoppingCart className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-lg text-gray-500 font-medium">No orders found in the database.</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden border border-gray-200">
                        <div className="grid grid-cols-12 gap-4 bg-gray-50/50 p-5 font-bold text-[10px] text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                            <div className="col-span-3">Order Reference</div>
                            <div className="col-span-3">Customer</div>
                            <div className="col-span-2">Amount</div>
                            <div className="col-span-2">Date Placed</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-1 text-right">Action</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {orders.map(order => (
                                <OrderItemRow 
                                    key={order._id} 
                                    order={order} 
                                    onUpdateStatus={handleUpdateOrderStatus}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}