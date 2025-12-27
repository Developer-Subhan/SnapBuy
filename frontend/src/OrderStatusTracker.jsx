import React, { useState, useCallback } from 'react';
import { Search, Package, Clock, Truck, CheckCircle, XCircle, Calendar, Hash, AlertCircle } from 'lucide-react';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';

export default function OrderStatusTracker() {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState(null);

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        
        setOrderData(null);
        setLocalError(null);

        const cleanOrderId = orderId.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanOrderId) {
            setLocalError("Order ID is required to track your package.");
            return;
        }

        setIsLoading(true);

        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); 

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/order-status/${cleanOrderId}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (response.status === 404) {
                setLocalError(`Order #${cleanOrderId} was not found. Please check the ID.`);
                return;
            }

            if (!response.ok) {
                throw new Error('Our tracking server is temporarily unavailable.');
            }

            const data = await response.json();

            
            
            if (!data || !data.customerInfo) {
                throw new Error("Received invalid order format from server.");
            }

            
            if (cleanEmail && data.customerInfo.email.toLowerCase() !== cleanEmail) {
                 setLocalError("Access Denied: The email provided does not match this Order ID.");
                 return;
            }

            setOrderData(data);
        } catch (err) {
            if (err.name === 'AbortError') {
                setLocalError("The request timed out. Please try again.");
            } else {
                setLocalError(err.message || 'A network error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    
    const getStatusConfig = useCallback((status) => {
        const states = {
            'Pending': { icon: Package, color: 'text-amber-500', bg: 'bg-amber-50', barWidth: 'w-1/4' },
            'Processing': { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', barWidth: 'w-1/2' },
            'Shipped': { icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-50', barWidth: 'w-3/4' },
            'Delivered': { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', barWidth: 'w-full' },
            'Cancelled': { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', barWidth: 'w-full' },
        };
        return states[status] || states['Pending'];
    }, []);

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            <Navbar />
            <main className="flex-grow flex flex-col items-center py-16 px-4">
                
                <div className="max-w-2xl w-full bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
                    <div className="mb-8">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Track Order.</h2>
                        <p className="text-slate-500 mt-2 font-medium">Enter your details to see real-time updates.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Order ID</label>
                                <input
                                    type="text"
                                    placeholder="Order ID"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Verify Email</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? "Fetching..." : <><Search size={20} /> Track Package</>}
                        </button>
                    </form>

                    {localError && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} /> {localError}
                        </div>
                    )}
                </div>

                
                {orderData && (
                    <div className="max-w-2xl w-full mt-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                            
                            
                            <div className="h-2 w-full bg-slate-100">
                                <div className={`h-full bg-blue-500 transition-all duration-1000 ${getStatusConfig(orderData.status).barWidth}`} />
                            </div>

                            <div className={`p-8 ${getStatusConfig(orderData.status).bg}`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 bg-white rounded-2xl shadow-sm ${getStatusConfig(orderData.status).color}`}>
                                            {React.createElement(getStatusConfig(orderData.status).icon, { size: 32 })}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400">Current Status</p>
                                            <h3 className={`text-2xl font-black ${getStatusConfig(orderData.status).color}`}>
                                                {orderData.status || 'Unknown'}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="hidden md:block text-right">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Order Ref</p>
                                        <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-600">
                                            <Hash size={14} /> {orderData._id}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-slate-300" size={20} />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Placed On</p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString() : 'Date Missing'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Truck className="text-slate-300" size={20} />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Carrier</p>
                                            <p className="text-sm font-bold text-slate-700">Standard Shipping</p>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <Package size={14} /> Package Contents
                                    </h4>
                                    <div className="bg-slate-50 rounded-[1.5rem] p-5 space-y-3">
                                        {orderData.items?.length > 0 ? (
                                            orderData.items.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-slate-700">{item.name} <span className="text-slate-400 font-medium">x{item.quantity}</span></span>
                                                    <span className="font-mono text-slate-500">{item.size || 'OS'}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-400 italic">No item details available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}