"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Plus, Trash2, Image as ImageIcon, Palette, Ruler, Info, FileText, Sparkles } from "lucide-react";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import Loader from "./Loader.jsx";

export default function EditProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    images: ["", "", "", ""],
    colors: [{ name: "" }],
    sizes: [{ name: "", inStock: true }],
    highlights: [""],
    description: "",
    details: "",
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Error ${res.status}: Product not found`);
        }

        const data = await res.json();
        
        setFormData({
          name: data.name || "",
          price: data.price || "",
          images: data.images?.map(img => img.src) || ["", "", "", ""],
          colors: data.colors?.map(c => ({ name: c.name })) || [{ name: "" }],
          sizes: data.sizes?.map(s => ({ name: s.name, inStock: s.inStock })) || [{ name: "", inStock: true }],
          highlights: data.highlights || [""],
          description: data.description || "",
          details: data.details || "",
        });
      } catch (err) {
        console.error("Fetch Product Error:", err);
        setProductFetchError(err.message === "Failed to fetch" ? "Network error. Could not load product." : err.message);
        navigate("/"); 
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e, index, field, arrayField) => {
    if (arrayField === "images") {
      const arr = [...formData.images];
      arr[index] = e.target.value;
      setFormData({ ...formData, images: arr });
    } else if (arrayField === "highlights") {
      const arr = [...formData.highlights];
      arr[index] = e.target.value;
      setFormData({ ...formData, highlights: arr });
    } else if (arrayField) {
      const arr = [...formData[arrayField]];
      arr[index][field] = e.target.value;
      setFormData({ ...formData, [arrayField]: arr });
    } else {
      setFormData({ ...formData, [field]: e.target.value });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Required";
    if (!formData.price.toString().trim()) errs.price = "Required";
    formData.images.forEach((img, idx) => {
      if (!img.trim()) errs[`image${idx}`] = "URL Required";
    });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setLoading(true);

    const preparedColors = formData.colors.map((color) => {
      const colorId = color.name.trim().toLowerCase().replace(/\s+/g, "-");
      return { name: color.name, id: colorId, classes: `bg-${colorId} checked:outline-${colorId}` };
    });

    const payload = {
      ...formData,
      images: formData.images.map((url, idx) => ({ src: url, alt: `Image ${idx + 1}` })),
      colors: preparedColors,
      highlights: formData.highlights.filter(h => h.trim() !== ""),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update product");
      }

      navigate(`/products/${id}`);
    } catch (err) {
      console.error("Update Error:", err);
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader />;

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <p className="text-blue-600 font-black uppercase tracking-widest text-xs mb-2">Inventory Management</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Edit Product.</h2>
          </div>
          <button
            form="edit-form"
            disabled={loading}
            className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
          >
            {loading ? "Saving..." : <><Save size={18}/> Update Changes</>}
          </button>
        </header>

        {submitError && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-800">Error Updating Product</h3>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
            <button
              onClick={() => setSubmitError("")}
              className="ml-auto text-red-500 hover:text-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <form id="edit-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
              <Info size={16}/> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange(e, null, "name")}
                  className={`w-full rounded-2xl border px-5 py-4 bg-slate-50 focus:bg-white transition-all outline-none ${errors.name ? "border-red-500" : "border-slate-100 focus:border-blue-500"}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Price (Rs.)</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => handleChange(e, null, "price")}
                  className={`w-full rounded-2xl border px-5 py-4 bg-slate-50 focus:bg-white transition-all outline-none ${errors.price ? "border-red-500" : "border-slate-100 focus:border-blue-500"}`}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
              <ImageIcon size={16}/> Visual Gallery (4 URLs)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <input
                    type="text"
                    placeholder={`Image URL ${idx + 1}`}
                    value={img}
                    onChange={(e) => handleChange(e, idx, null, "images")}
                    className="w-full rounded-2xl border border-slate-100 px-5 py-4 bg-slate-50 focus:bg-white outline-none transition-all text-sm"
                  />
                  {errors[`image${idx}`] && <span className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-4">Required</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                <Palette size={16}/> Variants & Colors
              </h3>
              <div className="space-y-3">
                {formData.colors.map((color, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={color.name}
                      placeholder="Color name"
                      onChange={(e) => handleChange(e, idx, "name", "colors")}
                      className="flex-grow rounded-xl border border-slate-100 px-4 py-2 bg-slate-50 outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, colors: formData.colors.filter((_, i) => i !== idx) })}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, colors: [...formData.colors, { name: "" }] })}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-blue-300 hover:text-blue-500 transition-all text-sm"
                >
                  <Plus size={16}/> Add Color
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                <Ruler size={16}/> Available Sizes
              </h3>
              <div className="space-y-3">
                {formData.sizes.map((size, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={size.name}
                      placeholder="Size (e.g. M)"
                      onChange={(e) => handleChange(e, idx, "name", "sizes")}
                      className="w-24 rounded-xl border border-slate-100 px-4 py-2 bg-slate-50 outline-none"
                    />
                    <label className="flex-grow flex items-center gap-2 px-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={size.inStock}
                        onChange={(e) => handleChange({ target: { value: e.target.checked } }, idx, "inStock", "sizes")}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-bold text-slate-600">In Stock</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, sizes: formData.sizes.filter((_, i) => i !== idx) })}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, sizes: [...formData.sizes, { name: "", inStock: true }] })}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-blue-300 hover:text-blue-500 transition-all text-sm"
                >
                  <Plus size={16}/> Add Size
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
              <Sparkles size={16}/> Product Highlights
            </h3>
            <div className="space-y-3">
              {formData.highlights.map((highlight, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={highlight}
                    placeholder="E.g. Hand-cut and sewn locally"
                    onChange={(e) => handleChange(e, idx, null, "highlights")}
                    className="flex-grow rounded-xl border border-slate-100 px-4 py-2 bg-slate-50 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => setFormData({ 
                      ...formData, 
                      highlights: formData.highlights.filter((_, i) => i !== idx) 
                    })}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, highlights: [...formData.highlights, ""] })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-blue-300 hover:text-blue-500 transition-all text-sm"
              >
                <Plus size={16}/> Add Highlight Point
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
              <FileText size={16}/> Copywriting & Content
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Short Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange(e, null, "description")}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-100 px-5 py-4 bg-slate-50 focus:bg-white outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Product Details (Material, Care, etc.)</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => handleChange(e, null, "details")}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-100 px-5 py-4 bg-slate-50 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:hidden flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
          >
            {loading ? "Saving Changes..." : "Update Product"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}