"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Eye, ShoppingCart, ArrowRight } from "lucide-react";
import Footer from "./Footer.jsx";
import Loader from "./Loader";
import Navbar from "./Navbar.jsx";


const GridItem = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);

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
            src={item.images?.[0]?.src}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/400x500/f8fafc/64748b?text=Product+Image`;
            }}
          />
          <div className="absolute top-4 right-4">
            <button className="p-3 bg-white/80 backdrop-blur-md rounded-2xl text-slate-900 shadow-sm hover:bg-pink-500 hover:text-white transition-all duration-300">
              <Heart size={18} strokeWidth={2.5} />
            </button>
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4"
              >
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">View Details</p>
                    <p className="text-sm font-bold text-slate-900">Rs. {item.price}</p>
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
            {item.name}
          </h3>
          <p className="text-slate-500 font-medium text-sm">Found in Collection</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default function SearchResult() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products?search=${query || ""}`);
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Search fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchSearchResults();
  }, [query]);

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50/30 pt-20"> 
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          
          
          <header className="mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <span className="h-px w-8 bg-slate-300"></span>
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">Search Results</p>
            </motion.div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              Showing "{query}"
            </h1>
            <p className="mt-2 text-slate-500 font-medium">
              We found {products.length} items that match your style.
            </p>
          </header>

          
          {products.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden text-center py-24 px-6 bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]"
            >
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.1] select-none pointer-events-none">
                <h1 className="text-[12rem] font-black tracking-tighter">EMPTY</h1>
              </div>

              <div className="relative z-10">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 text-slate-300 mb-8"
                >
                  <ShoppingCart size={32} strokeWidth={1.5} />
                </motion.div>

                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                  Nothing found.
                </h2>
                <p className="max-w-[320px] mx-auto text-slate-500 font-medium leading-relaxed mb-10">
                  We couldn't find any matches for <span className="text-slate-900">"{query}"</span>. 
                  Try checking your spelling or use more general keywords.
                </p>

                <Link 
                  to="/" 
                  className="group inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 active:scale-95"
                >
                  <span>Continue Shopping</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={18} />
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((item) => (
                <GridItem key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}