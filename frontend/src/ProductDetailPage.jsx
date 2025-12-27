"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShoppingBagIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronRightIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/20/solid";
import Loader from "./Loader";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { useError } from "./ErrorContext.jsx";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setError } = useError();

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchData() {
      try {
        const productRes = await fetch(`http://localhost:5000/products/${id}`, { signal });
        
        if (!productRes.ok) {
          if (productRes.status === 404) return navigate("/404");
          const errorData = await productRes.json();
          return setError({ 
            message: errorData.message || "Could not retrieve product information.", 
            status: productRes.status 
          });
        }
        const data = await productRes.json();
        setProduct(data);
        
        if (data?.colors?.length > 0) setSelectedColor(data.colors[0].name);
        const initialSize = data?.sizes?.find((size) => size.inStock);
        if (initialSize) setSelectedSize(initialSize.name);
        const authRes = await fetch(`${import.meta.env.VITE_API_URL}/check-auth`, {
          credentials: "include",
          signal,
        });
        
        if (authRes.ok) {
          const authData = await authRes.json();
          setLoggedIn(authData.loggedIn);
          setUser(authData.user || null);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError({ 
            message: "Unable to connect to the server. Please check your connection.", 
            status: "Network Error" 
          });
        }
      } finally {
        setIsDataLoaded(true);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [id, navigate, setError]);

  const handleAddToBag = useCallback(() => {
    if (!loggedIn) return navigate("/auth");
    if (!product?._id) return;

    try {
      let cart = [];
      const storedCart = localStorage.getItem("cart");

      if (storedCart) {
        try {
          cart = JSON.parse(storedCart);
        } catch (e) {
          cart = [];
        }
      }

      const existingIndex = cart.findIndex(
        (item) =>
          item.id === product._id &&
          item.color === selectedColor &&
          item.size === selectedSize
      );

      if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          id: product._id,
          name: product.name || "Unknown Product",
          price: product.price || 0,
          color: selectedColor,
          size: selectedSize,
          quantity: quantity,
          imageSrc: product.images?.[0]?.src || "https://via.placeholder.com/150",
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (err) {
      setError({
        message: "LocalStorage Access Denied: Failed to update cart.",
        status: "Browser Error"
      });
    }
  }, [loggedIn, product, selectedColor, selectedSize, quantity, navigate, setError]);

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`http://localhost:5000/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        navigate("/");
      } else {
        const errorData = await res.json();
        setError({
          message: errorData.message || "The server refused to delete this product.",
          status: res.status,
        });
      }
    } catch (err) {
      setError({ 
        message: "Failed to send delete request. Server may be offline.", 
        status: "Fetch Error" 
      });
    }
  };

  if (!isDataLoaded) return <Loader />;

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <ExclamationTriangleIcon className="h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-bold">Product Unavailable</h2>
        <Link to="/" className="text-indigo-600 hover:underline">Back to Shop</Link>
      </div>
    );
  }

  const isOutOfStock = !product.sizes || !product.sizes.some((s) => s.inStock);
  const isAddToBagDisabled = !loggedIn || isOutOfStock || !selectedSize || !selectedColor;
  const isAdmin = user?.username === "admin";

  return (
    <>
      <Navbar />
      <div className="bg-slate-50 min-h-screen pb-20">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-indigo-600 transition">Shop</Link></li>
            <ChevronRightIcon className="h-4 w-4" />
            <li className="font-semibold text-gray-900 truncate">{product.name}</li>
          </ol>
        </nav>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gray-200 shadow-lg">
                <img
                  src={product.images?.[activeImage]?.src || "https://via.placeholder.com/600"}
                  alt={product.images?.[activeImage]?.alt || product.name}
                  className="h-full w-full object-cover object-center transition-opacity duration-300"
                />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-4">
                {product.images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all 
                      ${activeImage === idx ? "border-indigo-600 ring-2 ring-indigo-100" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img src={img.src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 lg:col-span-5 lg:mt-0">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{product.name}</h1>
                  <div className="mt-3 flex items-center">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <StarIcon key={rating} className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                      ))}
                    </div>
                    <p className="ml-3 text-sm text-indigo-600 font-medium">124 Reviews</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">Rs. {product.price}</p>
              </div>

              <section className="mt-8 border-t border-gray-200 pt-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Color: <span className="text-indigo-600">{selectedColor}</span>
                  </h3>
                  <div className="mt-4 flex items-center space-x-3">
                    {product.colors?.map((color) => (
                      <button
                        key={color._id}
                        onClick={() => setSelectedColor(color.name)}
                        className={`relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none 
                          ${selectedColor === color.name ? "ring-2 ring-indigo-500" : ""}`}
                      >
                        <span
                          style={{ backgroundColor: color.hex || color.name.toLowerCase() }}
                          className="h-8 w-8 rounded-full border border-black border-opacity-10"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Size</h3>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Size guide</button>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {product.sizes?.map((size) => (
                      <button
                        key={size.name}
                        disabled={!size.inStock}
                        onClick={() => setSelectedSize(size.name)}
                        className={`flex items-center justify-center rounded-xl border py-3 px-3 text-sm font-bold uppercase transition-all
                          ${!size.inStock ? "bg-gray-50 text-gray-300 cursor-not-allowed" 
                          : selectedSize === size.name ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                          : "bg-white text-gray-900 hover:bg-gray-50 border-gray-200"}`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Quantity</h3>
                  <div className="mt-4 flex items-center w-32 border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 hover:bg-gray-100 transition">
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="flex-1 text-center font-bold">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} className="p-3 hover:bg-gray-100 transition">
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToBag}
                  disabled={isAddToBagDisabled}
                  className={`mt-10 flex w-full items-center justify-center rounded-2xl py-4 px-8 text-base font-bold text-white shadow-xl transition-all active:scale-[0.98]
                    ${isAddToBagDisabled ? "bg-gray-400 cursor-not-allowed shadow-none" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"}`}
                >
                  <ShoppingBagIcon className="mr-2 h-6 w-6" />
                  {!loggedIn ? "Login to Purchase" : isOutOfStock ? "Out of Stock" : "Add to Shopping Bag"}
                </button>
              </section>

              {isAdmin && (
                <div className="mt-6 rounded-2xl border border-dashed border-red-200 bg-red-50 p-6">
                  <h4 className="text-sm font-bold text-red-800 uppercase mb-4">Store Management</h4>
                  <div className="flex gap-4">
                    <Link to={`/products/edit/${id}`} className="flex-1">
                      <button className="flex w-full items-center justify-center rounded-xl bg-white border border-red-200 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 transition">
                        <PencilSquareIcon className="mr-2 h-5 w-5" /> Edit Product
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 flex items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 transition active:scale-95 shadow-lg shadow-red-200"
                    >
                      <TrashIcon className="mr-2 h-5 w-5" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <section className="mt-16 border-t border-gray-200 pt-16">
            <div className="grid lg:grid-cols-3 gap-12">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Description</h3>
                <p className="mt-4 text-base leading-7 text-gray-600">{product.description}</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Highlights</h3>
                <ul className="mt-4 space-y-3">
                  {product.highlights?.map((h) => (
                    <li key={h} className="flex items-start text-sm text-gray-600">
                      <CheckIcon className="h-5 w-5 text-emerald-500 mr-3 shrink-0" /> {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Material & Care</h3>
                <p className="mt-4 text-sm text-gray-600 leading-6">{product.details}</p>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}