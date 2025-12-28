"use client";

import { Fragment, useState, useEffect } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
  TruckIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";
import CartDrawer from "./CartDrawer.jsx";

const navigation = {
  categories: [],
};

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(null);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAuth() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/check-auth`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setLoggedIn(data.loggedIn);
          setUser(data.user || null);
        } else {
          setLoggedIn(false);
        }
      } catch (err) {
        setLoggedIn(false);
      }
    }
    fetchAuth();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const isAdmin = loggedIn && user?.username === "admin";

  if (loggedIn === null) return <div className="h-24 bg-white border-b animate-pulse" />;

  return (
    <div className="bg-white sticky top-0 z-[100] border-b border-indigo-50 shadow-sm shadow-indigo-100/20">
      <Dialog open={open} onClose={setOpen} className="relative z-[110] lg:hidden">
        <DialogBackdrop transition className="fixed inset-0 bg-indigo-900/20 backdrop-blur-sm transition-opacity duration-300" />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel transition className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 data-[closed]:-translate-x-full">
            <div className="flex px-6 pb-2 pt-8 justify-between items-center">
              <span className="text-xl font-black tracking-tighter italic text-indigo-600">MENU</span>
              <button onClick={() => setOpen(false)} className="text-indigo-300 p-2 hover:bg-indigo-50 rounded-full transition-colors">
                <XMarkIcon className="size-6" />
              </button>
            </div>
            <div className="mt-4 px-6 space-y-1">
              {isAdmin && (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 py-4 text-slate-700 font-bold border-b border-indigo-50">
                    <Squares2X2Icon className="size-5 text-indigo-500" /> Dashboard
                  </Link>
                  <Link to="/products/new" onClick={() => setOpen(false)} className="flex items-center gap-3 py-4 text-slate-700 font-bold border-b border-indigo-50">
                    <PlusIcon className="size-5 text-indigo-500" /> New Product
                  </Link>
                </>
              )}
              <Link to="/track-order" onClick={() => setOpen(false)} className="flex items-center gap-3 py-4 text-indigo-600 font-bold border-b border-indigo-50">
                <TruckIcon className="size-5" /> Track Order
              </Link>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <header className="relative bg-white">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-24 items-center justify-between">
            
            <div className="flex items-center gap-8">
              <div className="flex items-center">
                <button onClick={() => setOpen(true)} className="p-2 -ml-2 text-indigo-400 lg:hidden hover:bg-indigo-50 rounded-full transition-colors">
                  <Bars3Icon className="size-8" />
                </button>

                <Link to="/" className="ml-2 lg:ml-0 transition-transform active:scale-95">
                  <img 
                    alt="Logo" 
                    src="\photo.png" 
                    className="h-16 w-auto object-contain sm:h-24 sm:scale-110" 
                  />
                </Link>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                {isAdmin && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    >
                      <Squares2X2Icon className="size-4 stroke-[2.5]" />
                      Dashboard
                    </Link>
                    <Link 
                      to="/products/new" 
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    >
                      <PlusIcon className="size-4 stroke-[2.5]" />
                      New Product
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <Link 
                to="/track-order" 
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-indigo-100 bg-indigo-50/30 text-[11px] font-black uppercase tracking-wider text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm active:scale-95"
              >
                <TruckIcon className="size-4 stroke-[2.5]" />
                Track Order
              </Link>

              <div className="h-8 w-[1px] bg-indigo-100 hidden sm:block" />

              <form onSubmit={handleSearch} className="relative flex items-center group">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-0 opacity-0 group-hover:w-44 focus:w-44 group-hover:opacity-100 focus:opacity-100 transition-all duration-500 rounded-xl bg-indigo-50/50 px-4 py-2 text-sm outline-none border border-transparent focus:border-indigo-200"
                />
                <button type="submit" className="p-2 text-indigo-400 hover:text-indigo-600 transition-colors">
                  <MagnifyingGlassIcon className="size-6 stroke-[2]" />
                </button>
              </form>

              <div className="flex items-center gap-2">
                {loggedIn === false ? (
                  <Link 
                    to="/auth" 
                    className="text-xs font-black text-white bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all uppercase tracking-tighter active:scale-95 shadow-lg shadow-indigo-200"
                  >
                    Sign in
                  </Link>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-3">
                    <div className="transition-transform hover:scale-110 active:scale-90">
                      <CartDrawer />
                    </div>
                    
                    <button
                      onClick={async () => {
                        // FIXED: Corrected logout fetch syntax
                        await fetch(`${import.meta.env.VITE_API_URL}/logout`, { credentials: "include" });
                        window.location.href = "/";
                      }}
                      className="group flex items-center gap-2 px-3 py-2 rounded-xl text-indigo-300 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                      title="Sign Out"
                    >
                      <span className="hidden xl:inline text-[10px] font-black uppercase tracking-tighter">Logout</span>
                      <ArrowRightOnRectangleIcon className="size-5 stroke-[2.5]" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </nav>
      </header>
    </div>
  );
}