import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, ShoppingBag, Mail, Globe, 
  ArrowUpRight, Users, Briefcase, Zap 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const PillarCard = ({ title, description, icon: Icon, path, colorClass, delay }) => {
  const navigate = useNavigate();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => navigate(path)}
      className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer overflow-hidden"
    >
      <div className={`inline-flex p-4 rounded-2xl ${colorClass} bg-opacity-10 mb-6 group-hover:scale-110 transition-transform`}>
        <Icon size={32} className={colorClass.replace('bg-', 'text-')} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">
        {description}
      </p>
      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Enter Command Center <ArrowUpRight size={14} />
      </div>
      
      {/* Decorative background element */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${colorClass} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`} />
    </motion.div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();

  const pillars = [
    {
      title: "Operational Management",
      description: "Treat project tracking and file storage as a single source of truth. Fragmented silos are a thing of the past.",
      icon: LayoutGrid,
      path: "/projects",
      colorClass: "bg-blue-600",
      delay: 0.1
    },
    {
      title: "Commercial Engine",
      description: "Integrate your storefront directly into your workspace. Transition from internal tasks to external sales seamlessly.",
      icon: ShoppingBag,
      path: "/ecommerce",
      colorClass: "bg-red-600",
      delay: 0.2
    },
    {
      title: "Omnichannel Communication",
      description: "Balance Synchronous and Asynchronous workflows. Email records and Instant Chat, side-by-side.",
      icon: Mail,
      path: "/email",
      colorClass: "bg-amber-600",
      delay: 0.3
    },
    {
      title: "Internal Culture",
      description: "Transform your digital workplace into a community. Team engagement and office culture, unified.",
      icon: Globe,
      path: "/social",
      colorClass: "bg-purple-600",
      delay: 0.4
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-extrabold text-text-main tracking-tight"
          >
            Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-text-muted mt-2"
          >
            Your Unified Enterprise Command Center is ready.
          </motion.p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
             <div className="p-2 bg-green-50 rounded-lg text-green-600"><Users size={18}/></div>
             <div>
               <div className="text-[10px] text-gray-400 font-bold uppercase">Teammates</div>
               <div className="text-sm font-bold">12 Online</div>
             </div>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
             <div className="p-2 bg-primary/5 rounded-lg text-primary"><Briefcase size={18}/></div>
             <div>
               <div className="text-[10px] text-gray-400 font-bold uppercase">Pulse</div>
               <div className="text-sm font-bold text-primary">Active</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {pillars.map(pillar => (
          <PillarCard key={pillar.title} {...pillar} />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-red-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-red-900/20"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Zap size={14} /> Ecosystem Status
          </div>
          <h2 className="text-3xl font-bold mb-4">Zero Context-Switching Philosophy</h2>
          <p className="text-red-100 text-lg leading-relaxed">
            Eliminate the "toggle tax." Riho houses your entire business lifecycle—from initial project planning to final commercial sale—inside a single high-performance ecosystem.
          </p>
          <button className="mt-8 bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors">
            View System Analytics
          </button>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent skew-x-12" />
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white opacity-5 blur-3xl" />
      </motion.div>
    </div>
  );
}
