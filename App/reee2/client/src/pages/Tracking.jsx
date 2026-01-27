import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Package, Truck, CheckCircle2, MapPin, Clock, ArrowLeft, Archive, Box, X, Globe, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

export default function Tracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      if (!id) {
        const res = await api.get('/orders');
        setOrder(res.data);
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

  if (loading) return <div className="p-20 text-center font-black text-gray-400 animate-pulse">Synchronizing coordinates...</div>;

  if (!id && Array.isArray(order)) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 font-['Montserrat'] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50 gap-6">
          <div>
            <h2 className="text-4xl font-black text-[#2b2b2b] tracking-tighter flex items-center gap-4">
               <div className="p-3 bg-[#e6f2f2] rounded-2xl text-[#006666]">
                  <Globe size={32} />
               </div>
               Logistics Dashboard
            </h2>
            <p className="text-sm text-gray-400 font-bold mt-2 uppercase tracking-widest pl-1">Global shipment monitoring & verification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {order.length === 0 ? (
             <div className="col-span-full py-32 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                <Box size={64} className="text-gray-100 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-[#2b2b2b]">No Active Shipments</h3>
                <p className="text-gray-400 mt-2 font-medium">Your logistical pipeline is currently clear of inbound units.</p>
                <button onClick={() => navigate('/ecommerce')} className="mt-8 px-8 py-3 bg-[#006666] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#006666]/20">Explore Inventory</button>
             </div>
          ) : (
             order.map(o => (
               <Link 
                 key={o.id} 
                 to={`/tracking/${o.id}`} 
                 className="group bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 p-8 flex flex-col"
               >
                  <div className="flex justify-between items-start mb-8">
                     <div className="space-y-1">
                        <div className="text-[10px] font-black text-[#006666] bg-[#e6f2f2] px-2 py-0.5 rounded-md inline-block uppercase tracking-widest">In Transit</div>
                        <div className="text-xs font-black text-gray-300 uppercase tracking-widest block pt-2">ID: {o.invoiceId}</div>
                     </div>
                     <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-[#006666] group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-lg group-hover:shadow-[#006666]/30">
                        <Truck size={24} />
                     </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="text-3xl font-black text-[#2b2b2b] mb-1">${o.totalAmount.toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        {new Date(o.createdAt).toLocaleDateString()} • {o.items.length} Unit(s)
                    </div>
                  </div>
               </Link>
             ))
          )}
        </div>
      </div>
    );
  }

  if (!order) return <div className="p-20 text-center font-black text-[#fe6a49]">UNAUTHORIZED: Order ID Null</div>;

  const baseDate = order.createdAt ? new Date(order.createdAt).getTime() : Date.now();
  const steps = [
    { status: 'ordered', label: 'Order Authenticated', icon: ShieldCheck, date: order.createdAt, desc: 'Payload verified and recorded in Riho ledger.' },
    { status: 'processing', label: 'Processing Control', icon: Box, date: new Date(baseDate + 30 * 60000).toISOString(), desc: 'Logistics center initializing unit preparation.' },
    { status: 'shipped', label: 'Tactical Deployment', icon: Truck, date: new Date(baseDate + 120 * 60000).toISOString(), desc: 'Shipment dispatched via high-speed transit network.' },
    { status: 'delivered', label: 'Unit Deployed', icon: CheckCircle2, date: new Date(baseDate + 24 * 60 * 60000).toISOString(), desc: 'Final destination reached and verified.' }
  ];

  const currentStep = order.status === 'delivered' ? 3 : order.status === 'shipped' ? 2 : 1; 

  return (
    <div className="max-w-7xl mx-auto space-y-12 font-['Montserrat'] animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50 gap-6">
        <div className="flex items-center gap-6">
          <Link to="/tracking" className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-[#2b2b2b] rounded-2xl transition-all shadow-inner">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-4xl font-black text-[#2b2b2b] tracking-tighter">Live Unit Tracking</h2>
            <p className="text-xs font-black text-[#006666] uppercase tracking-[0.2em] mt-2">Protocol: {order.invoiceId}</p>
          </div>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
           <div className="px-6 py-2.5 bg-white text-[#2b2b2b] shadow-sm rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Telemetry
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Tracking Timeline */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-80 h-full opacity-[0.03] pointer-events-none rotate-12">
                <MapPin size={400} className="text-gray-900" />
             </div>

             <div className="relative z-10 space-y-16">
                {steps.map((step, idx) => (
                   <div key={idx} className="flex gap-10 relative group">
                      {idx < steps.length - 1 && (
                        <div className={clsx(
                          "absolute left-8 top-16 bottom-[-64px] w-1.5 rounded-full transition-all duration-1000",
                          idx < currentStep ? "bg-[#006666]" : "bg-gray-50 shadow-inner"
                        )} />
                      )}

                      <div className={clsx(
                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border-4 z-10 transition-all duration-700",
                        idx <= currentStep 
                          ? "bg-[#006666] border-[#e6f2f2] text-white shadow-2xl shadow-[#006666]/30 scale-110" 
                          : "bg-white border-gray-50 text-gray-200"
                      )}>
                        <step.icon size={24} />
                      </div>

                      <div className={clsx("pt-2 transition-all duration-1000", idx > currentStep && "opacity-30")}>
                         <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-black text-[#2b2b2b] text-xl">{step.label}</h4>
                            {idx === currentStep && <span className="bg-[#fe6a49] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ml-2">Active</span>}
                         </div>
                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Clock size={12} /> {new Date(step.date).toLocaleDateString()} • {new Date(step.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </div>
                         <p className="text-sm text-gray-400 font-medium max-w-md leading-relaxed">
                            {step.desc}
                         </p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
           <div className="bg-[#2b2b2b] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8">Shipment Blueprint</h4>
              
              <div className="space-y-6">
                 {order.items.map((item, i) => (
                    <div key={i} className="flex gap-4 group/item">
                       <div className="w-16 h-16 bg-white/5 rounded-2xl overflow-hidden border border-white/10 shrink-0 shadow-inner group-hover/item:border-white/30 transition-all">
                          <img src={item.product.image} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" />
                       </div>
                       <div className="flex-1 min-w-0 py-1">
                          <div className="text-[9px] font-black text-[#fe6a49] uppercase tracking-widest mb-1">{item.product.category}</div>
                          <div className="font-black text-sm truncate uppercase tracking-tight">{item.product.name}</div>
                          <div className="text-xs text-white/40 mt-1 font-bold">STK: {item.quantity} Unit(s)</div>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-10 pt-10 border-t border-white/10 flex justify-between items-center">
                 <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Value</div>
                 <div className="text-3xl font-black">${order.totalAmount.toFixed(2)}</div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-[#e6f2f2] rounded-xl text-[#006666]">
                    <MapPin size={20} />
                 </div>
                 <h4 className="text-lg font-black text-[#2b2b2b]">Delivery Matrix</h4>
              </div>
              <div className="space-y-4">
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                    {order.address}<br/>
                    {order.city}, {order.state}<br/>
                    {order.zip} • Verified HQ
                 </p>
                 <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Protocol Check</span>
                    <ShieldCheck className="text-green-500" size={16} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
