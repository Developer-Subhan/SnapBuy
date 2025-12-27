"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import { Trash2, CheckCircle, Truck, User } from "lucide-react";
import { useError } from "./ErrorContext.jsx"; 
import Navbar from "./Navbar";
import Footer from "./Footer";

const CART_KEY = "cart";


const InputField = ({ id, label, type = "text", placeholder = "", className = "", value, onChange, error }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      placeholder={placeholder || label}
      value={value}
      onChange={onChange}
      className={`mt-1 block w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none sm:text-sm 
        ${error 
          ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200" 
          : "border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600"
        }`}
    />
    {error && <p className="mt-1.5 text-xs text-red-600 font-medium ml-1">{error}</p>}
  </div>
);


const ShippingForm = ({ onDeliveryChange, onFormReady }) => {
  const [formData, setFormData] = useState({
    email: "", firstName: "", lastName: "", address: "", apartment: "",
    city: "", state: "", zip: "", phone: "", delivery: "Standard",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    onDeliveryChange(formData.delivery);
  }, [onDeliveryChange, formData.delivery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    const requiredFields = ["email", "firstName", "lastName", "address", "city", "state", "zip", "phone"];
    requiredFields.forEach((field) => { 
      if (!formData[field] || !formData[field].trim()) newErrors[field] = "Required"; 
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateForm();
    onFormReady(isValid, formData);
  };

  const handleDeliverySelect = (method) => {
    setFormData((prev) => ({ ...prev, delivery: method }));
  };

  return (
    <form id="shipping-form" className="space-y-8" onSubmit={handleSubmit}>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><User size={20}/></div>
          <h2 className="text-xl font-bold text-gray-900">Contact Info</h2>
        </div>
        <InputField id="email" label="Email address" value={formData.email} onChange={handleChange} error={errors.email} />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Truck size={20}/></div>
          <h2 className="text-xl font-bold text-gray-900">Shipping Details</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField id="firstName" label="First name" value={formData.firstName} onChange={handleChange} error={errors.firstName} />
          <InputField id="lastName" label="Last name" value={formData.lastName} onChange={handleChange} error={errors.lastName} />
        </div>
        <InputField id="address" label="Address" className="mt-4" value={formData.address} onChange={handleChange} error={errors.address} />
        <InputField id="apartment" label="Apartment (Optional)" className="mt-4" value={formData.apartment} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <InputField id="city" label="City" value={formData.city} onChange={handleChange} error={errors.city} />
          <InputField id="state" label="State" value={formData.state} onChange={handleChange} error={errors.state} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <InputField id="zip" label="Postal code" value={formData.zip} onChange={handleChange} error={errors.zip} />
          <InputField id="phone" label="Phone" value={formData.phone} onChange={handleChange} error={errors.phone} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Method</h2>
        <div className="grid grid-cols-2 gap-4">
          {['Standard', 'Express'].map((method) => (
            <div
              key={method}
              onClick={() => handleDeliverySelect(method)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                formData.delivery === method ? "border-blue-600 bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-gray-900">{method}</span>
                {formData.delivery === method && <CheckCircle size={18} className="text-blue-600" />}
              </div>
              <p className="text-xs text-gray-500 mb-2">{method === 'Standard' ? '4-10 days' : '2-5 days'}</p>
              <p className="text-sm font-bold text-gray-900">Rs. {method === 'Standard' ? '5.00' : '16.00'}</p>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};


const OrderSummary = ({ deliveryMethod, items, subtotal, shipping, taxes, total, handleRemoveItem, isLoading }) => {
  if (items.length === 0) return (
    <div className="bg-gray-50 p-12 rounded-[2rem] text-center border-2 border-dashed border-gray-200">
      <p className="text-gray-500 font-medium">Your cart is currently empty.</p>
    </div>
  );

  return (
    <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl sticky top-8">
      <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
      <div className="divide-y divide-slate-800 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div key={`${item.id}-${item.color}-${item.size}`} className="flex items-center gap-4 py-4 first:pt-0">
            <img src={item.imageSrc} alt={item.name} className="w-16 h-16 object-cover rounded-xl bg-slate-800" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate">{item.name}</p>
              <p className="text-xs text-slate-400 uppercase tracking-tighter">{item.color} • {item.size}</p>
              <p className="text-sm font-medium text-blue-400 mt-1">Qty: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-white">Rs. {item.price}</p>
              <button 
                onClick={() => handleRemoveItem(item.id, item.color, item.size)} 
                className="text-slate-500 hover:text-red-400 transition-colors mt-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-800 space-y-3 text-sm">
        <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="text-white">Rs. {subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-slate-400"><span>Shipping ({deliveryMethod})</span><span className="text-white">Rs. {shipping.toFixed(2)}</span></div>
        <div className="flex justify-between text-slate-400 pb-4 border-b border-slate-800"><span>Taxes</span><span className="text-white">Rs. {taxes.toFixed(2)}</span></div>
        <div className="flex justify-between items-center pt-4 text-xl font-bold">
          <span className="text-white">Total</span>
          <span className="text-blue-400">Rs. {total.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        form="shipping-form"
        disabled={isLoading}
        className="mt-8 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
      >
        {isLoading ? "Processing..." : "Confirm & Pay"}
      </button>
    </div>
  );
};


export default function CheckoutPage() {
  const navigate = useNavigate();
  const { setError } = useError();
  const [selectedDelivery, setSelectedDelivery] = useState("Standard");
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);

  const loadCart = useCallback(() => {
    try {
      const storedCart = localStorage.getItem(CART_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        const sanitizedCart = parsedCart.filter(item => item.name && item.id && item.price !== undefined);
        setItems(sanitizedCart);
      }
    } catch (error) { 
      setError({ message: "Failed to load cart. It may be corrupted.", status: "Data Error" });
    }
  }, [setError]);

  useEffect(() => { loadCart(); }, [loadCart]);

  const handleRemoveItem = (itemId, itemColor, itemSize) => {
    const newItems = items.filter(item => !(item.id === itemId && item.color === itemColor && item.size === itemSize));
    setItems(newItems);
    localStorage.setItem(CART_KEY, JSON.stringify(newItems));
    window.dispatchEvent(new CustomEvent("cart-updated"));
  }; 

  const { subtotal, shipping, taxes, total } = useMemo(() => {
    const calculatedSubtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 0), 0);
    const calculatedShipping = selectedDelivery === "Standard" ? 5.0 : 16.0;
    const calculatedTaxes = 5.52;
    return { 
      subtotal: calculatedSubtotal, 
      shipping: calculatedShipping, 
      taxes: calculatedTaxes, 
      total: calculatedSubtotal + calculatedShipping + calculatedTaxes 
    };
  }, [items, selectedDelivery]);

  const handleOrderSubmit = async (dataToSend) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw {
          message: result.message || "Order placement failed.",
          status: response.status
        };
      }

      localStorage.removeItem(CART_KEY);
      window.dispatchEvent(new CustomEvent("cart-updated"));
      navigate("/order-success", { state: { orderId: result.orderId } });

    } catch (err) {
      setError({
        message: err.message === "Failed to fetch" 
          ? "Our servers are currently offline. Please try again later." 
          : err.message,
        status: err.status || "Network Error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormReady = (isValid, formData) => {
    if (isValid) {
      if (items.length === 0) {
        alert("Your cart is empty.");
        return;
      }
      const filteredItems = items.map(item => ({
        id: item.id, name: item.name, color: item.color, size: item.size,
        price: parseFloat(item.price), quantity: item.quantity, imageSrc: item.imageSrc,
      })); 
      handleOrderSubmit({ 
        customerInfo: formData, 
        items: filteredItems, 
        summary: { subtotal, shipping, taxes, total, deliveryMethod: selectedDelivery } 
      });
    } else { 
      alert("Please fill out all required shipping fields."); 
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Checkout.</h1>
            <p className="text-gray-500 mt-2 font-medium">Please provide your shipping details below.</p>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16 items-start">
            <div className="lg:col-span-7">
              <ShippingForm onDeliveryChange={setSelectedDelivery} onFormReady={handleFormReady} />
            </div>

            <div className="mt-10 lg:mt-0 lg:col-span-5 relative">
              <OrderSummary 
                deliveryMethod={selectedDelivery} 
                items={items} 
                subtotal={subtotal} 
                shipping={shipping} 
                taxes={taxes} 
                total={total} 
                handleRemoveItem={handleRemoveItem} 
                isLoading={isLoading}
              />
              {isLoading && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center rounded-[2rem] z-10">
                  <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="font-bold text-gray-900">Processing Payment...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}