"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Heart, Eye, AlertCircle, RefreshCcw, SearchX, ArrowLeft } from "lucide-react";
import Loader from "./Loader";
import { useError } from "./ErrorContext";

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
                      <p className="text-sm font-bold text-slate-900">
                        Rs. {typeof item.price === 'object' ? JSON.stringify(item.price) : item.price || 'N/A'}
                      </p>
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
          <h3 className="text-lg font-bold text-slate-900 truncate tracking-tight">{item.name || "Unnamed Product"}</h3>
          <p className="text-slate-500 font-medium text-sm">{item.category || "Collection"}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setError } = useError();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const fetchProducts = useCallback(async (isRetry = false) => {
    if (!isRetry) setLoading(true);
    try {
      const url = query 
        ? `${import.meta.env.VITE_API_URL}/products?q=${encodeURIComponent(query)}` 
        : `${import.meta.env.VITE_API_URL}/products`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server status: ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      if (!isRetry) {
          setError({ message: err.message || "An unexpected error occurred", status: "Offline" });
      }
    } finally {
      setLoading(false);
    }
  }, [setError, query]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {products.length === 0 ? (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="relative bg-white border border-slate-100 p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50">
                  <SearchX className="text-slate-900 w-16 h-16 stroke-[1.5]" />
                </div>
              </div>
              
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
                {query ? `No results for "${query}"` : "The store is quiet today"}
              </h2>
              
              <p className="text-slate-500 max-w-sm mb-10 font-medium leading-relaxed">
                We couldn't find what you're looking for. Try a different search term or explore our core collection.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/" 
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
                >
                  <ArrowLeft size={18} /> Return Home
                </Link>
                <button 
                  onClick={() => fetchProducts()}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                >
                  <RefreshCcw size={18} /> Refresh Store
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="product-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {products.map((item) => (
                <GridItem key={item._id || Math.random()} item={item} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}