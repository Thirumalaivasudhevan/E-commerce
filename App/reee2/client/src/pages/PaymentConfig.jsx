import { useState } from 'react';
import { CreditCard, ShieldCheck, Zap, Globe, Lock, CheckCircle2, AlertTriangle, ExternalLink, Settings2, Trash2, Plus } from 'lucide-react';
import clsx from 'clsx';

const availableGateways = [
  { id: 'stripe', name: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', description: 'Best for international payments and digital products.' },
  { id: 'paypal', name: 'PayPal', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg', description: 'Trusted worldwide for secure consumer transactions.' },
  { id: 'razorpay', name: 'Razorpay', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg', description: 'Top choice for payments in the Asian market.' }
];

export default function PaymentConfig() {
  const activeGateways = ['stripe'];
  const [isTestMode, setIsTestMode] = useState(true);

  return (
    <div className="space-y-8 font-['Montserrat'] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-xl border border-gray-100 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#006666] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#006666]/20">
               <ShieldCheck size={24} />
             </div>
             <h2 className="text-2xl font-black text-[#2b2b2b]">Payment Management</h2>
          </div>
          <p className="text-sm text-gray-500 font-medium mt-1">Configure secure gateways and PCI DSS compliant transaction logic.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
           <button 
             onClick={() => setIsTestMode(true)}
             className={clsx("px-4 py-2 text-xs font-black rounded-lg transition-all", isTestMode ? "bg-white text-[#fe6a49] shadow-sm" : "text-gray-400")}
           >
             SANDBOX
           </button>
           <button 
             onClick={() => setIsTestMode(false)}
             className={clsx("px-4 py-2 text-xs font-black rounded-lg transition-all", !isTestMode ? "bg-[#006666] text-white shadow-sm" : "text-gray-400")}
           >
             LIVE MODE
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gateway List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-[#2b2b2b]">Active Gateways</h3>
                 <button className="text-xs font-bold text-[#006666] hover:underline flex items-center gap-1 group">
                    <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Add New Provider
                 </button>
              </div>

              <div className="divide-y divide-gray-50">
                 {availableGateways.map(gateway => (
                    <div key={gateway.id} className="p-6 flex flex-col md:flex-row items-center gap-6 group hover:bg-gray-50/30 transition-colors">
                       <div className="w-32 h-16 bg-white border border-gray-100 rounded-xl flex items-center justify-center p-4">
                          <img src={gateway.logo} className="max-w-full max-h-full grayscale group-hover:grayscale-0 transition-all" alt={gateway.name} />
                       </div>
                       
                       <div className="flex-1 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                             <h4 className="font-black text-[#2b2b2b]">{gateway.name}</h4>
                             {activeGateways.includes(gateway.id) && (
                                <span className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                   <CheckCircle2 size={10} /> Active
                                </span>
                             )}
                          </div>
                          <p className="text-xs text-gray-400 font-medium leading-relaxed">{gateway.description}</p>
                       </div>

                       <div className="flex items-center gap-3">
                          <button className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-[#006666] hover:text-white transition-all">
                             <Settings2 size={18} />
                          </button>
                          <button className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Security Features */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                 <Lock size={120} className="absolute -right-8 -bottom-8 text-gray-50 rotate-12" />
                 <h4 className="text-lg font-bold text-[#2b2b2b] mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-[#006666]" size={20} /> Fraud Protection
                 </h4>
                 <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-semibold text-gray-600">CVV Verification</span>
                       <div className="w-10 h-5 bg-[#006666] rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-semibold text-gray-600">3D Secure v2</span>
                       <div className="w-10 h-5 bg-[#006666] rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-semibold text-gray-600">Geo-IP Blocking</span>
                       <div className="w-10 h-5 bg-gray-200 rounded-full relative"><div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-[#fe6a49]">
                 <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-bold text-[#2b2b2b]">PCI Compliance</h4>
                    <AlertTriangle className="text-[#fe6a49]" size={20} />
                 </div>
                 <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">Your current setup is PCI DSS Level 3 compliant. Upgrade tokenization logic to reach Level 1.</p>
                 <button className="w-full py-3 bg-[#fe6a49] text-white rounded-xl text-xs font-black hover:bg-[#e55c3f] transition-all flex items-center justify-center gap-2">
                    Refresh Certificate <ExternalLink size={14} />
                 </button>
              </div>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="bg-[#2b2b2b] text-white p-8 rounded-xl shadow-2xl space-y-6">
              <h3 className="text-xl font-bold">Commerce Intelligence</h3>
              <div className="space-y-6">
                 <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Transaction Success Rate</div>
                    <div className="text-3xl font-black text-[#006666]">98.4%</div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
                       <div className="h-full bg-[#006666] rounded-full" style={{ width: '98%' }} />
                    </div>
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Avg. Settlement Time</div>
                    <div className="text-3xl font-black text-[#fe6a49]">2.4 Days</div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
                       <div className="h-full bg-[#fe6a49] rounded-full" style={{ width: '40%' }} />
                    </div>
                 </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                 <div className="flex items-center gap-3 mb-2">
                    <Zap size={16} className="text-[#fe6a49]" />
                    <span className="text-xs font-bold">Fast Payouts Enabled</span>
                 </div>
                 <p className="text-[10px] text-gray-400 font-medium">Funds will reach your verified bank account even during bank holidays.</p>
              </div>
           </div>

           <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                 <Globe size={24} />
              </div>
              <div>
                 <h4 className="text-sm font-bold text-[#2b2b2b]">Global Currencies</h4>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Supporting 135+ Currencies</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
