import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, User, Eye, EyeOff, CheckCircle, AlertCircle, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password Validation Logic
  const validation = useMemo(() => {
    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };
  }, [password]);

  const passwordStrength = Object.values(validation).filter(Boolean).length;

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Full name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = "Valid email is required";
    
    if (!validation.length) errors.password = "Password must be at least 8 characters";
    else if (passwordStrength < 5) errors.password = "Password must meet all complexity requirements";

    if (!agreed) errors.agreed = "You must agree to the terms";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) return;

    setIsLoading(true);

    try {
      await register(name, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f9fa] font-['Montserrat'] p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] bg-white p-[40px] rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
      >
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-[#006666] rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-[#006666]/20">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#2b2b2b]">Riho</h1>
          <p className="text-sm text-gray-400 mt-1 text-center">Join thousands of teams managing their workflow</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2b2b2b] ml-1 uppercase tracking-wider opacity-70 cursor-default">Full Name</label>
            <div className="relative group">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006666] transition-colors" />
              <input
                type="text"
                className={clsx(
                  "w-full pl-11 pr-4 py-3 bg-[#f4f4f4] border border-[#e0e0e0] rounded-lg outline-none transition-all placeholder:text-gray-400 text-sm focus:border-[#006666]",
                  fieldErrors.name && "border-red-500 bg-red-50"
                )}
                placeholder="John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if(fieldErrors.name) setFieldErrors(prev => ({...prev, name: null}));
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2b2b2b] ml-1 uppercase tracking-wider opacity-70 cursor-default">Email Address</label>
            <div className="relative group">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006666] transition-colors" />
              <input
                type="email"
                className={clsx(
                  "w-full pl-11 pr-4 py-3 bg-[#f4f4f4] border border-[#e0e0e0] rounded-lg outline-none transition-all placeholder:text-gray-400 text-sm focus:border-[#006666]",
                  fieldErrors.email && "border-red-500 bg-red-50"
                )}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if(fieldErrors.email) setFieldErrors(prev => ({...prev, email: null}));
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2b2b2b] ml-1 uppercase tracking-wider opacity-70 cursor-default">Password</label>
            <div className="relative group">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006666] transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                className={clsx(
                  "w-full pl-11 pr-12 py-3 bg-[#f4f4f4] border border-[#e0e0e0] rounded-lg outline-none transition-all placeholder:text-gray-400 text-sm focus:border-[#006666]",
                  fieldErrors.password && "border-red-500 bg-red-50"
                )}
                placeholder="••••••••"
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
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {/* Password Validation Requirements */}
            <div className="p-3 bg-gray-50 rounded-lg mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] border border-gray-100">
              <div className={clsx("flex items-center gap-1.5", validation.length ? "text-[#006666] font-bold" : "text-gray-400")}>
                 <CheckCircle size={10} className={clsx(validation.length ? "opacity-100" : "opacity-30")} /> 8+ Characters
              </div>
              <div className={clsx("flex items-center gap-1.5", validation.upper ? "text-[#006666] font-bold" : "text-gray-400")}>
                 <CheckCircle size={10} className={clsx(validation.upper ? "opacity-100" : "opacity-30")} /> Uppercase
              </div>
              <div className={clsx("flex items-center gap-1.5", validation.lower ? "text-[#006666] font-bold" : "text-gray-400")}>
                 <CheckCircle size={10} className={clsx(validation.lower ? "opacity-100" : "opacity-30")} /> Lowercase
              </div>
              <div className={clsx("flex items-center gap-1.5", validation.number ? "text-[#006666] font-bold" : "text-gray-400")}>
                 <CheckCircle size={10} className={clsx(validation.number ? "opacity-100" : "opacity-30")} /> Number
              </div>
              <div className={clsx("flex items-center gap-1.5", validation.special ? "text-[#006666] font-bold" : "text-gray-400")}>
                 <CheckCircle size={10} className={clsx(validation.special ? "opacity-100" : "opacity-30")} /> Special Symbol
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 py-2">
            <input 
              type="checkbox" 
              id="agreed" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className={clsx(
                "w-4 h-4 rounded border-gray-300 text-[#006666] focus:ring-[#006666] cursor-pointer transition-all mt-0.5",
                fieldErrors.agreed && "border-red-500 ring-2 ring-red-500/10"
              )} 
            />
            <label htmlFor="agreed" className="text-xs text-gray-500 leading-tight select-none cursor-pointer">
              I agree to the <span className="font-bold text-[#2b2b2b] underline">Terms of Service</span> and <span className="font-bold text-[#2b2b2b] underline">Privacy Policy</span>.
            </label>
          </div>

          <AnimatePresence>
            {(error || fieldErrors.agreed) && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2 font-medium">
                <AlertCircle size={14} /> {error || fieldErrors.agreed}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 bg-[#006666] text-white rounded-lg font-bold text-sm shadow-xl shadow-[#006666]/20 transition-all hover:bg-[#004d4d] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400 font-medium">
          Already have an account? 
          <Link to="/login" className="ml-1 text-[#006666] font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
