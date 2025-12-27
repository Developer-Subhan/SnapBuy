"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Eye, AlertCircle, RefreshCcw } from "lucide-react";
import Loader from "./Loader";
import { useError } from "./ErrorContext.jsx";

const GridItem = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);

  
  if (!item) return null;

  return (
    <motion.div
      className="group relative bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link to={`/products/${item._id}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
          <motion.img
            
            src={item.images?.[0]?.src || "https://placehold.co/400x500/f8fafc/64748b?text=No+Image"}
            alt={item.name || "Product"}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
            onError={(e) => {
              e.target.src = "https://placehold.co/400x500/f8fafc/64748b?text=Image+Error";
            }}
          />

          <div className="absolute top-4 right-4">
            <button 
              onClick={(e) => { e.preventDefault(); /* Logic for wishlist */ }}
              className="p-3 bg-white/80 backdrop-blur-md rounded-2xl text-slate-900 shadow-sm hover:bg-pink-500 hover:text-white transition-all"
            >
              <Heart size={18} strokeWidth={2.5} />
            </button>
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-4 right-4"
              >
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Quick View</p>
                      <p className="text-sm font-bold text-slate-900">Rs. {item.price || 'N/A'}</p>
                   </div>
                   <div className="p-2 bg-slate-900 text-white rounded-xl">
                      <Eye size={18} />
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 truncate tracking-tight">
            {item.name || "Unnamed Product"}
          </h3>
          <p className="text-slate-500 font-medium text-sm">
            {item.category || "Collection"}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const { setError } = useError();

  const fetchProducts = useCallback(async (isRetry = false) => {
    if (!isRetry) setLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
      if (!res.ok) throw new Error(`Server status: ${res.status}`);
      
      const data = await res.json();
      
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch failed:", err);
      
      if (!isRetry) {
          setError({ message: "We're having trouble reaching the store. Check your connection.", status: "Offline" });
      }
    } finally {
      setLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) return <Loader />;

  
  if (products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="text-slate-400" size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">No products found.</h2>
        <p className="text-slate-500 mb-8 max-w-xs">Our stock might be updating. Please try refreshing.</p>
        <button 
          onClick={() => fetchProducts()}
          className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
        >
          <RefreshCcw size={18} /> Refresh Store
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Shop All.</h1>
            <p className="text-slate-500 font-medium">Explore our latest drops and essentials.</p>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm">
              {products.length} Products Available
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((item) => (
            <GridItem key={item._id || Math.random()} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}