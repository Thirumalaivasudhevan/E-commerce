import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, Eye, EyeOff, AlertCircle, Linkedin, Twitter, Facebook, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = "Valid email is required";
    if (!password) errors.password = "Password is required";
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) return;

    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f9fa] font-['Montserrat'] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[450px] bg-white p-[40px] rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
      >
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#006666] rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-[#006666]/20">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#2b2b2b]">Riho</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#2b2b2b] ml-1">Email Address</label>
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                className={clsx(
                  "w-full pl-11 pr-4 py-3 bg-[#f4f4f4] border border-[#e0e0e0] rounded-lg outline-none transition-all placeholder:text-gray-400 text-sm focus:border-[#006666] focus:ring-2 focus:ring-[#006666]/10",
                  fieldErrors.email && "border-red-500 bg-red-50"
                )}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if(fieldErrors.email) setFieldErrors(prev => ({...prev, email: null}));
                }}
              />
            </div>
            {fieldErrors.email && <p className="text-[10px] font-bold text-red-500 ml-1">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#2b2b2b] ml-1">Password</label>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                className={clsx(
                  "w-full pl-11 pr-12 py-3 bg-[#f4f4f4] border border-[#e0e0e0] rounded-lg outline-none transition-all placeholder:text-gray-400 text-sm focus:border-[#006666] focus:ring-2 focus:ring-[#006666]/10",
                  fieldErrors.password && "border-red-500 bg-red-50"
                )}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if(fieldErrors.password) setFieldErrors(prev => ({...prev, password: null}));
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-[10px] font-bold text-red-500 ml-1">{fieldErrors.password}</p>}
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-xs font-semibold text-[#006666] hover:underline">
              Forgot password?
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3 bg-red-50 text-red-600 text-[12px] rounded-lg border border-red-100 flex items-center gap-2"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 bg-[#006666] text-white rounded-lg font-bold text-sm shadow-xl shadow-[#006666]/20 transition-all hover:bg-[#004d4d] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-semibold tracking-wider">Or continue with</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 py-2.5 border border-[#e0e0e0] rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
            <Linkedin size={18} />
          </button>
          <button className="flex-1 py-2.5 border border-[#e0e0e0] rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
            <Twitter size={18} />
          </button>
          <button className="flex-1 py-2.5 border border-[#e0e0e0] rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
            <Facebook size={18} />
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400 font-medium">
          New here? 
          <Link to="/register" className="ml-1 text-[#006666] font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
