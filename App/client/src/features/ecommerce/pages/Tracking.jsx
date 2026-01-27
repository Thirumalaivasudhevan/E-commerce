import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { Package, Truck, CheckCircle2, MapPin, Clock, ArrowLeft, Archive, Box, X } from 'lucide-react';
import clsx from 'clsx';

export default function Tracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      if (!id) {
        // If no ID, fetch all user orders
        const res = await api.get('/orders');
        setOrder(res.data); // In this case order will be an array
      } else {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Locating package...</div>;

  // Landing page state (No ID provided)
  if (!id && Array.isArray(order)) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
               <Package size={32} className="text-primary" /> Track Your Shipments
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Select an active order to view real-time status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {order.length === 0 ? (
             <div className="col-span-full text-center p-12 bg-white rounded-3xl border border-gray-100">
                <Box size={48} className="text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No active shipments</h3>
                <p className="text-gray-500 mt-2">Any new orders will appear here for tracking.</p>
             </div>
          ) : (
             order.map(o => (
               <Link 
                 key={o.id} 
                 to={`/tracking/${o.id}`} 
                 className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer p-6"
               >
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Invoice #{o.invoiceId}</div>
                        <div className="font-bold text-gray-900 text-lg">${o.totalAmount.toFixed(2)}</div>
                     </div>
                     <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Truck size={18} />
                     </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                     <span className={clsx("w-2 h-2 rounded-full", 
                        o.status === 'delivered' ? "bg-green-500" : "bg-amber-500 animate-pulse"
                     )} />
                     {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                  </div>
               </Link>
             ))
          )}
        </div>
      </div>
    );
  }

  if (!order) return <div className="p-8 text-center text-red-500 font-bold">Tracking information not found.</div>;

  // Mock tracking steps based on order status (accelerated for prototype)
  const baseDate = order.createdAt ? new Date(order.createdAt).getTime() : Date.now();
  const steps = [
    { status: 'ordered', label: 'Order Placed', icon: Archive, date: order.createdAt },
    { status: 'processing', label: 'Processing', icon: Box, date: new Date(baseDate + 15000).toISOString() },
    { status: 'shipped', label: 'In Transit', icon: Truck, date: new Date(baseDate + 30000).toISOString() },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle2, date: new Date(baseDate + 45000).toISOString() }
  ];

  // Determine current step index (mock logic: paid -> processing)
  const currentStep = order.status === 'delivered' ? 3 : order.status === 'shipped' ? 2 : 1; 

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/orders" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Package size={24} className="text-primary" /> Track Package
            </h2>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Invoice #{order.invoiceId}</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/orders')}
          className="p-2 text-gray-300 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
          title="Close Tracking"
        >
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tracking Timeline */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
             {/* Map Background Mockup */}
             <div className="absolute top-0 right-0 w-64 h-full opacity-5 pointer-events-none">
                <MapPin size={300} className="text-gray-900" />
             </div>

             <div className="relative z-10">
                <div className="space-y-10">
                   {steps.map((step, idx) => (
                      <div key={idx} className="flex gap-6 relative">
                         {/* Connecting Line */}
                         {idx < steps.length - 1 && (
                           <div className={clsx(
                             "absolute left-6 top-12 bottom-[-40px] w-1 rounded-full",
                             idx < currentStep ? "bg-primary" : "bg-gray-100"
                           )} />
                         )}

                         <div className={clsx(
                           "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-4 z-10 transition-all duration-500",
                           idx <= currentStep ? "bg-primary border-red-100 text-white shadow-lg shadow-red-500/30" : "bg-white border-gray-100 text-gray-300"
                         )}>
                           <step.icon size={20} />
                         </div>

                         <div className={clsx("pt-1 transition-all duration-500", idx > currentStep && "opacity-50 blur-[0.5px]")}>
                            <h4 className="font-black text-gray-900 text-lg">{step.label}</h4>
                            <div className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-2">
                               <CalendarIcon date={step.date} />
                            </div>
                            {idx === currentStep && (
                              <div className="mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold inline-flex items-center gap-2 animate-pulse">
                                <Clock size={14} /> Estimated Arrival: Today by 8 PM
                              </div>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Order Details Sidebar */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="font-black text-gray-900 mb-6 text-sm flex items-center gap-2">
                 <Package size={18} className="text-primary" /> Package Contents
              </h4>
              <div className="space-y-4">
                 {order.items.map((item, i) => (
                    <div key={i} className="flex gap-3">
                       <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                          <img src={item.product.image} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 min-w-0 py-1">
                          <div className="text-[10px] font-bold text-primary uppercase tracking-widest">{item.product.category}</div>
                          <div className="font-bold text-gray-900 text-sm truncate">{item.product.name}</div>
                          <div className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-gray-900 p-6 rounded-3xl text-white shadow-xl shadow-gray-900/20">
              <h4 className="font-black text-sm uppercase tracking-widest text-gray-400 mb-2">Shipping To</h4>
              <p className="font-bold text-lg leading-relaxed">
                 {order.address}<br/>
                 {order.city}{order.state ? `, ${order.state}` : ''} {order.zip ? `- ${order.zip}` : ''}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function CalendarIcon({ date }) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return <span>Pending Date</span>;
  return (
    <span>{d.toLocaleDateString()} at {d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
  );
}
