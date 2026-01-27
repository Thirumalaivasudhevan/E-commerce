import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ShoppingCart, Heart, Star, ArrowLeft, ShieldCheck, Truck, RefreshCcw, Tag, ChevronRight, Share2, Plus, Minus, MessageSquare, Send, Trash2, Edit } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('Architecture');
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [editingReview, setEditingReview] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  const fetchProductData = useCallback(async () => {
    try {
      const [prodRes, wishRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get('/wishlist')
      ]);
      setProduct(prodRes.data);
      setIsWishlisted(wishRes.data.some(w => w.productId === id));
      fetchReviews();
    } catch (err) {
      console.error(err);
      navigate('/ecommerce');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, fetchReviews]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleAddToCart = async () => {
    try {
      await api.post('/cart', { productId: id, quantity });
      setSuccess("Added to your shopping cart!");
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWishlist = async () => {
    try {
      if (isWishlisted) {
        const res = await api.get('/wishlist');
        const wishItem = res.data.find(w => w.productId === id);
        if (wishItem) await api.delete(`/wishlist/${wishItem.id}`);
      } else {
        await api.post('/wishlist', { productId: id });
      }
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      console.error(err);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await api.put(`/reviews/${editingReview.id}`, newReview);
        setSuccess("Review updated!");
      } else {
        await api.post('/reviews', { ...newReview, productId: id });
        setSuccess("Review posted!");
      }
      setNewReview({ rating: 5, comment: '' });
      setEditingReview(null);
      fetchReviews();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setSuccess("Review removed");
      fetchReviews();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const startEditReview = (review) => {
    setEditingReview(review);
    setNewReview({ rating: review.rating, comment: review.comment });
    window.scrollTo({ top: document.querySelector('#review-form').offsetTop - 100, behavior: 'smooth' });
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-400 animate-pulse">Synchronizing metadata...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-12 font-['Montserrat'] animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <button onClick={() => navigate('/ecommerce')} className="hover:text-[#006666] transition-colors">Marketplace</button>
          <ChevronRight size={12} />
          <span className="text-gray-300">{product.category}</span>
          <ChevronRight size={12} />
          <span className="text-[#2b2b2b]">{product.name}</span>
        </div>
        <button 
          onClick={() => navigate('/ecommerce')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#2b2b2b] transition-all"
        >
          <ArrowLeft size={16} /> Return to catalog
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Media Gallery (Left) */}
        <div className="space-y-6">
           <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-2xl relative group">
              <img 
                src={product.image} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                alt={product.name}
              />
              <div className="absolute top-8 right-8 flex flex-col gap-4">
                 <button 
                   onClick={handleWishlist}
                   className={clsx(
                     "w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 backdrop-blur-md",
                     isWishlisted ? "bg-[#fe6a49] text-white" : "bg-white/80 text-gray-400 hover:text-[#fe6a49]"
                   )}
                 >
                   <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                 </button>
                 <button className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow-2xl text-gray-400 hover:text-[#006666] transition-all backdrop-blur-md">
                   <Share2 size={20} />
                 </button>
              </div>
           </div>
        </div>

        {/* Product Details (Right) */}
        <div className="flex flex-col h-full space-y-8">
           <div className="space-y-4">
              <span className="inline-flex px-3 py-1 bg-[#e6f2f2] text-[#006666] text-[10px] font-black uppercase tracking-[0.2em] rounded-md">
                Certified Modular Solution
              </span>
              <h1 className="text-5xl font-black text-[#2b2b2b] leading-[1.1] tracking-tighter">
                {product.name}
              </h1>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-1 text-amber-400">
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill={i <= Math.floor(product.rating || 4.5) ? "currentColor" : "none"} />)}
                    <span className="text-sm font-black text-[#2b2b2b] ml-1">{product.rating?.toFixed(1) || 4.5}</span>
                 </div>
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">({reviews.length} Verified Reviews)</span>
              </div>
           </div>

           <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black text-[#006666] tracking-tight">${product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="text-xl font-bold text-gray-300 line-through">${product.oldPrice.toFixed(2)}</span>
              )}
              {product.discount && (
                <span className="bg-[#fe6a49] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ml-2">
                  Save {product.discount}
                </span>
              )}
           </div>

           <p className="text-base text-gray-500 font-medium leading-relaxed max-w-xl">
             {product.description}
           </p>

           <div className="pt-8 space-y-8">
              {/* Controls */}
              <div className="flex items-center gap-6">
                 <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1">
                    <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-[#006666] transition-colors"><Minus size={18}/></button>
                    <span className="w-12 text-center font-black text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-[#006666] transition-colors"><Plus size={18}/></button>
                 </div>
                 <button 
                  onClick={handleAddToCart}
                  className="flex-1 py-5 bg-[#006666] text-white rounded-2xl font-black text-sm shadow-2xl shadow-[#006666]/30 transition-all hover:bg-[#004d4d] active:scale-[0.98] flex items-center justify-center gap-3"
                 >
                   <ShoppingCart size={20} /> Deploy to Cart
                 </button>
              </div>

              {success && (
                <div className="p-4 bg-green-50 text-green-600 rounded-xl border border-green-100 font-bold text-sm flex items-center gap-2 animate-in fade-in zoom-in-95">
                   <CheckCircle2 size={18} /> {success}
                </div>
              )}

              {/* Functional Attributes */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                 {[
                   { icon: ShieldCheck, label: '3-Year Warranty', sub: 'Modular protection' },
                   { icon: Truck, label: 'Next-Day Delivery', sub: 'Verified across EU/US' },
                   { icon: RefreshCcw, label: '30-Day Recovery', sub: 'Hassle-free guarantee' },
                   { icon: Tag, label: 'Strategic Pricing', sub: 'Best value assurance' }
                 ].map((attr, i) => (
                   <div key={i} className="flex gap-4 p-4 rounded-2xl border border-gray-50 bg-gray-50/30">
                      <div className="p-2 bg-white rounded-xl text-[#006666] shadow-sm"><attr.icon size={20}/></div>
                      <div>
                         <div className="text-sm font-bold text-[#2b2b2b]">{attr.label}</div>
                         <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{attr.sub}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Extended Information */}
      <div className="border-t border-gray-100 pt-16">
         <div className="flex gap-12 border-b border-gray-100 mb-10 overflow-x-auto no-scrollbar">
            {['Architecture', 'Reviews'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={clsx(
                "pb-6 text-sm font-black uppercase tracking-[0.2em] transition-all relative",
                activeTab === tab ? "text-[#006666]" : "text-gray-300 hover:text-gray-500"
              )}>
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#006666] rounded-full" />}
              </button>
            ))}
         </div>
         
         {activeTab === 'Architecture' && (
           <div className="max-w-4xl text-gray-500 font-medium leading-loose space-y-6 animate-in fade-in duration-500">
              <p>
                The modular architecture of the {product.name} ensures that it integrates seamlessly into your existing Riho ecosystem. 
                Designed with a focus on atomic structure, this solution provides enterprise-grade performance while maintaining the flexibility of a lightweight tool.
              </p>
              <ul className="grid grid-cols-2 gap-x-12 gap-y-4 list-disc pl-5 text-[#2b2b2b] font-bold">
                 <li>Encrypted Data Protocols</li>
                 <li>Microservice Compatible</li>
                 <li>Elastic Scaling Potential</li>
                 <li>Strategic Load Balancing</li>
                 <li>Atomic UI Components</li>
                 <li>REST-ful API Hooks</li>
              </ul>
           </div>
         )}

         {activeTab === 'Reviews' && (
           <div className="space-y-12 animate-in fade-in duration-500">
              {/* Review Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col items-center justify-center gap-2">
                    <div className="text-5xl font-black text-[#2b2b2b]">{product.rating?.toFixed(1) || 4.5}</div>
                    <div className="flex text-amber-400">
                       {[1,2,3,4,5].map(i => <Star key={i} size={16} fill={i <= Math.floor(product.rating || 4.5) ? "currentColor" : "none"} />)}
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{reviews.length} Verified Reviews</div>
                 </div>
                 
                 <div className="md:col-span-2 space-y-4 flex flex-col justify-center">
                    {[5,4,3,2,1].map(r => (
                      <div key={r} className="flex items-center gap-4">
                         <span className="text-[10px] font-black text-gray-400 w-4">{r}</span>
                         <Star size={12} className="text-amber-400" fill="currentColor" />
                         <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-400 rounded-full" 
                              style={{ width: `${reviews.length > 0 ? (reviews.filter(rev => rev.rating === r).length / reviews.length * 100) : 0}%` }} 
                            />
                         </div>
                         <span className="text-[10px] font-black text-gray-400 w-8 text-right">
                           {reviews.length > 0 ? Math.round(reviews.filter(rev => rev.rating === r).length / reviews.length * 100) : 0}%
                         </span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Review Form */}
              <div id="review-form" className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#e6f2f2] rounded-xl text-[#006666]">
                       <MessageSquare size={20} />
                    </div>
                    <h4 className="text-xl font-black text-[#2b2b2b]">{editingReview ? 'Modify Opinion' : 'Submit Feedback'}</h4>
                 </div>
                 
                 <form onSubmit={submitReview} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Calibration (Rating)</label>
                       <div className="flex gap-2">
                          {[1,2,3,4,5].map(star => (
                            <button 
                              key={star} 
                              type="button" 
                              onClick={() => setNewReview({...newReview, rating: star})}
                              className={clsx(
                                "p-3 rounded-xl transition-all",
                                newReview.rating >= star ? "text-amber-400 bg-amber-50" : "text-gray-200 bg-gray-50"
                              )}
                            >
                               <Star size={24} fill={newReview.rating >= star ? "currentColor" : "none"} />
                            </button>
                          ))}
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Extended Feedback (Comment)</label>
                       <textarea 
                         required
                         value={newReview.comment}
                         onChange={e => setNewReview({...newReview, comment: e.target.value})}
                         placeholder="Describe your operational experience..."
                         className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 text-sm font-semibold outline-none focus:border-[#006666] focus:bg-white transition-all h-32 resize-none"
                       />
                    </div>
                    
                    <div className="flex justify-end gap-4">
                       {editingReview && (
                         <button 
                          type="button"
                          onClick={() => { setEditingReview(null); setNewReview({rating: 5, comment: ''}); }}
                          className="px-8 py-3 text-sm font-bold text-gray-400 hover:text-[#2b2b2b] transition-all"
                         >
                           Cancel Edit
                         </button>
                       )}
                       <button 
                        type="submit" 
                        className="px-12 py-4 bg-[#006666] text-white rounded-xl font-black text-sm shadow-xl shadow-[#006666]/20 hover:bg-[#004d4d] transition-all active:scale-[0.98] flex items-center gap-2"
                       >
                         {editingReview ? 'Update Signal' : 'Transmit Review'} <Send size={16} />
                       </button>
                    </div>
                 </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-8">
                 {reviews.length === 0 ? (
                   <div className="py-20 text-center text-gray-400 font-bold italic">No review signals captured yet. Be the first to synchronize.</div>
                 ) : (
                   reviews.map(review => (
                     <div key={review.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border border-gray-50">
                                 {review.user?.avatar ? <img src={review.user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-[#006666] bg-[#e6f2f2]">{review.user?.name?.charAt(0)}</div>}
                              </div>
                              <div>
                                 <div className="text-sm font-black text-[#2b2b2b]">{review.user?.name}</div>
                                 <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</div>
                              </div>
                           </div>
                           <div className="flex text-amber-400">
                              {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= review.rating ? "currentColor" : "none"} />)}
                           </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 font-medium leading-relaxed pl-16">
                           "{review.comment}"
                        </p>
                        
                        {user?.id === review.userId && !editingReview && (
                          <div className="flex justify-end gap-2 pl-16">
                             <button onClick={() => startEditReview(review)} className="p-2 text-gray-400 hover:text-[#006666] hover:bg-[#e6f2f2] rounded-lg transition-all"><Edit size={14}/></button>
                             <button onClick={() => deleteReview(review.id)} className="p-2 text-gray-400 hover:text-[#fe6a49] hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14}/></button>
                          </div>
                        )}
                     </div>
                   ))
                 )}
              </div>
           </div>
         )}
      </div>
    </div>
  );
}

function CheckCircle2(props) {
  return <ShieldCheck {...props} />;
}
