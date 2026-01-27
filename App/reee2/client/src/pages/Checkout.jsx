import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { CreditCard, Truck, User, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle2, X, AlertCircle, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export default function Checkout() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [formData, setFormData] = useState({
    name: user?.name || '', 
    email: user?.email || '', 
    phone: '',
    address: '', city: '', state: '', zip: '',
    paymentMethod: 'card'
  });
  const [loading, setLoading] = useState(true);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get('/cart');
      if (res.data.length === 0) navigate('/cart');
      setCartItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCart();
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [fetchCart, user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({...errors, [e.target.name]: ''});
    }
  };

  const validateStep = (currentStep) => {
    let newErrors = {};
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone is required";
      } else if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = "Phone must be exactly 10 digits";
      }
    }
    if (currentStep === 2) {
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.zip.trim()) {
        newErrors.zip = "Pin Code is required";
      } else if (!/^\d{6}$/.test(formData.zip)) {
        newErrors.zip = "Pin Code must be exactly 6 digits";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shippingCost = shippingMethod === 'express' ? 15 : 0;
  const tax = (subtotal + shippingCost) * 0.1;
  const total = subtotal + shippingCost + tax;

  const handleSubmitOrder = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        totalAmount: total,
        paymentMethod: formData.paymentMethod,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        phone: formData.phone,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        }))
      };
      const res = await api.post('/orders', payload);
      setCreatedOrderId(res.data.id);
      setStep(5); // Success step
    } catch (err) {
      console.error(err);
      alert("Failed to process order");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Initializing checkout...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-['Montserrat'] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header / Steps Indicator */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
           <div className="h-full bg-[#006666] transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
        
        <div className="flex items-center justify-between w-full pr-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all",
              step === s ? "bg-[#006666] text-white scale-110 shadow-lg" : 
              step > s ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
            )}>
              {step > s ? <CheckCircle2 size={18} /> : s}
            </div>
            <span className={clsx(
              "text-[10px] font-black uppercase tracking-widest hidden lg:block",
              step === s ? "text-[#2b2b2b]" : "text-gray-400"
            )}>
              {s === 1 ? 'Information' : s === 2 ? 'Shipping' : s === 3 ? 'Payment' : 'Review'}
            </span>
            {s < 4 && <div className="hidden lg:block w-12 h-px bg-gray-200 mx-4" />}
          </div>
        ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300 flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-[#e6f2f2] rounded-lg text-[#006666]">
                      <User size={20} />
                   </div>
                   <h3 className="text-xl font-black text-[#2b2b2b]">Personal Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5 block">Full Name</label>
                    <input name="name" className={clsx("w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-[#006666] focus:bg-white transition-all", errors.name && "border-red-500 bg-red-50")} value={formData.name} onChange={handleInputChange} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5 block">Email Address</label>
                    <input name="email" className={clsx("w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-[#006666] focus:bg-white transition-all", errors.email && "border-red-500 bg-red-50")} value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5 block">Phone Number</label>
                    <input type="tel" name="phone" className={clsx("w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-[#006666] focus:bg-white transition-all", errors.phone && "border-red-500 bg-red-50")} value={formData.phone} onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: val });
                      if (errors.phone) setErrors({...errors, phone: ''});
                    }} placeholder="1234567890" maxLength={10} />
                  </div>
                </div>
                <div className="mt-auto pt-8 flex gap-4">
                  <button onClick={() => navigate('/cart')} className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-[#2b2b2b] transition-colors">Return to Cart</button>
                  <button onClick={handleNextStep} className="flex-[2] py-4 bg-[#006666] text-white rounded-xl font-black text-sm shadow-xl shadow-[#006666]/20 transition-all active:scale-[0.98]">Proceed to Shipping</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300 flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-[#e6f2f2] rounded-lg text-[#006666]">
                      <Truck size={20} />
                   </div>
                   <h3 className="text-xl font-black text-[#2b2b2b]">Shipping Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5 block">Street Address</label>
                    <input name="address" className={clsx("w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-[#006666] focus:bg-white transition-all", errors.address && "border-red-500 bg-red-50")} value={formData.address} onChange={handleInputChange} placeholder="123 Business Way" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5 block">City</label>
                    <input name="city" className={clsx("w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-[#006666] focus:bg-white transition-all", errors.city && "border-red-500 bg-red-50")} value={formData.city} onChange={handleInputChange} placeholder="New York" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5 block">State / Region</label>
                    <input name="state" className={clsx("w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-[#006666] focus:bg-white transition-all", errors.state && "border-red-500 bg-red-50")} value={formData.state} onChange={handleInputChange} placeholder="NY" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5 block">Pin Code</label>
                    <input type="text" name="zip" className={clsx("w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-[#006666] focus:bg-white transition-all", errors.zip && "border-red-500 bg-red-50")} value={formData.zip} onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, zip: val });
                      if (errors.zip) setErrors({...errors, zip: ''});
                    }} placeholder="100011" maxLength={6} />
                  </div>
                </div>

                <div className="pt-4">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-3 block">Shipping Method</label>
                  <div className="grid grid-cols-2 gap-4">
                     <button 
                       onClick={() => setShippingMethod('standard')}
                       className={clsx("p-4 rounded-xl border-2 text-left transition-all", shippingMethod === 'standard' ? "border-[#006666] bg-[#e6f2f2]/30" : "border-gray-100 hover:border-gray-200")}
                     >
                        <div className="font-bold text-sm">Standard Delivery</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 italic">3-5 Business Days • Free</div>
                     </button>
                     <button 
                       onClick={() => setShippingMethod('express')}
                       className={clsx("p-4 rounded-xl border-2 text-left transition-all", shippingMethod === 'express' ? "border-[#fe6a49] bg-[#fe6a49]/5" : "border-gray-100 hover:border-gray-200")}
                     >
                        <div className="font-bold text-sm flex items-center gap-1.5">Express Shipping <Zap size={14} className="text-[#fe6a49]" /></div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 italic">Next-Day Delivery • $15.00</div>
                     </button>
                  </div>
                </div>

                <div className="mt-auto pt-8 flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-[#2b2b2b] transition-colors flex items-center justify-center gap-2"><ArrowLeft size={16}/> Back</button>
                  <button onClick={handleNextStep} className="flex-[2] py-4 bg-[#006666] text-white rounded-xl font-black text-sm shadow-xl shadow-[#006666]/20 transition-all active:scale-[0.98]">Confirm Logistics</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300 flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-[#e6f2f2] rounded-lg text-[#006666]">
                      <CreditCard size={20} />
                   </div>
                   <h3 className="text-xl font-black text-[#2b2b2b]">Payment Matrix</h3>
                </div>
                
                <div className="bg-[#fe6a49]/10 text-[#fe6a49] p-4 rounded-xl flex items-start gap-4 text-sm font-medium border border-[#fe6a49]/20">
                  <ShieldCheck size={24} className="shrink-0" />
                  <div>
                     <p className="font-bold">Sandbox Environment Active</p>
                     <p className="text-xs mt-1 opacity-80 font-bold uppercase tracking-tight">Payments are simulated. Live transactions are currently restricted.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'card', label: 'Credit / Debit Card' },
                    { id: 'wallet', label: 'Digital Wallet' },
                    { id: 'transfer', label: 'Bank Transfer' },
                    { id: 'cod', label: 'Cash on Delivery' }
                  ].map(method => (
                    <label key={method.id} className={clsx(
                      "flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden",
                      formData.paymentMethod === method.id ? "border-[#006666] bg-[#e6f2f2]/30" : "border-gray-50 hover:bg-gray-50"
                    )}>
                      {formData.paymentMethod === method.id && <div className="absolute top-0 right-0 w-8 h-8 bg-[#006666] rounded-bl-full flex items-center justify-center pl-2 pb-2"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>}
                      <span className="font-black text-xs uppercase tracking-widest text-gray-700">{method.label}</span>
                      <input type="radio" name="paymentMethod" value={method.id} className="hidden" onChange={handleInputChange} checked={formData.paymentMethod === method.id} />
                    </label>
                  ))}
                </div>

                <div className="mt-auto pt-8 flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-[#2b2b2b] transition-colors flex items-center justify-center gap-2"><ArrowLeft size={16}/> Back</button>
                  <button onClick={handleNextStep} className="flex-[2] py-4 bg-[#006666] text-white rounded-xl font-black text-sm shadow-xl shadow-[#006666]/20 transition-all active:scale-[0.98]">Review Order</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300 flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-[#e6f2f2] rounded-lg text-[#006666]">
                      <ShoppingBag size={20} />
                   </div>
                   <h3 className="text-xl font-black text-[#2b2b2b]">Order Review</h3>
                </div>

                <div className="space-y-6">
                   <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery To</span>
                         <div className="text-sm font-bold text-gray-800">{formData.name}</div>
                         <p className="text-xs text-gray-500 font-medium">{formData.address}, {formData.city}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment via</span>
                         <div className="text-sm font-bold text-gray-800 uppercase tracking-widest">{formData.paymentMethod}</div>
                         <div className="text-xs text-[#006666] font-bold">Encrypted Connection</div>
                      </div>
                   </div>

                   <div className="bg-white border-2 border-dashed border-gray-100 p-6 rounded-2xl">
                      <h4 className="text-xs font-black text-[#2b2b2b] uppercase tracking-widest mb-4">Cart Verification</h4>
                      <div className="space-y-4">
                         {cartItems.map(item => (
                           <div key={item.id} className="flex justify-between items-center">
                              <div className="text-xs font-bold text-gray-600">{item.product.name} <span className="text-gray-300 ml-1">x{item.quantity}</span></div>
                              <div className="text-xs font-black text-[#2b2b2b]">${(item.product.price * item.quantity).toFixed(2)}</div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="mt-auto pt-8 flex gap-4">
                  <button onClick={() => setStep(3)} className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-[#2b2b2b] transition-colors flex items-center justify-center gap-2"><ArrowLeft size={16}/> Edit</button>
                  <button 
                    onClick={handleSubmitOrder}
                    disabled={isProcessing}
                    className="flex-[2] py-4 bg-[#2b2b2b] text-white rounded-xl font-black text-sm shadow-xl shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isProcessing ? 'Finalizing...' : 'Charge & Deploy'} <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="text-center py-10 space-y-8 animate-in zoom-in-95 duration-500 flex-1 flex flex-col justify-center">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-100 shadow-xl shadow-green-100/50">
                   <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white scale-110">
                      <CheckCircle2 size={32} />
                   </div>
                </div>
                <div>
                   <h3 className="text-4xl font-black text-[#2b2b2b] mb-2 tracking-tighter">Transmission Successful</h3>
                   <p className="text-gray-400 font-medium">Your order record has been persisted and synced with the fulfillment API.</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4 px-10">
                   <button onClick={() => navigate('/orders')} className="py-4 px-8 bg-[#006666] text-white rounded-xl font-black text-sm shadow-xl shadow-[#006666]/20 transition-all hover:bg-[#004d4d]">Access Order History</button>
                   <button onClick={() => navigate(`/tracking/${createdOrderId}`)} className="py-4 px-8 bg-[#2b2b2b] text-white rounded-xl font-black text-sm shadow-xl shadow-gray-200 transition-all hover:bg-black">Live Tracking</button>
                </div>
                <button onClick={() => navigate('/ecommerce')} className="text-sm font-bold text-gray-400 hover:text-[#006666] transition-colors underline decoration-gray-200">Continue Trading</button>
              </div>
            )}
          </div>
        </div>

        {/* Mini Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-[#2b2b2b] p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
             
             <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
                Strategic Summary
             </h4>
             
             <div className="space-y-4 mb-8">
                <div className="flex justify-between text-xs font-bold text-white/60">
                   <span>GROSS VALUE</span>
                   <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-white/60">
                   <span>LOGISTICS ({shippingMethod.toUpperCase()})</span>
                   <span>{shippingMethod === 'standard' ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-white/60">
                   <span>MODULAR TAX (10%)</span>
                   <span>${tax.toFixed(2)}</span>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                   <span className="text-sm font-black text-[#fe6a49]">NET TOTAL</span>
                   <span className="text-3xl font-black">${total.toFixed(2)}</span>
                </div>
             </div>

             <div className="space-y-2">
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                   * Charges will appear as "RIHO COMMERCE" on your statement. All items are subject to availability verification.
                </p>
             </div>
          </div>

          {step < 5 && (
             <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Cart Snapshot</h5>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                   {cartItems.map(item => (
                     <div key={item.id} className="flex gap-4">
                        <img src={item.product.image} className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100" />
                        <div className="flex-1 min-w-0">
                           <div className="text-[11px] font-bold text-gray-800 truncate">{item.product.name}</div>
                           <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{item.quantity} Unit(s)</div>
                        </div>
                     </div>
                   ))}
                </div>
                <button 
                  onClick={() => navigate('/cart')}
                  className="w-full mt-6 py-3 border-2 border-dashed border-gray-100 text-gray-400 hover:border-[#006666] hover:text-[#006666] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                   Modify Selection
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
