"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBagIcon, 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Loader from "./Loader";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get("q") || "";

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products?q=${encodeURIComponent(query)}`, {
        credentials: "include"
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col selection:bg-indigo-100">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-indigo-600 mb-4"
          >
            <div className="p-2 bg-indigo-50 rounded-lg">
              <MagnifyingGlassIcon className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Discovery</span>
          </motion.div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black text-slate-900 tracking-tighter"
            >
              Results for <span className="text-indigo-600">"{query}"</span>
            </motion.h1>
            <p className="text-slate-400 font-bold text-sm bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 inline-block">
              {products.length} {products.length === 1 ? 'Item' : 'Items'} Found
            </p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {products.length > 0 ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {products.map((item) => (
                <motion.div
                  key={item._id}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500"
                >
                  <Link to={`/products/${item._id}`}>
                    <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-50 relative">
                      <img
                        src={item.images?.[0]?.src || "https://placehold.co/400x500"}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    
                    <div className="mt-6 px-2 pb-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1.5">
                        {item.category}
                      </p>
                      <h3 className="text-xl font-bold text-slate-900 truncate tracking-tight">{item.name}</h3>
                      
                      <div className="flex items-center justify-between mt-5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Price</span>
                          <span className="text-xl font-black text-slate-900">Rs. {item.price}</span>
                        </div>
                        <div className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200">
                          <ShoppingBagIcon className="h-5 w-5 stroke-[2]" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-indigo-200 rounded-full blur-[80px] opacity-30 animate-pulse" />
                <div className="relative h-40 w-40 bg-white rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex items-center justify-center border border-indigo-50">
                  <ArchiveBoxIcon className="h-16 w-16 text-indigo-100 stroke-[1]" />
                </div>
              </div>
              
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">No results found.</h2>
              <p className="text-slate-500 max-w-sm mb-12 font-medium leading-relaxed">
                We searched our entire catalog for <span className="text-indigo-600 font-bold">"{query}"</span> but came up empty.
              </p>
              
              <Link 
                to="/"
                className="group flex items-center gap-3 px-10 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
              >
                <ArrowLeftIcon className="h-5 w-5 stroke-[3] group-hover:-translate-x-1 transition-transform" />
                Return to Shop
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}