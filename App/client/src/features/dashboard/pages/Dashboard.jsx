import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import {
  MoreHorizontal, ArrowUpRight, ArrowDownRight, Users,
  ShoppingBag, Package, CreditCard, Clock, CheckCircle
} from 'lucide-react';
import clsx from 'clsx';

const revenueData = [
  { name: 'Jan', sales: 200 },
  { name: 'Feb', sales: 300 },
  { name: 'Mar', sales: 250 },
  { name: 'Apr', sales: 400 },
  { name: 'May', sales: 350 },
  { name: 'Jun', sales: 200 },
  { name: 'Jul', sales: 450 },
  { name: 'Aug', sales: 400 },
  { name: 'Sep', sales: 480 },
  { name: 'Oct', sales: 420 },
  { name: 'Nov', sales: 500 },
  { name: 'Dec', sales: 450 },
];

const topProducts = [
  { name: 'Huawai Smart Watch', sku: 'SKU90400', price: 39.02, revenue: 51, qty: 12, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100' },
  { name: 'Noise - Wireless', sku: 'SKU78589', price: 45.26, revenue: 8, qty: 19, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100' },
  { name: 'Men & Women Footwear', sku: 'SKU78599', price: 45.62, revenue: 15, qty: 9, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100' },
  { name: 'Anime White Half', sku: 'SKU78596', price: 589.26, revenue: 7, qty: 9, img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=100' },
];

const newUsers = [
  { name: 'Smith John', country: 'India', img: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { name: 'Robert Fox', country: 'Afghanistan', img: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { name: 'Darlene Robertson', country: 'Georgia', img: 'https://randomuser.me/api/portraits/women/3.jpg' },
  { name: 'Floyd Miles', country: 'Pakistan', img: 'https://randomuser.me/api/portraits/men/4.jpg' },
  { name: 'Jacob Jones', country: 'Monaco', img: 'https://randomuser.me/api/portraits/men/5.jpg' },
];

const transactions = [
  { name: 'Darrell Steward', amount: 456.23, status: 'Complete' },
  { name: 'Floyd Miles', amount: 550.73, status: 'Failed' },
  { name: 'Ralph Edwards', amount: 785.26, status: 'Complete' },
  { name: 'Jerome Bell', amount: 458.14, status: 'Failed' },
  { name: 'Theresa Webb', amount: 263.24, status: 'Complete' },
  { name: 'Courtney Henry', amount: 785.14, status: 'Complete' },
];

const bestSellingData = [
  { name: 'Fashion', uv: 31.47, fill: '#0095F6' },
  { name: 'Accessories', uv: 26.69, fill: '#ED4956' },
  { name: 'Electronics', uv: 15.69, fill: '#00BA7C' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.stats);
        setRecentUsers(res.data.recentUsers || []);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6 pb-10">

      {/* Top Row: Revenue & Boost & Deliveries */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Revenue Growth Chart */}
        <div className="xl:col-span-2 nexus-card p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-bold text-text-main">Revenue Growth</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-text-muted"><div className="w-2 h-2 rounded-full bg-primary" /> Marketing Sale</span>
              <select className="bg-surface border-none outline-none rounded-md px-2 py-1 text-text-muted">
                <option>This Year</option>
              </select>
            </div>
          </div>
          <div className="flex gap-8 mb-6">
            <div>
              <div className="text-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Total Sales</div>
              <div className="text-xl font-bold text-text-main">${stats?.revenue?.toFixed(2) || '0.00'}</div>
              <div className="text-[10px] text-green-500 font-bold mt-1">+40.15% than last month</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Total Orders</div>
              <div className="text-xl font-bold text-text-main">{stats?.orders || 0}</div>
              <div className="text-[10px] text-green-500 font-bold mt-1">Active Orders</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Total Projects</div>
              <div className="text-xl font-bold text-text-main">{stats?.projects || 0}</div>
              <div className="text-[10px] text-green-500 font-bold mt-1">Ongoing</div>
            </div>
          </div>
          <div className="h-64 chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid vertical={false} stroke="#363636" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A8A8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A8A8' }} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #363636', backgroundColor: '#121212', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#F5F5F5', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#A8A8A8' }}
                />
                <Line type="stepAfter" dataKey="sales" stroke="#0095F6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#0095F6', stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Boost Up & Deliveries */}
        <div className="col-span-1 xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Boost Card */}
          <div className="rounded-xl overflow-hidden relative bg-gradient-to-br from-gray-800 to-black border border-border text-white p-8 flex flex-col justify-center">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-3">Boost up your sale</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                by upgrading your account you can increase your sale by 30% more.
              </p>
              <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-bold transition-all text-white">
                Upgrade Now
              </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-[-50px] right-[-50px] w-40 h-40 border-[20px] border-white/5 rounded-full" />
            <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-primary opacity-20 rounded-full blur-2xl" />
          </div>

          {/* Deliveries */}
          <div className="nexus-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-text-main">Deliveries</h3>
              <MoreHorizontal size={18} className="text-text-muted cursor-pointer" />
            </div>

            <div className="space-y-8 mt-8">
              <div className="relative">
                <div className="flex justify-between mb-2 text-sm font-medium">
                  <span className="text-text-muted">On Time Delivery</span>
                  <span className="text-text-main font-bold">80%</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[80%] rounded-full" />
                </div>
                <div className="mt-2 text-right font-bold text-text-main">$45,452.23</div>
              </div>

              <div className="relative">
                <div className="flex justify-between mb-2 text-sm font-medium">
                  <span className="text-text-muted">Delayed Delivery</span>
                  <span className="text-text-main font-bold">15%</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 w-[15%] rounded-full" />
                </div>
                <div className="mt-2 text-right font-bold text-text-main">$15,256.23</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Top Product, New User, Team Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top Product */}
        <div className="nexus-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-main">Top Product</h3>
            <button className="text-xs font-bold text-primary hover:text-white">View All</button>
          </div>
          <div className="space-y-6">
            {topProducts.map((prod, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <img src={prod.img} className="w-12 h-12 rounded-lg object-cover bg-surface" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{prod.sku}</div>
                  <div className="text-sm font-bold text-text-main truncate">{prod.name}</div>
                  <div className="text-xs text-primary font-bold">${prod.price}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-text-muted font-medium">QTY: {prod.qty}</div>
                  <div className="text-text-main font-bold">Rev: ${prod.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Users (Real Data) */}
        <div className="nexus-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-main">Total Users: {stats?.users || 0}</h3>
            <button className="text-xs font-bold text-primary hover:text-white">View All</button>
          </div>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-3 hover:bg-surface/50 rounded-xl transition-colors cursor-pointer">
                <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-text-main">{user.name}</div>
                  <div className="text-xs text-text-muted">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
                <button><MoreVerticalDot /></button>
              </div>
            ))}
            {recentUsers.length === 0 && <div className="text-sm text-text-muted">No users found.</div>}
          </div>
        </div>

        {/* Team Activity */}
        <div className="nexus-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-main">Team Activity</h3>
            <button className="text-xs font-bold text-primary hover:text-white">View All</button>
          </div>
          <div className="relative pl-4 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface dashed-line">
            {[
              { time: '5 min ago', title: 'Floyd has moved to the warehouse.', type: 'move' },
              { time: '6 min ago', title: 'Ralph has solved Mr.williams project.', type: 'solve' },
              { time: '10 min ago', title: 'Esther has changed his to active, now.', type: 'change' },
              { time: '11 min ago', title: 'Jacob has make changes in sold it.', type: 'sold' },
            ].map((activity, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 border-surface-highlight ring-1 ring-border bg-text-main" />
                <div className="flex gap-4">
                  <div className="text-xs text-text-muted whitespace-nowrap w-16">{activity.time}</div>
                  <div className="text-xs font-medium text-gray-400">{activity.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Transaction */}
        <div className="nexus-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-main">Latest Transaction</h3>
            <button className="text-xs font-bold text-primary hover:text-white">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-text-muted uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-lg">Name</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="group hover:bg-surface/50 transition-colors">
                    <td className="p-3 font-medium text-text-main">{tx.name}</td>
                    <td className="p-3 font-bold text-text-muted">${tx.amount}</td>
                    <td className="p-3">
                      <span className={clsx(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                        tx.status === 'Complete' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Selling Product */}
        <div className="nexus-card p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-text-main w-full mb-4">Best Selling Product</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="20%" outerRadius="100%" data={bestSellingData} startAngle={180} endAngle={0}>
                <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff', fontSize: '10px' }} background={{ fill: '#262626' }} clockWise dataKey="uv" />
                <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" wrapperStyle={{ top: 0, right: 0, lineHeight: '24px' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const MoreVerticalDot = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);
