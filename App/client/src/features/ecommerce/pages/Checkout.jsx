import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';
import { CreditCard, Truck, User, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import clsx from 'clsx';

import { useToast } from '../../../components/ui/Toast';

export default function Checkout() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
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
    // Clear error when typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
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
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleSubmitOrder = async () => {
    setIsProcessing(true);
    try {
      if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.zip || !formData.cardNumber || !formData.expiry || !formData.cvv) {
        addToast('Please fill in all required fields', 'error');
        return;
      }

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
      setStep(4); // Success step
      addToast('Order processed successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to process order. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Initializing checkout...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header / Steps Indicator */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between relative">
        <button
          onClick={() => navigate('/cart')}
          className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-900 transition-colors"
          title="Cancel Checkout"
        >
          <X size={20} />
        </button>
        <div className="flex items-center justify-between w-full pr-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                step === s ? "bg-primary text-white scale-110 shadow-lg" :
                  step > s ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
              )}>
                {step > s ? <CheckCircle2 size={18} /> : s}
              </div>
              <span className={clsx(
                "text-xs font-bold uppercase tracking-widest hidden md:block",
                step === s ? "text-gray-900" : "text-gray-400"
              )}>
                {s === 1 ? 'Information' : s === 2 ? 'Shipping' : 'Payment'}
              </span>
              {s < 3 && <div className="hidden md:block w-12 h-px bg-gray-200 mx-4" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <User size={20} className="text-primary" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1 block">Full Name</label>
                    <input name="name" className={clsx("nexus-input", errors.name && "border-red-500 bg-red-50")} value={formData.name} onChange={handleInputChange} placeholder="John Doe" />
                    {errors.name && <span className="text-red-500 text-xs font-bold mt-1">{errors.name}</span>}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1 block">Email</label>
                    <input name="email" className={clsx("nexus-input", errors.email && "border-red-500 bg-red-50")} value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                    {errors.email && <span className="text-red-500 text-xs font-bold mt-1">{errors.email}</span>}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1 block">Phone</label>
                    <input type="tel" name="phone" className={clsx("nexus-input", errors.phone && "border-red-500 bg-red-50")} value={formData.phone} onChange={(e) => {
                      // Only allow numeric input
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: val });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }} placeholder="1234567890" maxLength={10} />
                    {errors.phone && <span className="text-red-500 text-xs font-bold mt-1">{errors.phone}</span>}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => navigate('/cart')} className="flex-1 py-4 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl font-black transition-all flex items-center justify-center gap-2">
                    Cancel
                  </button>
                  <button onClick={handleNextStep} className="flex-[2] btn btn-primary py-4 font-black">Continue to Shipping</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Truck size={20} className="text-primary" /> Shipping Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1 block">Address</label>
                    <input name="address" className={clsx("nexus-input", errors.address && "border-red-500 bg-red-50")} value={formData.address} onChange={handleInputChange} placeholder="123 Street Name" />
                    {errors.address && <span className="text-red-500 text-xs font-bold mt-1">{errors.address}</span>}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1 block">City</label>
                    <input name="city" className={clsx("nexus-input", errors.city && "border-red-500 bg-red-50")} value={formData.city} onChange={handleInputChange} placeholder="City" />
                    {errors.city && <span className="text-red-500 text-xs font-bold mt-1">{errors.city}</span>}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1 block">State</label>
                    <input name="state" className={clsx("nexus-input", errors.state && "border-red-500 bg-red-50")} value={formData.state} onChange={handleInputChange} placeholder="State" />
                    {errors.state && <span className="text-red-500 text-xs font-bold mt-1">{errors.state}</span>}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1 block">Pin Code</label>
                    <input type="text" name="zip" className={clsx("nexus-input", errors.zip && "border-red-500 bg-red-50")} value={formData.zip} onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, zip: val });
                      if (errors.zip) setErrors({ ...errors, zip: '' });
                    }} placeholder="123456" maxLength={6} />
                    {errors.zip && <span className="text-red-500 text-xs font-bold mt-1">{errors.zip}</span>}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl font-black transition-all flex items-center justify-center gap-2">
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button onClick={handleNextStep} className="flex-[2] btn btn-primary py-4 font-black">Continue to Payment</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <CreditCard size={20} className="text-primary" /> Payment Method
                </h3>

                <div className="bg-blue-50 text-blue-700 p-4 rounded-xl flex items-start gap-3 text-sm font-medium border border-blue-100">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-800">Demo Mode</p>
                    <p>Payments are not implemented yet. Just click <span className="font-bold">"Complete Purchase"</span> to place your order.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {['card', 'wallet', 'transfer', 'cod'].map(method => (
                    <label key={method} className={clsx(
                      "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                      formData.paymentMethod === method ? "border-primary bg-red-50/50" : "border-gray-50 hover:bg-gray-50"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={clsx("w-4 h-4 rounded-full border-2", formData.paymentMethod === method ? "border-primary bg-primary" : "border-gray-300")} />
                        <span className="font-bold text-sm uppercase tracking-widest text-gray-700">{method}</span>
                      </div>
                      <CreditCard size={18} className="text-gray-400" />
                      <input type="radio" name="paymentMethod" value={method} className="hidden" onChange={handleInputChange} checked={formData.paymentMethod === method} />
                    </label>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl font-black transition-all flex items-center justify-center gap-2">
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={handleSubmitOrder}
                    className="flex-[2] btn btn-primary py-4 font-black flex items-center justify-center gap-2"
                  >
                    {isProcessing ? 'Processing...' : 'Complete Purchase'} <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-10 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={48} className="text-green-600" />
                </div>
                <h3 className="text-3xl font-black text-gray-900">Order Successful!</h3>
                <p className="text-gray-500 font-medium">Thank you for your purchase. Your invoice has been generated.</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => navigate('/orders')} className="btn btn-primary px-8">View Orders</button>
                  {createdOrderId && (
                    <button onClick={() => navigate(`/tracking/${createdOrderId}`)} className="btn btn-primary px-8 bg-gray-900 text-white hover:bg-black">
                      Track Order
                    </button>
                  )}
                  <button onClick={() => navigate('/ecommerce')} className="py-2.5 px-8 bg-gray-50 text-gray-600 rounded-xl font-bold">Marketplace</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mini Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="font-black text-gray-900 mb-4 text-sm flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary" /> Order Details
            </h4>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 no-scrollbar">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.product.image} className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate">{item.product.name}</div>
                    <div className="text-[10px] text-gray-400 font-bold">{item.quantity} x ${item.product.price}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-400">SUBTOTAL</span>
                <span className="text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-400">TAX (10%)</span>
                <span className="text-gray-900">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black pt-2 text-primary">
                <span>TOTAL</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => navigate('/cart')}
              className="w-full mt-4 py-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl font-bold text-xs transition-colors"
            >
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
