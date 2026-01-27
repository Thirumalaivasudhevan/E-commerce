import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading your cart...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
             <ShoppingCart size={32} className="text-primary" /> My Shopping Cart
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Review your items before proceeding to checkout</p>
        </div>
        <Link to="/ecommerce" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
          <ShoppingBag size={16} /> Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.length === 0 ? (
            <div className="bg-white p-16 rounded-3xl border-2 border-dashed border-gray-100 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Your cart is empty</h3>
              <p className="text-gray-500 mt-2 mb-6">Looks like you haven't added anything yet.</p>
              <button 
                onClick={() => navigate('/ecommerce')}
                className="btn btn-primary px-8"
              >
                Go to Marketplace
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                  <img src={item.product.image || "https://picsum.photos/200/200"} className="w-full h-full object-cover" alt={item.product.name} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{item.product.category}</div>
                  <h4 className="font-bold text-gray-900 truncate text-lg">{item.product.name}</h4>
                  <div className="text-sm font-bold text-gray-900 mt-1">${item.product.price}</div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-xl transition-colors text-gray-500"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-xl transition-colors text-gray-500"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <div className="text-sm font-extrabold text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</div>
                </div>

                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900 font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-500">Tax (10%)</span>
                <span className="text-gray-900 font-bold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600 font-bold uppercase tracking-tighter">Free</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              disabled={cartItems.length === 0}
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Checkout Now <ArrowRight size={18} />
            </button>
            
            <p className="text-[10px] text-gray-400 text-center font-medium mt-4">
              * Taxes calculated based on enterprise standard rates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
