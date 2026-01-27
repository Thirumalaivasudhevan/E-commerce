import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { List, Search, PlusCircle, LayoutGrid, MoreHorizontal, Edit, Trash2, ShieldAlert, CheckCircle2, Package, Tag, DollarSign, ArrowUpDown, Upload, X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import Modal from '../components/ui/Modal';

export default function ProductInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const [newProduct, setNewProduct] = useState({
    name: '', price: '', oldPrice: '', discount: '', category: 'Software', description: '', image: '', stock: 10
  });

  const categories = ['Software', 'Hardware', 'Electronics', 'Accessory'];

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this product from inventory?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      setSuccess("Product permanently removed.");
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    const priceVal = parseFloat(newProduct.price);
    if (isNaN(priceVal) || priceVal <= 0) return setError("Valid price is required.");

    try {
        const payload = { ...newProduct, price: priceVal, oldPrice: newProduct.oldPrice ? parseFloat(newProduct.oldPrice) : null };
        if (isEditing) {
            await api.put(`/products/${selectedProduct.id}`, payload);
            setSuccess("Product updated!");
        } else {
            await api.post('/products', payload);
            setSuccess("Product launched successfully!");
        }
        setIsModalOpen(false);
        fetchProducts();
        setTimeout(() => setSuccess(''), 3000);
    } catch {
        setError("Synchronization failed.");
    }
  };

  const startEdit = (product) => {
    setSelectedProduct(product);
    setIsEditing(true);
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
    setIsModalOpen(true);
  };

  const processFile = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct({ ...newProduct, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-['Montserrat'] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#2b2b2b] flex items-center gap-2">
            <List size={28} className="text-[#006666]" /> Inventory Control
          </h2>
          <p className="text-sm text-gray-500 font-medium">Manage modular stock and strategic catalog deployments.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
              type="text" 
              placeholder="Filter by name/SKU..." 
              className="bg-gray-50 border border-gray-100 rounded-lg py-2.5 pl-10 pr-4 text-xs outline-none focus:border-[#006666] transition-all w-64 font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <button 
             onClick={() => { setIsEditing(false); setNewProduct({name:'', price:'', oldPrice:'', discount:'', category:'Software', description:'', image:'', stock:10}); setIsModalOpen(true); }}
             className="p-2.5 bg-[#006666] text-white rounded-lg hover:bg-[#004d4d] transition-all shadow-lg shadow-[#006666]/20"
           >
             <PlusCircle size={20} />
           </button>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 font-bold text-sm flex items-center gap-2">
           <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-[#f8f9fa]">
                        <img src={p.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#2b2b2b]">{p.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-tighter">SKU-{p.id.slice(-6).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-[10px] font-black text-[#006666] bg-[#e6f2f2] px-2.5 py-1 rounded-full uppercase tracking-widest">
                       {p.category}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-[#2b2b2b]">${p.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[100px] h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={clsx(
                            "h-full rounded-full transition-all duration-1000",
                            p.stock <= 5 ? "bg-[#fe6a49]" : "bg-[#006666]"
                          )} 
                          style={{ width: `${Math.min(p.stock * 10, 100)}%` }}
                        />
                      </div>
                      <span className={clsx("text-xs font-black", p.stock <= 5 ? "text-[#fe6a49]" : "text-gray-900")}>
                        {p.stock}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(p)} className="p-2 text-gray-400 hover:text-[#006666] hover:bg-[#e6f2f2] rounded-lg transition-all" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-gray-400 hover:text-[#fe6a49] hover:bg-[#fe6a49]/10 rounded-lg transition-all" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Modify Unit Specs" : "Launch New Logic"}>
        <form onSubmit={handleCreate} className="space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Product Label</label>
               <input 
                 required 
                 className="w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-[#006666] focus:bg-white transition-all" 
                 value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
               />
            </div>

            <div className="md:col-span-2">
              <div 
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all overflow-hidden"
              >
                <input type="file" ref={fileInputRef} className="hidden" onChange={e => processFile(e.target.files[0])} />
                {newProduct.image ? <img src={newProduct.image} className="h-40 object-cover rounded-xl" /> : <Upload className="text-gray-300" size={32} />}
              </div>
            </div>

            <div>
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Unit Price ($)</label>
               <input 
                 required type="number" step="0.01"
                 className="w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-bold text-[#006666] outline-none focus:border-[#006666] focus:bg-white transition-all" 
                 value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
               />
            </div>

            <div>
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Stock Quantity</label>
               <input 
                 required type="number"
                 className="w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-bold text-gray-900 outline-none focus:border-[#006666] focus:bg-white transition-all" 
                 value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} 
               />
            </div>

            <div className="md:col-span-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Strategy Alignment (Category)</label>
               <div className="grid grid-cols-3 gap-2">
                 {categories.map(cat => (
                   <button key={cat} type="button" onClick={() => setNewProduct({...newProduct, category: cat})} className={clsx("py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all", newProduct.category === cat ? "bg-[#006666] text-white border-[#006666]" : "bg-gray-50 text-gray-400 border-transparent hover:border-gray-200")}>
                     {cat}
                   </button>
                 ))}
               </div>
            </div>

            <div className="md:col-span-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Extended Intelligence (Description)</label>
               <textarea 
                 required className="w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-[#006666] focus:bg-white transition-all h-24 resize-none" 
                 value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}
               />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-[#006666] text-white rounded-xl font-black text-sm shadow-xl shadow-[#006666]/20 active:scale-[0.98]">
            {isEditing ? "Sync Updates" : "Deploy Unit"}
          </button>
        </form>
      </Modal>

      {/* Analytics Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Total Value', value: `$${products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}`, icon: DollarSign, color: '#006666' },
           { label: 'Stock Items', value: products.reduce((acc, p) => acc + p.stock, 0), icon: Package, color: '#fe6a49' },
           { label: 'Low Stock', value: products.filter(p => p.stock <= 5 && p.stock > 0).length, icon: ShieldAlert, color: '#fe6a49' },
           { label: 'Active Categories', value: new Set(products.map(p => p.category)).size, icon: Tag, color: '#006666' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${stat.color}10`, color: stat.color }}>
                 <stat.icon size={20} />
               </div>
             </div>
             <div className="text-2xl font-black text-[#2b2b2b]">{stat.value}</div>
             <div className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-[0.2em]">{stat.label}</div>
           </div>
         ))}
      </div>
    </div>
  );
}
