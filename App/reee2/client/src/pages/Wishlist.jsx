import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Heart, Trash2, ShoppingCart, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Wishlist() {
  const [wishItems, setWishItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setWishItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setWishItems(wishItems.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const moveToCart = async (id, productId) => {
    try {
      await api.post('/cart', { productId, quantity: 1 });
      await api.delete(`/wishlist/${id}`);
      setWishItems(wishItems.filter(item => item.id !== id));
      alert("Moved to cart!");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading your wishlist...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
             <Heart size={32} className="text-red-500" fill="currentColor" /> My Wishlist
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Saved items you're interested in for later</p>
        </div>
        <Link to="/ecommerce" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
          <ShoppingBag size={16} /> Continue Shopping
        </Link>
      </div>

      {wishItems.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-gray-100 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Your wishlist is empty</h3>
          <p className="text-gray-500 mt-2 mb-6">Start hearting products to see them here!</p>
          <button 
            onClick={() => navigate('/ecommerce')}
            className="btn btn-primary px-8"
          >
            Explore Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={item.product.image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={item.product.name}
                />
                <button 
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm shadow-md rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md inline-block mb-3">
                  {item.product.category}
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-4 truncate">{item.product.name}</h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-gray-900">${item.product.price}</span>
                  <button 
                    onClick={() => moveToCart(item.id, item.product.id)}
                    className="flex items-center gap-2 py-2 px-4 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all active:scale-95"
                  >
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
