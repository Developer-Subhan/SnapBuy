import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PhotoIcon, 
  TrashIcon, 
  TagIcon, 
  DocumentTextIcon,
  SparklesIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { useError } from "./ErrorContext"; 

export default function AddProductForm() {
  const navigate = useNavigate();
  const { setError } = useError(); 

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

  const [loading, setLoading] = useState(false);

  const handleChange = (e, index, field, arrayField) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    
    if (arrayField) {
      const arr = [...formData[arrayField]];
      if (field) {
        arr[index][field] = value;
      } else {
        arr[index] = value;
      }
      setFormData({ ...formData, [arrayField]: arr });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const addField = (arrayField, newItem) => {
    setFormData({ ...formData, [arrayField]: [...formData[arrayField], newItem] });
  };

  const removeField = (arrayField, index) => {
    const arr = formData[arrayField].filter((_, i) => i !== index);
    setFormData({ ...formData, [arrayField]: arr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

  
    
    if (formData.name.trim().length <= 3) {
      setLoading(false);
      return setError({
        message: "Invalid Name",
        statusText: "Product name must be greater than 3 characters.",
        status: "Validation Error"
      });
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setLoading(false);
      return setError({
        message: "Invalid Price",
        statusText: "Please provide a numeric price greater than 0.",
        status: 400
      });
    }

    const activeImages = formData.images.filter(url => url.trim() !== "");
    if (activeImages.length !== 4) {
      setLoading(false);
      return setError({
        message: "Image Requirement",
        statusText: `You must provide exactly 4 image URLs. You currently have ${activeImages.length}.`,
        status: "Media Error"
      });
    }

   
    const preparedColors = formData.colors.map((color) => {
      const id = color.name.trim().toLowerCase().replace(/\s+/g, "-");
      return { name: color.name, id, classes: `bg-${id}` };
    });

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      images: activeImages.map((url, idx) => ({ src: url, alt: `${formData.name} ${idx}` })),
      colors: preparedColors,
      highlights: formData.highlights.filter(h => h.trim() !== ""),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return setError({
          message: errorData.message || "Submission Failed",
          statusText: errorData.message || "Failed to add product. Please try again.",
          status: res.status
        });
      }

      navigate("/");
    } catch (err) {
      setError({
        message: "Connection Error",
        statusText: "Could not reach the backend. Is the server running?",
        status: 500
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
        <h1 className="text-4xl font-black text-slate-900 mb-2">New Product</h1>
        <p className="text-slate-500 mb-10 font-medium">Complete all required fields below.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold uppercase text-xs tracking-widest">
              <TagIcon className="h-4 w-4" /> Identity & Price
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text" placeholder="Product Name" required
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={formData.name} onChange={(e) => handleChange(e, null, "name")}
              />
              <input
                type="number" placeholder="Price (USD)" required step="0.01"
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={formData.price} onChange={(e) => handleChange(e, null, "price")}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold uppercase text-xs tracking-widest">
              <PhotoIcon className="h-4 w-4" /> Gallery (Exactly 4 URLs)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.images.map((img, idx) => (
                <input
                  key={idx} type="url" placeholder={`Image URL ${idx + 1}`} required
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white text-sm outline-none"
                  value={img} onChange={(e) => handleChange(e, idx, null, "images")}
                />
              ))}
            </div>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest">Available Colors</h3>
                 <button type="button" onClick={() => addField("colors", { name: "" })} className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-100">+ ADD</button>
              </div>
              <div className="space-y-3">
                {formData.colors.map((color, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-100 bg-slate-50 focus:bg-white outline-none"
                      placeholder="Color name" value={color.name}
                      onChange={(e) => handleChange(e, idx, "name", "colors")}
                    />
                    <button type="button" onClick={() => removeField("colors", idx)} className="text-slate-300 hover:text-red-500 transition"><TrashIcon className="h-5 w-5"/></button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest">Sizes</h3>
                 <button type="button" onClick={() => addField("sizes", { name: "", inStock: true })} className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-100">+ ADD</button>
              </div>
              <div className="space-y-3">
                {formData.sizes.map((size, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      className="w-24 px-4 py-2 text-sm rounded-xl border border-slate-100 bg-slate-50 focus:bg-white outline-none"
                      placeholder="Size" value={size.name}
                      onChange={(e) => handleChange(e, idx, "name", "sizes")}
                    />
                    <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <input type="checkbox" checked={size.inStock} onChange={(e) => handleChange(e, idx, "inStock", "sizes")} className="rounded text-indigo-600" /> STOCK
                    </label>
                    <button type="button" onClick={() => removeField("sizes", idx)} className="ml-auto text-slate-300 hover:text-red-500 transition"><TrashIcon className="h-5 w-5"/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex justify-between items-center mb-6 text-indigo-600 font-bold uppercase text-xs tracking-widest">
              <div className="flex items-center gap-2"><SparklesIcon className="h-4 w-4" /> Key Highlights</div>
              <button type="button" onClick={() => addField("highlights", "")} className="text-[10px] bg-indigo-50 px-2 py-1 rounded-md">+ ADD</button>
            </div>
            <div className="space-y-3">
              {formData.highlights.map((h, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white outline-none text-sm"
                    placeholder="e.g. Water resistant" value={h}
                    onChange={(e) => handleChange(e, idx, null, "highlights")}
                  />
                  <button type="button" onClick={() => removeField("highlights", idx)} className="text-slate-300 hover:text-red-500"><TrashIcon className="h-5 w-5"/></button>
                </div>
              ))}
            </div>
          </div>

          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold uppercase text-xs tracking-widest">
              <DocumentTextIcon className="h-4 w-4" /> Product Copy
            </div>
            <div className="space-y-4">
              <textarea
                placeholder="Brief Description..." rows="3"
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={formData.description} onChange={(e) => handleChange(e, null, "description")}
              />
              <textarea
                placeholder="Technical Details & Care..." rows="2"
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={formData.details} onChange={(e) => handleChange(e, null, "details")}
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-3xl shadow-2xl transition disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? "SAVING TO CATALOG..." : "CONFIRM & ADD PRODUCT"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}