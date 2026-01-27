import { Plus, Tag, DollarSign, Image as ImageIcon, ShoppingCart, AlertCircle, Upload, X, Star, Heart, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../api/axios';
import Modal from '../../../components/ui/Modal';
import clsx from 'clsx';

import { useToast } from '../../../components/ui/Toast';

export default function Ecommerce() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

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

  const [categories, setCategories] = useState(['Software', 'Hardware', 'Design', 'Electronics']);

  const processFile = (file) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('File is too large. Max 2MB.', 'error');
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

      if (prodRes.data.length > 0) {
        setCategories(prev => {
          const newCats = prodRes.data.map(p => p.category);
          return Array.from(new Set([...prev, ...newCats]));
        });
      }
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
        // Find wish item id
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-surface-highlight p-6 rounded-2xl border border-border shadow-none">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Marketplace</h2>
          <p className="text-sm text-text-muted">Manage your products, deals, and inventory.</p>
        </div>
        <button
          onClick={() => { setIsEditing(false); setNewProduct({ name: '', price: '', discount: '', category: '', description: '', image: '' }); setIsModalOpen(true); }}
          className="nexus-btn nexus-btn-primary flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {success && (
        <div className="bg-success/10 text-success p-4 rounded-2xl border border-success/20 font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          {success}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="nexus-card h-80 animate-pulse bg-surface-highlight" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div
              key={product.id}
              onClick={() => { setSelectedProduct(product); setIsViewModalOpen(true); }}
              className="group bg-surface-highlight rounded-2xl shadow-none border border-border overflow-hidden hover:border-gray-600 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="w-full bg-surface relative overflow-hidden">
                <img
                  src={product.image || `https://picsum.photos/seed/${product.id}/400/500`}
                  alt={product.name}
                  className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleAddToWishlist(e, product)}
                    className="p-2 bg-surface-highlight rounded-full shadow-lg text-text-muted hover:text-red-500 transition-colors"
                  >
                    <Heart size={16} fill={product.isWishlisted ? "currentColor" : "none"} />
                  </button>
                </div>

                {product.discount && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    {product.discount}
                  </div>
                )}

                <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1">
                  <div className="bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-bold shadow-lg border border-white/10">
                    <span className="text-white">${product.price}</span>
                    {product.oldPrice && (
                      <span className="ml-2 text-[10px] text-gray-400 line-through">${product.oldPrice}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
                    {product.category}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                    <Star size={10} fill="currentColor" /> {product.rating || 4.5}
                  </div>
                </div>

                <h3 className="font-bold text-text-main mb-1 truncate group-hover:text-primary transition-colors text-base">
                  {product.name}
                </h3>
                <p className="text-xs text-text-muted line-clamp-1 mb-3 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex justify-between items-center text-[10px] font-medium border-t border-border pt-3">
                  <div className="text-text-muted">Inventory: <span className={clsx("font-bold", product.stock <= 5 ? "text-red-500" : "text-text-main")}>{product.stock} items</span></div>
                  <div className={clsx("w-1.5 h-1.5 rounded-full", product.stock > 0 ? "bg-green-500" : "bg-red-500")}></div>
                </div>

                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="w-full mt-4 py-2.5 bg-surface text-text-main border border-border rounded-xl text-xs font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={14} /> Add to Cart
                </button>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="col-span-full py-32 text-center bg-surface-highlight rounded-3xl border-2 border-dashed border-border">
              <div className="inline-flex p-6 bg-surface rounded-full shadow-none mb-4">
                <Tag size={40} className="text-text-muted" />
              </div>
              <h3 className="text-xl font-bold text-text-main">No products found</h3>
              <p className="text-text-muted mt-2">Start adding products to populate your marketplace.</p>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setIsEditing(false); setSelectedProduct(null); setError(''); }}
        title={isEditing ? "Edit Product" : "New Product Listing"}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-xl flex items-center gap-2 text-xs font-medium border border-red-500/20">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-text-muted mb-1 flex items-center">
                Product Name <span className="text-red-500 ml-1">*</span>
              </label>
              <input required className="nexus-input" placeholder="e.g. Premium Dashboard" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-text-muted mb-1 flex items-center">
                Product Image <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  className={clsx(
                    "relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center group",
                    isDragging
                      ? "border-primary bg-primary/10 scale-[1.02] shadow-glow"
                      : "border-white/10 hover:border-primary/50 hover:bg-white/5 hover:shadow-lg hover:shadow-primary/5"
                  )}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  {newProduct.image ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm group/thumb">
                      <img src={newProduct.image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-[10px] font-bold uppercase">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-text-muted mb-3">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-bold text-text-main mb-1">Drop your image here</p>
                      <p className="text-xs text-text-muted font-medium tracking-tight">or click to browse files (Max 2MB)</p>
                    </>
                  )}

                  {newProduct.image && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setNewProduct({ ...newProduct, image: '' }); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-muted mb-1 flex items-center">
                Price ($) <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input required type="number" step="0.01" className="nexus-input pl-10" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-muted mb-1 flex items-center">
                MSRP / Old Price ($)
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="number" step="0.01" className="nexus-input pl-10" value={newProduct.oldPrice} onChange={e => setNewProduct({ ...newProduct, oldPrice: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-muted mb-1">Discount Text</label>
              <input className="nexus-input px-4" style={{ paddingLeft: '1rem' }} placeholder="e.g. 20% OFF" value={newProduct.discount} onChange={e => setNewProduct({ ...newProduct, discount: e.target.value })} />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-text-muted mb-1 flex items-center">
                  Category <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input list="category-list" required className="nexus-input pl-10" placeholder="Select or type..." value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
                  <datalist id="category-list">
                    {categories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
              </div>
              <div className="w-32">
                <label className="text-sm font-medium text-text-muted mb-1">Stock</label>
                <input type="number" required className="nexus-input px-4" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-text-muted mb-1 flex items-center">
                Description <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea required className="nexus-input h-24 py-3 pl-4" style={{ paddingLeft: '1rem' }} placeholder="Describe your product..." value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => { setIsModalOpen(false); setIsEditing(false); setSelectedProduct(null); setError(''); }} className="px-6 py-2.5 text-sm font-bold text-text-muted hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="nexus-btn nexus-btn-primary px-8 shadow-lg shadow-primary/20">
              {isEditing ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedProduct(null); }} title="Product Details">
        {selectedProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-surface border border-border">
              <img
                src={selectedProduct.image || `https://picsum.photos/seed/${selectedProduct.id}/800/1000`}
                className="w-full h-full object-cover"
                alt={selectedProduct.name}
              />
            </div>

            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="inline-flex px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                  {selectedProduct.category}
                </div>

                <h2 className="text-3xl font-extrabold text-text-main mb-2 leading-tight">
                  {selectedProduct.name}
                </h2>

                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl font-bold text-primary">
                    ${selectedProduct.price}
                  </div>
                  {selectedProduct.discount && (
                    <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                      Save {selectedProduct.discount}
                    </div>
                  )}
                </div>

                <div className="h-px bg-border w-full mb-6" />

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest">Product Description</h4>
                  <p className="text-sm text-text-main leading-relaxed font-medium">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>

              <div className="pt-8 space-y-3">
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => startEdit(selectedProduct)}
                    className="p-3 bg-surface text-text-main rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    title="Edit Details"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedProduct.id)}
                    className="p-3 bg-red-500/10 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                    title="Delete Product"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <button
                  onClick={(e) => handleAddToCart(e, selectedProduct)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.98]"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <div className="text-center text-[10px] text-text-muted font-medium font-sans">
                  Secure checkout handled by Nexus Enterprise OS
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div >
  );
}
