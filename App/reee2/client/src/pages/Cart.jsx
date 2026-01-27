import { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Ticket, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCartItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;
    try {
      await api.put(`/cart/${id}`, { quantity: newQty });
      setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/cart/${id}`);
      setCartItems(cartItems.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'RIHO50') {
        setDiscountPercent(50);
        setCouponMessage('Enterprise Strategic Discount: 50% Apply Successful');
    } else if (coupon.toUpperCase() === 'ATOMIC') {
        setDiscountPercent(15);
        setCouponMessage('Atomic Architecture Promo: 15% Apply Successful');
    } else {
        setDiscountPercent(0);
        setCouponMessage('Invalid Protocol Code');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const promoDiscount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - promoDiscount;
  const tax = taxableAmount * 0.1;
  const total = taxableAmount + tax;

  if (loading) return <div className="p-20 text-center font-black text-gray-400 animate-pulse">Initializing transmission...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-12 font-['Montserrat'] animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50 gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#2b2b2b] tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-[#e6f2f2] rounded-2xl text-[#006666]">
                <ShoppingCart size={32} />
             </div>
             Unified Commerce Cart
          </h2>
          <p className="text-sm text-gray-400 font-bold mt-2 uppercase tracking-widest pl-1">Reviewing atomic units for deployment</p>
        </div>
        <Link 
          to="/ecommerce" 
          className="px-6 py-3 bg-[#f8f9fa] text-[#2b2b2b] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#006666] hover:text-white transition-all flex items-center gap-2"
        >
          <ShoppingBag size={16} /> Market Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.length === 0 ? (
            <div className="bg-white p-20 rounded-[2rem] border-2 border-dashed border-gray-100 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <ShoppingCart size={40} className="text-gray-200" />
              </div>
              <h3 className="text-3xl font-black text-[#2b2b2b]">Operational Empty</h3>
              <p className="text-gray-400 mt-2 mb-10 font-medium">Your current deployment queue contains zero units.</p>
              <button 
                onClick={() => navigate('/ecommerce')}
                className="px-12 py-5 bg-[#006666] text-white rounded-2xl font-black text-sm shadow-2xl shadow-[#006666]/30 active:scale-95 transition-all"
              >
                Scan Marketplace
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 flex flex-col sm:flex-row items-center gap-10 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-transparent group-hover:bg-[#006666] transition-all" />
                
                <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                  <img src={item.product.image} className="w-full h-full object-cover" alt={item.product.name} />
                </div>
                
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="inline-flex px-3 py-1 bg-[#e6f2f2] text-[#006666] text-[10px] font-black uppercase tracking-[0.2em] rounded-md mb-4">
                    {item.product.category}
                  </div>
                  <h4 className="font-black text-[#2b2b2b] text-xl mb-1 truncate">{item.product.name}</h4>
                  <div className="text-sm font-bold text-gray-300 uppercase tracking-tighter">REF: {item.product.id.slice(-8).toUpperCase()}</div>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white hover:text-[#006666] rounded-xl transition-all text-gray-400"><Minus size={16} /></button>
                    <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white hover:text-[#006666] rounded-xl transition-all text-gray-400"><Plus size={16} /></button>
                    </div>
                    <div className="text-2xl font-black text-[#2b2b2b]">${(item.product.price * item.quantity).toFixed(2)}</div>
                </div>

                <button 
                  onClick={() => removeItem(item.id)}
                  className="sm:absolute sm:top-8 sm:right-8 p-3 text-gray-200 hover:text-[#fe6a49] transition-colors"
                >
                  <Trash2 size={24} strokeWidth={2.5} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Tactical Summary */}
        <div className="space-y-8">
          <div className="bg-[#2b2b2b] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
            
            <h3 className="text-2xl font-black mb-8 relative z-10">Strategic Review</h3>
            
            <div className="space-y-6 mb-10 relative z-10">
              <div className="flex justify-between items-center text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
                <span>Gross Inventory</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              
              {discountPercent > 0 && (
                <div className="flex justify-between items-center text-xs font-bold text-[#fe6a49] uppercase tracking-[0.2em]">
                   <span>Strategic Discount</span>
                   <span>−${promoDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
                <span>Logistics (Standard)</span>
                <span className="text-green-500">OPTIMIZED</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
                <span>Modular Tax (10%)</span>
                <span className="text-white">${tax.toFixed(2)}</span>
              </div>
              
              <div className="pt-8 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm font-black text-[#fe6a49] uppercase tracking-widest">Net Payable</span>
                <span className="text-4xl font-black tracking-tighter">${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              disabled={cartItems.length === 0}
              onClick={() => navigate('/checkout')}
              className="w-full py-5 bg-[#006666] text-white rounded-2xl font-black text-sm shadow-2xl shadow-[#006666]/30 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
            >
              Initiate Checkout <ArrowRight size={20} />
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-[#fef0ec] rounded-xl text-[#fe6a49]">
                    <Ticket size={20} />
                </div>
                <h4 className="text-lg font-black text-[#2b2b2b]">Strategic Coupons</h4>
             </div>
             
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="PROTOCOL CODE" 
                  className="w-full bg-gray-50 border border-transparent rounded-xl py-4 pl-5 pr-14 text-xs font-black uppercase tracking-widest placeholder:text-gray-300 outline-none focus:border-[#006666] focus:bg-white transition-all"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button 
                  onClick={applyCoupon}
                  className="absolute right-2 top-2 bottom-2 px-3 bg-[#006666] text-white rounded-lg text-[10px] font-black uppercase"
                >
                    FIX
                </button>
             </div>
             
             {couponMessage && (
                <div className={clsx("text-[10px] font-black uppercase tracking-widest flex items-center gap-2", discountPercent > 0 ? "text-green-500" : "text-red-400")}>
                    {discountPercent > 0 ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />}
                    {couponMessage}
                </div>
             )}

             <div className="pt-4 border-t border-gray-50">
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-relaxed text-center">
                    Enter <span className="text-[#fe6a49]">RIHO50</span> or <span className="text-[#fe6a49]">ATOMIC</span> for authorized reductions.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
