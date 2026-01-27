import { Plus, Tag, DollarSign, Image as ImageIcon, ShoppingCart, AlertCircle, Upload, X, Star, Heart, Edit, Trash2, Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import clsx from 'clsx';

export default function Ecommerce() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(2000);
  
  const [newProduct, setNewProduct] = useState({
    name: '', 
    price: '', 
    oldPrice: '',
    discount: '', 
    category: '', 
    description: '', 
    image: '',
    stock: 10
  });

  const categories = ['All', 'Software', 'Hardware', 'Electronics', 'Accessory'];

  const processFile = (file) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Max 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const fetchProducts = useCallback(async () => {
    try {
      const [prodRes, wishRes] = await Promise.all([
        api.get('/products'),
        api.get('/wishlist')
      ]);
      
      const wishes = wishRes.data.map(w => w.productId);
      
      setProducts(prodRes.data.map(p => ({
        ...p,
        isWishlisted: wishes.includes(p.id)
      })));
    } catch {
      console.error("Failed to load marketplace content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newProduct.name.trim()) return setError("Product Name is required");
    const currentPrice = parseFloat(newProduct.price);
    if (isNaN(currentPrice) || currentPrice <= 0) return setError("Price must be greater than 0");

    try {
      const data = {
        ...newProduct,
        price: currentPrice
      };

      if (isEditing && selectedProduct) {
        await api.put(`/products/${selectedProduct.id}`, data);
        setSuccess("Product updated successfully!");
      } else {
        await api.post('/products', data);
        setSuccess("Product created successfully!");
      }

      setIsModalOpen(false);
      setIsEditing(false);
      setSelectedProduct(null);
      fetchProducts();
      setNewProduct({ 
        name: '', price: '', discount: '', category: '', description: '', image: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError("Failed to process request");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setSuccess("Product deleted!");
      setIsViewModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError("Failed to delete product");
    }
  };

  const startEdit = (product) => {
    setIsEditing(true);
    setSelectedProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice || '',
      discount: product.discount || '',
      category: product.category,
      description: product.description,
      image: product.image || '',
      stock: product.stock || 10
    });
    setIsViewModalOpen(false);
    setIsModalOpen(true);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      await api.post('/cart', { productId: product.id, quantity: 1 });
      setSuccess(`${product.name} added to cart!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError("Failed to add to cart");
    }
  };

  const handleAddToWishlist = async (e, product) => {
    e.stopPropagation();
    try {
      if (product.isWishlisted) {
        const res = await api.get('/wishlist');
        const wishItem = res.data.find(w => w.productId === product.id);
        if (wishItem) await api.delete(`/wishlist/${wishItem.id}`);
        setSuccess("Removed from wishlist");
      } else {
        await api.post('/wishlist', { productId: product.id });
        setSuccess(`${product.name} saved to wishlist!`);
      }
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError("Failed to update wishlist");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesPrice = p.price <= priceRange;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="space-y-8 font-['Montserrat']">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#2b2b2b]">Riho Marketplace</h2>
          <p className="text-sm text-gray-500 font-medium">Discover premium software and modular toolkits.</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setNewProduct({name:'', price:'', discount:'', category:'', description:'', image:''}); setIsModalOpen(true); }}
          className="bg-[#006666] text-white px-6 py-3 rounded-[8px] font-semibold flex items-center gap-2 hover:bg-[#004d4d] transition-all shadow-lg shadow-[#006666]/20 active:scale-95"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
           {success}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Filter Panel */}
        <aside className="w-full lg:w-72 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full bg-[#f8f9fa] border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#006666] transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Tag size={14} /> Categories
              </h4>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)}
                    className={clsx(
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-between group",
                      selectedCategory === cat ? "bg-[#e6f2f2] text-[#006666]" : "text-gray-500 hover:bg-gray-50 hover:text-[#006666]"
                    )}
                  >
                    {cat}
                    <ChevronRight size={14} className={clsx("transition-transform", selectedCategory === cat ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")} />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
               <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <DollarSign size={14} /> Price Range
               </h4>
               <input 
                type="range" 
                min="0" 
                max="2000" 
                step="50"
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#006666]" 
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
               />
               <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
                  <span>$0</span>
                  <span className="text-[#006666] text-sm">${priceRange}</span>
               </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
               <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Star size={14} /> Min Rating
               </h4>
               <div className="flex gap-1 justify-between">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 hover:text-amber-400 transition-colors">
                       <Star size={14} fill="currentColor" />
                    </button>
                  ))}
               </div>
            </div>
          </div>
          
          <div className="bg-[#fe6a49]/10 p-6 rounded-xl border border-[#fe6a49]/20 flex items-center gap-4 group cursor-pointer overflow-hidden relative">
             <div className="z-10">
                <h5 className="font-bold text-[#fe6a49] text-sm">Special Offer!</h5>
                <p className="text-[10px] font-semibold text-[#fe6a49]/70 group-hover:translate-x-1 transition-transform">Get 50% discount on Enterprise packs <ChevronRight size={10} className="inline"/></p>
             </div>
             <Tag className="absolute -right-4 -bottom-4 text-[#fe6a49]/20 w-20 h-20 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    onClick={() => navigate(`/ecommerce/${product.id}`)}
                    className="group bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer flex flex-col"
                  >
                    <div className="aspect-[4/5] bg-[#f8f9fa] relative overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 font-bold text-xs p-4 text-gray-300 text-center" 
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-[#006666]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#006666] shadow-lg scale-75 group-hover:scale-100 transition-transform duration-500">
                            <ShoppingCart size={18} />
                         </div>
                         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#006666] shadow-lg scale-75 group-hover:scale-100 transition-transform duration-500 delay-75">
                            <Search size={18} />
                         </div>
                      </div>

                      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                        <button 
                          onClick={(e) => handleAddToWishlist(e, product)}
                          className={clsx(
                            "p-2.5 rounded-full shadow-lg transition-all duration-300 backdrop-blur-md",
                            product.isWishlisted ? "bg-[#fe6a49] text-white" : "bg-white/80 text-gray-400 hover:text-[#fe6a49]"
                          )}
                        >
                          <Heart size={16} fill={product.isWishlisted ? "currentColor" : "none"} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); startEdit(product); }}
                          className="p-2.5 rounded-full bg-white/80 text-gray-400 hover:text-[#006666] shadow-lg transition-all duration-300 backdrop-blur-md opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                          className="p-2.5 rounded-full bg-white/80 text-gray-400 hover:text-red-500 shadow-lg transition-all duration-300 backdrop-blur-md opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 delay-75"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        {product.discount && (
                          <div className="bg-[#fe6a49] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-xl shadow-[#fe6a49]/30">
                            {product.discount}
                          </div>
                        )}
                        {product.stock <= 3 && product.stock > 0 && (
                          <div className="bg-[#006666] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-xl shadow-[#006666]/30">
                            Hot
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute bottom-4 left-4 z-10">
                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg text-lg font-black shadow-2xl border border-white/20">
                          <span className="text-[#006666]">${product.price}</span>
                          {product.oldPrice && (
                            <span className="ml-2 text-xs text-gray-400 line-through font-bold">${product.oldPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-[10px] text-[#006666] font-black uppercase tracking-[0.15em] bg-[#e6f2f2] px-2 py-1 rounded-[4px]">
                          {product.category}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          <Star size={12} fill="currentColor" /> {product.rating || 4.5}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-[#2b2b2b] mb-2 truncate text-xl group-hover:text-[#006666] transition-colors leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed font-medium h-10 overflow-hidden">
                        {product.description}
                      </p>

                      <div className="mt-auto pt-5 border-t border-gray-100">
                         <button 
                          onClick={(e) => handleAddToCart(e, product)}
                          className="w-full py-3 bg-[#f8f9fa] text-[#2b2b2b] rounded-lg text-sm font-bold hover:bg-[#006666] hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                        >
                           <ShoppingCart size={16} className="group-hover/btn:scale-110 transition-transform" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-40 text-center bg-white rounded-xl border-2 border-dashed border-gray-100">
                   <div className="inline-flex p-8 bg-[#f8f9fa] rounded-full shadow-inner mb-6">
                     <Tags size={48} className="text-gray-200" />
                   </div>
                   <h3 className="text-2xl font-bold text-[#2b2b2b]">No matches found</h3>
                   <p className="text-gray-500 mt-2 font-medium">Try adjusting your filters or search keywords.</p>
                   <button onClick={() => {setSearchQuery(''); setSelectedCategory('All'); setPriceRange(2000);}} className="mt-6 text-[#006666] font-bold hover:underline">Clear all filters</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product Submission Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setIsEditing(false); setSelectedProduct(null); setError(''); }} 
        title={isEditing ? "Edit Product" : "Launch New Product"}
      >
        <form onSubmit={handleCreate} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-[#2b2b2b] mb-1.5 block">Product Name <span className="text-[#fe6a49]">*</span></label>
              <input 
                required 
                className="w-full bg-[#f8f9fa] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#006666] transition-all" 
                placeholder="Name your product..." 
                value={newProduct.name} 
                onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-[#2b2b2b] mb-1.5 block">Visual Representation <span className="text-[#fe6a49]">*</span></label>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={clsx(
                  "relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center",
                  isDragging 
                    ? "border-[#006666] bg-[#e6f2f2] scale-[1.01]" 
                    : "border-gray-200 hover:border-[#006666]/50 hover:bg-[#f8f9fa]"
                )}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                {newProduct.image ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl">
                    <img src={newProduct.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">Replace</div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-[#e6f2f2] rounded-2xl flex items-center justify-center text-[#006666] mb-4">
                      <Upload size={28} />
                    </div>
                    <p className="text-sm font-bold text-[#2b2b2b] mb-1">Drag and drop assets</p>
                    <p className="text-xs text-gray-400 font-semibold tracking-tight">Support PNG, JPG, WEBP (Max 2MB)</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-[#2b2b2b] mb-1.5 block">Primary Price ($) <span className="text-[#fe6a49]">*</span></label>
              <input 
                required type="number" step="0.01" 
                className="w-full bg-[#f8f9fa] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#006666] transition-all font-bold text-[#006666]" 
                value={newProduct.price} 
                onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[#2b2b2b] mb-1.5 block">Market Price ($)</label>
              <input 
                type="number" step="0.01" 
                className="w-full bg-[#f8f9fa] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#006666] transition-all text-gray-400" 
                value={newProduct.oldPrice} 
                onChange={e => setNewProduct({...newProduct, oldPrice: e.target.value})} 
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-[#2b2b2b] mb-1.5 block">Select Category <span className="text-[#fe6a49]">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                 {categories.filter(c => c !== 'All').map(cat => (
                   <button 
                    key={cat} 
                    type="button"
                    onClick={() => setNewProduct({...newProduct, category: cat})}
                    className={clsx(
                      "py-2 px-3 rounded-lg text-xs font-bold border transition-all",
                      newProduct.category === cat ? "bg-[#006666] text-white border-[#006666]" : "bg-[#f8f9fa] text-gray-500 border-transparent hover:border-gray-300"
                    )}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-[#2b2b2b] mb-1.5 block">Extended Description <span className="text-[#fe6a49]">*</span></label>
              <textarea 
                required 
                className="w-full bg-[#f8f9fa] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#006666] transition-all h-28 resize-none" 
                placeholder="Highlight key features..." 
                value={newProduct.description} 
                onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => { setIsModalOpen(false); setIsEditing(false); setSelectedProduct(null); setError(''); }} className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-[#2b2b2b] transition-colors">Cancel</button>
            <button type="submit" className="bg-[#006666] text-white px-10 py-3 rounded-lg font-bold text-sm shadow-xl shadow-[#006666]/20 hover:bg-[#004d4d] transition-all active:scale-95">
              {isEditing ? "Save Changes" : "Publish Now"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Product Detail Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedProduct(null); }} title="Commercial Overview">
        {selectedProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="group relative rounded-2xl overflow-hidden bg-[#f8f9fa] border border-gray-100 shadow-inner">
               <img 
                 src={selectedProduct.image || `https://picsum.photos/seed/${selectedProduct.id}/1000/1250`} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                 alt={selectedProduct.name}
               />
               <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl"></div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex-1">
                <div className="inline-flex px-3 py-1 bg-[#e6f2f2] text-[#006666] text-[10px] font-black uppercase tracking-[0.2em] rounded-md mb-6">
                  {selectedProduct.category}
                </div>
                
                <h2 className="text-4xl font-black text-[#2b2b2b] mb-4 leading-tight">
                  {selectedProduct.name}
                </h2>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="text-4xl font-black text-[#006666]">
                    ${selectedProduct.price}
                  </div>
                  {selectedProduct.discount && (
                    <div className="bg-[#fe6a49] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg shadow-[#fe6a49]/30">
                      Sale {selectedProduct.discount}
                    </div>
                  )}
                </div>
                
                <div className="h-px bg-gray-100 w-full mb-8" />
                
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product Details</h4>
                  <p className="text-base text-gray-600 leading-relaxed font-medium">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-12 space-y-4">
                <div className="flex gap-3">
                  <button 
                    onClick={() => startEdit(selectedProduct)}
                    className="flex-1 py-4 bg-[#f8f9fa] text-[#2b2b2b] rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-200"
                   >
                     <Edit size={18} /> Edit Specs
                   </button>
                   <button 
                    onClick={() => handleDelete(selectedProduct.id)}
                    className="p-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
                
                <button 
                  onClick={(e) => handleAddToCart(e, selectedProduct)}
                  className="w-full py-5 bg-[#006666] text-white rounded-xl font-black hover:bg-[#004d4d] transition-all flex items-center justify-center gap-2 shadow-2xl shadow-[#006666]/30 active:scale-[0.98]"
                >
                  <ShoppingCart size={20} /> Deploy to Cart
                </button>
                <div className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-4">
                  Certified Modular Solution by Riho
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
function Tags(props) {
  return <Tag {...props} />;
}
