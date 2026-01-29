import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Clock } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';

export default function Login() {
  const [view, setView] = useState('login'); // 'login' | 'forgot'

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Forgot Password State
  const [resetStep, setResetStep] = useState(0); // 0: Email, 1: OTP, 2: New Password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [timer, setTimer] = useState(600); // 10 minutes in seconds

  const [isLoading, setIsLoading] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Fallback timeout to ensure UI shows even if video fails event
  useState(() => {
    const timer = setTimeout(() => setIsVideoLoaded(true), 3000); // 3s max wait
    return () => clearTimeout(timer);
  });

  // Timer Countdown
  useEffect(() => {
    let interval;
    if (view === 'forgot' && resetStep === 1 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, resetStep, timer]);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast?.() || { addToast: () => { } };

  // Format Time M:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast?.('Please fill in all fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      addToast?.('Welcome back!', 'success');
      navigate('/');
    } catch (err) {
      addToast?.(
        err.response?.data?.message || 'Invalid email or password',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return addToast?.('Please enter your email', 'error');

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      addToast?.('OTP sent to your email', 'success');
      setResetStep(1);
      setTimer(600); // Reset timer to 10 mins
    } catch (err) {
      addToast?.(err.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return addToast?.('Please enter valid 6-digit OTP', 'error');

    setIsLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      addToast?.('OTP Verified', 'success');
      setResetStep(2);
    } catch (err) {
      addToast?.(err.response?.data?.message || 'Invalid OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return addToast?.('Password must be at least 6 chars', 'error');

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      addToast?.('Password reset successful! Please login.', 'success');
      setView('login');
      setResetStep(0);
      setOtp('');
      setNewPassword('');
    } catch (err) {
      addToast?.(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center lg:justify-end lg:pr-32 overflow-hidden font-sans">

      {/* 🚀 Initial Loading Screen */}
      <AnimatePresence>
        {!isVideoLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center"
          >
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <p className="text-gray-500 font-medium tracking-wide">Initializing Nexus...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlayThrough={() => setIsVideoLoaded(true)}
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src="/assets/Login_Animation.mp4" type="video/mp4" />
      </video>

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={isVideoLoaded ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] bg-white/60 backdrop-blur-xl p-10 rounded-[30px] shadow-2xl text-center flex flex-col items-center text-gray-900 overflow-hidden relative"
      >
        <AnimatePresence mode="wait">
          {view === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <h2 className="text-gray-900 text-[2rem] font-bold mb-8">Login</h2>
              <form onSubmit={handleLogin} className="w-full text-left">
                <div className="w-full mb-6">
                  <label className="block text-[0.9rem] text-gray-800 mb-2 font-medium ml-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 rounded-[12px] border border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="w-full mb-6">
                  <label className="block text-[0.9rem] text-gray-800 mb-2 font-medium ml-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 rounded-[12px] border border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full p-4 mt-2 border-none rounded-[12px] bg-[#3b82f6] text-white text-[1.1rem] font-bold cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                >
                  {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Login'}
                </button>
              </form>
              <button
                onClick={() => setView('forgot')}
                className="block w-full text-center text-[0.85rem] text-[#3b82f6] hover:text-blue-700 mt-4 font-medium transition-colors"
              >
                Forgot Password?
              </button>
              <p className="mt-8 text-[0.9rem] text-[#666]">
                Don't have an account? <Link to="/register" className="text-[#3b82f6] font-bold hover:underline ml-1">Sign Up</Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="flex items-center justify-center mb-6">
                {/* Progress Indicator or Icon could go here */}
                <h2 className="text-gray-900 text-[1.5rem] font-bold">
                  {resetStep === 0 && 'Reset Password'}
                  {resetStep === 1 && 'Enter OTP'}
                  {resetStep === 2 && 'New Password'}
                </h2>
              </div>

              {/* Step 0: Email */}
              {resetStep === 0 && (
                <form onSubmit={handleSendOTP} className="w-full text-left">
                  <p className="text-gray-600 mb-6 text-sm text-center">Enter your email for the verification code.</p>
                  <div className="w-full mb-6">
                    <label className="block text-[0.9rem] text-gray-800 mb-2 font-medium ml-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="Email address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-4 rounded-[12px] border border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full p-4 rounded-[12px] bg-[#3b82f6] text-white text-[1.1rem] font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-transform">
                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Send OTP'}
                  </button>
                </form>
              )}

              {/* Step 1: OTP */}
              {resetStep === 1 && (
                <form onSubmit={handleVerifyOTP} className="w-full text-left">
                  <p className="text-gray-600 mb-4 text-sm text-center">We sent a code to <span className="font-bold text-gray-800">{email}</span></p>

                  <div className="w-full mb-6 text-center">
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="0 0 0 0 0 0"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-[200px] text-center p-4 text-2xl tracking-[0.5em] rounded-[12px] border border-gray-200 bg-white/50 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
                    <Clock size={16} className="mr-1" />
                    <span className={timer < 60 ? "text-red-500 font-bold" : ""}>Expires in {formatTime(timer)}</span>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full p-4 rounded-[12px] bg-[#3b82f6] text-white text-[1.1rem] font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-transform">
                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Verify Code'}
                  </button>
                  <div className="mt-4 text-center">
                    <button type="button" onClick={handleSendOTP} className="text-sm text-blue-500 hover:underline">Resend Code</button>
                  </div>
                </form>
              )}

              {/* Step 2: New Password */}
              {resetStep === 2 && (
                <form onSubmit={handleResetPassword} className="w-full text-left">
                  <p className="text-gray-600 mb-6 text-sm text-center">Set your new password.</p>
                  <div className="w-full mb-6">
                    <label className="block text-[0.9rem] text-gray-800 mb-2 font-medium ml-1">New Password</label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-4 rounded-[12px] border border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full p-4 rounded-[12px] bg-[#3b82f6] text-white text-[1.1rem] font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-transform">
                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Reset Password'}
                  </button>
                </form>
              )}

              <button
                onClick={() => { setView('login'); setResetStep(0); }}
                className="block w-full text-center mt-6 text-[#3b82f6] font-bold hover:underline transition-colors flex items-center justify-center"
              >
                <ArrowLeft size={16} className="mr-1" /> Back to Login
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
