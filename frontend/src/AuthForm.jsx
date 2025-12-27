"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserIcon, 
  LockClosedIcon, 
  EnvelopeIcon, 
  ArrowRightIcon, 
  SparklesIcon,
  EyeIcon,        
  EyeSlashIcon    
} from "@heroicons/react/24/outline";
import { useError } from "./ErrorContext.jsx";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AuthForm() {
  const navigate = useNavigate();
  const { setError: setGlobalError } = useError(); 
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [formData, setFormData] = useState({
    loginUsername: "",
    loginPassword: "",
    email: "",
    signupUsername: "",
    signupPassword: "",
  });
    
  const [localError, setLocalError] = useState(""); 
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");
    setIsLoading(true);

    const isLogin = activeTab === "login";
    const url = `${import.meta.env.VITE_API_URL}/${isLogin ? "login" : "register"}`;

    const payload = isLogin 
      ? { username: formData.loginUsername, password: formData.loginPassword } 
      : { username: formData.signupUsername, password: formData.signupPassword, email: formData.email };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) { 
        if (response.status >= 500) {
          throw {
            message: data.message || "The authentication server is currently down.",
            status: response.status,
            statusText: "Internal Server Error"
          };
        }
        
        setLocalError(data.message || "Invalid credentials.");
        return; 
      }

      setSuccess(isLogin ? "Welcome back! Redirecting..." : "Account created successfully!");
      
      setTimeout(() => {
        window.location.href = "/"; 
      }, 1500);

    } catch (err) {
      if (err.message === "Failed to fetch") {
        setGlobalError({
          message: "Unable to reach the login server. Please check your connection.",
          status: 503
        });
      } else {
        setGlobalError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex flex-col selection:bg-indigo-100 overflow-hidden relative">
      <Navbar />

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[120px]" />

      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px]"
        >
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white dark:border-zinc-800 overflow-hidden">
            
            <div className="p-8 pb-4 text-center">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 mb-4">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeTab === "login" ? "Welcome back" : "Join the club"}
              </h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mt-2 font-medium">
                {activeTab === "login" ? "Enter your details to access your account" : "Start your journey with us today"}
              </p>
            </div>

            <div className="px-8 mb-4">
              <div className="flex bg-slate-100/50 dark:bg-zinc-800/50 p-1.5 rounded-2xl relative">
                <motion.div 
                  className="absolute inset-y-1.5 bg-white dark:bg-zinc-700 shadow-sm rounded-xl z-0"
                  initial={false}
                  animate={{ 
                    x: activeTab === "login" ? 0 : "100%", 
                    width: "calc(50% - 6px)" 
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider z-10 transition-colors ${activeTab === "login" ? "text-indigo-600 dark:text-white" : "text-slate-400"}`}
                  onClick={() => { setActiveTab("login"); setLocalError(""); setShowPassword(false); }}
                >
                  Login
                </button>
                <button
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider z-10 transition-colors ${activeTab === "signup" ? "text-indigo-600 dark:text-white" : "text-slate-400"}`}
                  onClick={() => { setActiveTab("signup"); setLocalError(""); setShowPassword(false); }}
                >
                  Signup
                </button>
              </div>
            </div>

            <div className="px-8 pb-10">
              <AnimatePresence mode="wait">
                <motion.form
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "login" ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === "login" ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {activeTab === "signup" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                      <div className="relative group">
                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          name="email"
                          type="email"
                          required
                          placeholder="name@company.com"
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        name={activeTab === "login" ? "loginUsername" : "signupUsername"}
                        type="text"
                        required
                        placeholder="username"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm"
                        value={activeTab === "login" ? formData.loginUsername : formData.signupUsername}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                      {activeTab === "login" && (
                        <button type="button" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors">Forgot?</button>
                      )}
                    </div>
                    <div className="relative group">
                      <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        name={activeTab === "login" ? "loginPassword" : "signupPassword"}
                        type={showPassword ? "text" : "password"} 
                        required
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm"
                        value={activeTab === "login" ? formData.loginPassword : formData.signupPassword}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors p-1"
                      >
                        {showPassword ? (
                          <EyeIcon className="h-5 w-5" />
                        ) : (
                          <EyeSlashIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {localError && <p className="text-xs font-bold text-rose-500 text-center bg-rose-50 dark:bg-rose-500/10 py-2 rounded-lg">{localError}</p>}
                  {success && <p className="text-xs font-bold text-emerald-500 text-center bg-emerald-50 dark:bg-emerald-500/10 py-2 rounded-lg">{success}</p>}

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-6"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{activeTab === "login" ? "Sign In" : "Create Account"}</span>
                        <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              </AnimatePresence>
            </div>
          </div>
          
          <motion.p 
            layout
            className="mt-8 text-center text-sm text-slate-400 font-medium"
          >
            {activeTab === "login" ? "New to the platform?" : "Joined us before?"}{" "}
            <button 
              onClick={() => {
                setActiveTab(activeTab === "login" ? "signup" : "login");
                setLocalError("");
                setShowPassword(false); 
              }}
              className="text-indigo-600 dark:text-indigo-400 font-black hover:underline underline-offset-4"
            >
              {activeTab === "login" ? "Create an account" : "Login to account"}
            </button>
          </motion.p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}