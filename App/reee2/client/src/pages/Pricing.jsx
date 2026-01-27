import { Check, Zap, Shield, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Standard',
    icon: Zap,
    price: '0',
    description: 'Perfect for individuals and small projects.',
    features: ['Up to 5 Projects', '1GB Storage', 'Basic Support', 'Community Access'],
    color: 'gray',
    accent: '#6b7280'
  },
  {
    name: 'Professional',
    icon: Shield,
    price: '49',
    description: 'Ideal for growing teams and agencies.',
    features: ['Unlimited Projects', '10GB Storage', 'Priority Email Support', 'Advanced Analytics', 'Custom Domains'],
    color: 'teal',
    accent: '#006666',
    popular: true
  },
  {
    name: 'Enterprise',
    icon: Crown,
    price: '199',
    description: 'Custom solutions for large scale organizations.',
    features: ['Dedicated Account Manager', 'Unlimited Storage', '24/7 Phone Support', 'SSO & Advanced Security', 'Custom Integrations', 'White-labeling'],
    color: 'orange',
    accent: '#fe6a49'
  }
];

export default function Pricing() {
  return (
    <div className="space-y-12 font-['Montserrat'] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-4xl font-black text-[#2b2b2b]">Strategic Pricing Plans</h2>
        <p className="text-gray-500 font-medium">Choose the perfect plan to scale your modular commerce operations with Riho OS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        {plans.map((plan, idx) => (
          <motion.div 
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col ${
              plan.popular ? 'border-[#006666] shadow-xl shadow-[#006666]/10 scale-105 z-10' : 'border-gray-100 hover:border-gray-200'
            } bg-white`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#006666] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6`} style={{ backgroundColor: `${plan.accent}15`, color: plan.accent }}>
                <plan.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#2b2b2b] mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">{plan.description}</p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-black text-[#2b2b2b]">${plan.price}</span>
              <span className="text-gray-400 font-bold text-sm">/month</span>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map(feature => (
                <div key={feature} className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                  <div className="w-5 h-5 bg-green-50 text-green-500 rounded-full flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  {feature}
                </div>
              ))}
            </div>

            <button className={`w-full py-4 rounded-xl font-black transition-all shadow-lg active:scale-[0.98] ${
              plan.popular ? 'bg-[#006666] text-white hover:bg-[#004d4d] shadow-[#006666]/20' : 'bg-gray-100 text-[#2b2b2b] hover:bg-gray-200'
            }`}>
              {plan.price === '0' ? 'Get Started Free' : 'Choose Plan'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Comparison Table Section (Static) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h3 className="text-xl font-bold text-[#2b2b2b]">Feature Comparison</h3>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Detailed breakdown of functional capabilities</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-sm font-bold text-gray-500">Feature</th>
                <th className="px-8 py-5 text-sm font-bold text-[#2b2b2b] text-center">Standard</th>
                <th className="px-8 py-5 text-sm font-bold text-[#006666] text-center">Professional</th>
                <th className="px-8 py-5 text-sm font-bold text-[#fe6a49] text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ['API Access', true, true, true],
                ['Custom Invoicing', false, true, true],
                ['Bulk Product Upload', false, true, true],
                ['Advanced Tax Logic', false, false, true],
                ['Priority Support', false, 'Email', '24/7 Phone'],
                ['Data Export (CSV/PDF)', true, true, true]
              ].map(([feature, s, p, e]) => (
                <tr key={feature} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-5 text-sm font-semibold text-gray-700">{feature}</td>
                  <td className="px-8 py-5 text-center">
                    {typeof s === 'boolean' ? (s ? <Check className="mx-auto text-green-500" size={18}/> : <span className="text-gray-200">─</span>) : <span className="text-xs font-bold text-gray-500">{s}</span>}
                  </td>
                  <td className="px-8 py-5 text-center">
                    {typeof p === 'boolean' ? (p ? <Check className="mx-auto text-[#006666]" size={18}/> : <span className="text-gray-200">─</span>) : <span className="text-xs font-bold text-[#006666]">{p}</span>}
                  </td>
                  <td className="px-8 py-5 text-center">
                    {typeof e === 'boolean' ? (e ? <Check className="mx-auto text-[#fe6a49]" size={18}/> : <span className="text-gray-200">─</span>) : <span className="text-xs font-bold text-[#fe6a49]">{e}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
