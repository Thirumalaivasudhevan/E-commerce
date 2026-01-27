import { useState, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff, Loader2, ArrowRight, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useToast } from '../../../components/ui/Toast';
import Lottie from 'lottie-react';
import rocketAnimation from '../../../assets/rocket.json';


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

    if (!validate()) {
      return;
    }

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
    <div className="min-h-screen bg-black flex overflow-hidden">

      {/* Left Panel - Animation Section */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-12 bg-surface border-r border-border overflow-hidden">

        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(var(--primary-rgb),0.05),transparent_70%)]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full opacity-30 animate-[spin_50s_linear_infinite]" />





        {/* Animation Container */}
        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 10, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: [0, -15, 0],
            rotateX: [10, 0, 10],
            scale: 1
          }}
          transition={{
            opacity: { duration: 0.8, delay: 0.2 },
            scale: { duration: 0.8, delay: 0.2 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ perspective: '1000px' }}
          className="relative z-10 w-full max-w-lg aspect-square lg:scale-125"
        >
          <Lottie
            animationData={rocketAnimation}
            loop={true}
            className="w-full h-full drop-shadow-[0_20px_50px_rgba(var(--primary-rgb),0.5)]"
          />
        </motion.div>

        {/* Text/Marketing Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 mt-2 text-center max-w-md"
        >
          <h2 className="text-3xl font-bold text-text-main mb-4">Secure Access Portal</h2>
          <p className="text-text-muted text-lg">
            Create your login to access the full power of Nexus. Secure, scalable, and built for developers.
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-4 lg:p-12 overflow-y-auto">

        {/* Mobile Background Elements (only visible on mobile) */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="lg:hidden absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 translate-x-1/2" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-surface lg:bg-transparent border lg:border-none border-border p-8 lg:p-0 rounded-2xl lg:rounded-none shadow-2xl lg:shadow-none shadow-black/50">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-surface-highlight rounded-xl mb-4 border border-border shadow-inner">
                <Sparkles className="text-primary" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-text-main mb-2">Create Account</h1>
              <p className="text-text-muted text-sm">Join Nexus and start building today.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* NAME FIELD */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors z-10 pointer-events-none" size={18} />
                  <input
                    type="text"
                    className={clsx(
                      "nexus-input pl-11 py-3 bg-surface-highlight border-border focus:bg-surface transition-colors",
                      fieldErrors.name && "border-red-500 focus:border-red-500"
                    )}
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: null }));
                    }}
                  />
                </div>
                <AnimatePresence>
                  {fieldErrors.name && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-[10px] text-red-500 ml-1 flex items-center gap-1 mt-1">
                      <AlertCircle size={10} /> {fieldErrors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* EMAIL FIELD */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors z-10 pointer-events-none" size={18} />
                  <input
                    type="email"
                    className={clsx(
                      "nexus-input pl-11 py-3 bg-surface-highlight border-border focus:bg-surface transition-colors",
                      fieldErrors.email && "border-red-500 focus:border-red-500"
                    )}
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }));
                    }}
                  />
                </div>
                <AnimatePresence>
                  {fieldErrors.email && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-[10px] text-red-500 ml-1 flex items-center gap-1 mt-1">
                      <AlertCircle size={10} /> {fieldErrors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* PASSWORD FIELD */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors z-10 pointer-events-none" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className={clsx(
                      "nexus-input pl-11 pr-12 py-3 bg-surface-highlight border-border focus:bg-surface transition-colors",
                      fieldErrors.password && "border-red-500 focus:border-red-500"
                    )}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors z-10"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Validation Requirements - Compact View */}
                <div className="p-2 bg-surface-highlight rounded-lg mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] border border-border">
                  <div className={clsx("flex items-center gap-1", validation.length ? "text-primary font-bold" : "text-text-muted")}>
                    <div className={clsx("w-1 h-1 rounded-full", validation.length ? "bg-primary" : "bg-text-muted")} /> 8+ Chars
                  </div>
                  <div className={clsx("flex items-center gap-1", validation.upper ? "text-primary font-bold" : "text-text-muted")}>
                    <div className={clsx("w-1 h-1 rounded-full", validation.upper ? "bg-primary" : "bg-text-muted")} /> Uppercase
                  </div>
                  <div className={clsx("flex items-center gap-1", validation.lower ? "text-primary font-bold" : "text-text-muted")}>
                    <div className={clsx("w-1 h-1 rounded-full", validation.lower ? "bg-primary" : "bg-text-muted")} /> Lowercase
                  </div>
                  <div className={clsx("flex items-center gap-1", validation.number ? "text-primary font-bold" : "text-text-muted")}>
                    <div className={clsx("w-1 h-1 rounded-full", validation.number ? "bg-primary" : "bg-text-muted")} /> Number
                  </div>
                  <div className={clsx("flex items-center gap-1", validation.special ? "text-primary font-bold" : "text-text-muted")}>
                    <div className={clsx("w-1 h-1 rounded-full", validation.special ? "bg-primary" : "bg-text-muted")} /> Symbol
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 py-1">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="agreed"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className={clsx(
                      "w-4 h-4 rounded border-border bg-surface-highlight text-primary focus:ring-primary cursor-pointer transition-all",
                      fieldErrors.agreed && "border-red-500 ring-1 ring-red-500"
                    )}
                  />
                </div>
                <label htmlFor="agreed" className="text-[11px] text-text-muted leading-tight select-none cursor-pointer">
                  I agree to the <span className="font-bold text-text-main underline hover:text-primary transition-colors">Terms of Service</span>.
                </label>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-3 bg-red-500/10 text-red-500 text-[11px] rounded-lg border border-red-500/20 flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    Sign Up Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-text-muted text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-bold hover:text-white transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center lg:hidden">
            <p className="text-xs text-text-muted/50 font-medium">© 2026 Nexus Inc. Secure System.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
