import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutGrid, FolderOpen, ShoppingBag, Mail, MessageSquare, 
  Globe, LogOut, Bell, Search, Menu, Compass, Heart, History, ShoppingCart, Truck,
  PlusCircle, List, CreditCard, FileText, Tag
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const SidebarItem = (props) => {
  const { icon: SidebarIcon, label, path, active } = props;
  return (
    <Link to={path}>
      <div className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 relative group",
        active 
          ? "bg-white/15 text-white font-semibold" 
          : "text-white/70 hover:bg-white/10 hover:text-white"
      )}>
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange rounded-full" />}
        <SidebarIcon size={18} />
        <span className="text-sm">{label}</span>
      </div>
    </Link>
  );
};

export default function Shell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null; 

  const navGroups = [
    {
      title: 'Command',
      items: [
        { label: 'Dashboard', icon: Compass, path: '/' },
      ]
    },
    {
      title: 'Operational',
      items: [
        { label: 'Projects', icon: LayoutGrid, path: '/projects' },
        { label: 'File Manager', icon: FolderOpen, path: '/files' },
      ]
    },
    {
      title: 'Commercial',
      items: [
        { label: 'Add Products', icon: PlusCircle, path: '/ecommerce' },
        { label: 'Products Catalog', icon: ShoppingBag, path: '/ecommerce' },
        { label: 'Product List', icon: List, path: '/inventory' },
        { label: 'Payment Details', icon: CreditCard, path: '/payment-config' },
        { label: 'Order History', icon: History, path: '/orders' },
        { label: 'My Cart', icon: ShoppingCart, path: '/cart' },
        { label: 'Wishlist', icon: Heart, path: '/wishlist' },
        { label: 'Checkout', icon: Truck, path: '/checkout' },
        { label: 'Pricing Tables', icon: Tag, path: '/pricing' },
      ]
    },
    {
      title: 'Communication',
      items: [
        { label: 'Letterbox', icon: Mail, path: '/email' },
        { label: 'Chat', icon: MessageSquare, path: '/chat' },
      ]
    },
    {
      title: 'Culture',
      items: [
        { label: 'Social Feed', icon: Globe, path: '/social' },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-['Montserrat']">
      
      {/* SIDEBAR */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl shadow-primary/20",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
              <div className="w-5 h-5 bg-orange rounded-md shadow-lg shadow-orange/40" />
            </div>
            Riho
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-8 overflow-y-auto no-scrollbar relative">
          {/* Hierarchical Line */}
          <div className="absolute left-[34px] top-8 bottom-8 w-[1px] bg-white/10 pointer-events-none" />
          
          {navGroups.map((group) => (
            <div key={group.title} className="mb-8 relative z-10">
              <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-3">
                {group.title}
              </div>
              {group.items.map((item) => (
                <SidebarItem 
                  key={item.path} 
                  {...item} 
                  active={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
              src={user.avatar || "https://github.com/shadcn.png"} 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-orange/40 p-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate text-white">{user.name}</div>
              <div className="text-[10px] text-white/50 truncate uppercase tracking-wider font-semibold">{user.role || 'Enterprise User'}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-orange text-xs font-bold text-white transition-all shadow-lg active:scale-95"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="h-20 bg-surface border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu size={24} className="text-text-main" />
            </button>
            <div className="h-8 w-1 bg-orange rounded-full hidden md:block" />
            <h1 className="text-xl font-bold text-text-main tracking-tight">
              {location.pathname === '/' 
                ? 'Command Center' 
                : location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.split('/')[1].slice(1)}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-background rounded-2xl border border-gray-200 focus-within:bg-white focus-within:border-primary/30 transition-all overflow-hidden">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-48 font-medium"
              />
            </div>
            <Link to="/wishlist">
              <button className="relative p-2.5 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all active:scale-90">
                <Heart size={20} />
              </button>
            </Link>
            <Link to="/cart">
              <button className="relative p-2.5 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all active:scale-90">
                <ShoppingCart size={20} className="text-primary" />
                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-orange text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white">3</span>
              </button>
            </Link>
            <button className="relative p-2.5 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all active:scale-90">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange rounded-full border-2 border-white animate-pulse"></span>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT SCROLLER */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 no-scrollbar">
           <Outlet />
        </main>
      </div>
    </div>
  );
}
