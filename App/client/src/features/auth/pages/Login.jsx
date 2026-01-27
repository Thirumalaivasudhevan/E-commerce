import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast?.() || { addToast: () => { } };

  const handleSubmit = async (e) => {
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

  return (
    <div className="relative w-full h-screen flex items-center justify-center lg:justify-end lg:pr-[29.5%] overflow-hidden font-sans">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src={`/assets/login-bg-final.mp4?v=${new Date().getTime()}`} type="video/mp4" />
      </video>

      {/* Login Card */}
      <div
        className="w-full max-w-[420px] bg-white/60 backdrop-blur-xl p-10 rounded-[30px] shadow-2xl text-center flex flex-col items-center"
      >
        {/* Title */}
        <h2 className="text-[#333] text-[2rem] font-bold mb-8">Login</h2>

        <form onSubmit={handleSubmit} className="w-full text-left">
          {/* Email Field */}
          <div className="w-full mb-6">
            <label className="block text-[0.9rem] text-[#555] mb-2 font-medium ml-1">Email Address</label>
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-[12px] border border-gray-200 bg-white/50 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Password Field */}
          <div className="w-full mb-6">
            <label className="block text-[0.9rem] text-[#555] mb-2 font-medium ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-[12px] border border-gray-200 bg-white/50 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-4 mt-2 border-none rounded-[12px] bg-[#3b82f6] text-white text-[1.1rem] font-bold cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Login'}
          </button>
        </form>

        {/* Forgot Password */}
        <a href="#" className="block text-center text-[0.85rem] text-[#3b82f6] hover:text-blue-700 mt-4 font-medium transition-colors">Forgot Password?</a>

        <p className="mt-8 text-[0.9rem] text-[#666]">
          Don't have an account? <Link to="/register" className="text-[#3b82f6] font-bold hover:underline ml-1">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
