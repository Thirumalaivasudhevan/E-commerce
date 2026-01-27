import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { History, Download, Eye, Calendar, Package, CheckCircle2, Clock, Truck } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { Link } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDownload = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading order history...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
             <History size={32} className="text-primary" /> Order History
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Track and manage your enterprise orders and invoices</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-20 text-center">
            <Package size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No orders yet</h3>
            <p className="text-gray-500 mt-2">Place your first order to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Items</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 font-bold text-sm text-gray-900">#{order.invoiceId}</td>
                    <td className="px-6 py-5 text-sm text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-300" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex -space-x-3 overflow-hidden">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <img 
                              key={idx}
                              src={item.product.image} 
                              className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm bg-gray-50"
                              alt="product"
                            />
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                              +{order.items.length - 3}
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-black text-primary">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-5">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                         order.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                       }`}>
                         {order.status}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => { setSelectedOrder(order); setIsInvoiceOpen(true); }}
                            className="p-2 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg active:scale-95 flex items-center gap-2 text-[10px] font-bold"
                          >
                            <Eye size={14} /> View Invoice
                          </button>
                          <Link 
                            to={`/tracking/${order.id}`}
                            className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all shadow-sm active:scale-95 flex items-center gap-2 text-[10px] font-bold"
                          >
                            <Truck size={14} /> Track
                          </Link>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      <Modal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} title="Order Invoice">
         {selectedOrder && (
           <div className="p-8 space-y-10 animate-in fade-in zoom-in-95 duration-300 print:p-0 print:m-0" id="invoice-content">
              <div className="flex justify-between items-start">
                 <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                       <div className="w-6 h-6 bg-white rounded-md" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Riho Enterprise OS</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Official Transaction Receipt</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Invoice Number</div>
                    <div className="text-xl font-black text-primary">#{selectedOrder.invoiceId}</div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-100">
                 <div className="space-y-2">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bill To</h5>
                    <div className="text-sm font-bold text-gray-900">{selectedOrder.user?.name}</div>
                    <div className="text-xs text-gray-500 font-medium">{selectedOrder.user?.email}</div>
                    <div className="text-xs text-gray-500 font-medium">{selectedOrder.phone}</div>
                 </div>
                 <div className="space-y-2">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipping Address</h5>
                     <div className="text-xs text-gray-500 font-medium leading-relaxed">
                        {selectedOrder.address},<br />
                        {selectedOrder.city}{selectedOrder.state ? `, ${selectedOrder.state}` : ''} {selectedOrder.zip ? `- ${selectedOrder.zip}` : ''}
                     </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Summary</h5>
                 <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                         <div className="flex items-center gap-4">
                            <img src={item.product.image} className="w-12 h-12 rounded-xl object-cover bg-white border border-gray-100" />
                            <div>
                               <div className="text-xs font-bold text-gray-900">{item.product.name}</div>
                               <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.product.category}</div>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-xs font-black text-gray-900">${item.price}</div>
                            <div className="text-[10px] text-gray-400 font-bold">Qty: {item.quantity}</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                 <div className="flex justify-end">
                    <div className="w-full md:w-64 space-y-3">
                       <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-gray-400">SUBTOTAL</span>
                          <span className="text-gray-900">${(selectedOrder.totalAmount / 1.1).toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-gray-400">TAX (10%)</span>
                          <span className="text-gray-900">${(selectedOrder.totalAmount - (selectedOrder.totalAmount / 1.1)).toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <span className="text-sm font-black text-gray-900">GRAND TOTAL</span>
                          <span className="text-2xl font-black text-primary">${selectedOrder.totalAmount.toFixed(2)}</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-10 flex gap-4">
                 <button 
                   onClick={handleDownload}
                   className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
                 >
                    <Download size={18} /> Download PDF
                 </button>
                 <button onClick={() => setIsInvoiceOpen(false)} className="px-8 py-4 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl font-black transition-all">
                    Close
                 </button>
              </div>
           </div>
         )}
      </Modal>
    </div>
  );
}
