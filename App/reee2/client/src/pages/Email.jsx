import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Inbox, Send, Star, Trash2, Mail, Plus, Search, 
  MoreVertical, Archive, ChevronLeft, ChevronRight, Reply, Forward
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Email() {
  const { user } = useAuth();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmails();
  }, [activeTab]);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const folderParam = activeTab === 'sent' ? '?sent=true' : '';
      const response = await api.get(`/emails${folderParam}`);
      setEmails(response.data);
    } catch (err) {
       console.error("Email fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] bg-surface rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-100 bg-gray-50/50 flex flex-col">
        <div className="p-6">
          <button className="w-full btn btn-primary py-3 shadow-lg shadow-red-500/20">
             <Plus size={18} /> Compose
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedEmail(null); }}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-md shadow-red-500/10" 
                  : "text-text-muted hover:bg-white hover:text-primary"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* List */}
      <div className={clsx(
        "flex-1 flex flex-col border-r border-gray-100 transition-all",
        selectedEmail ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-4 border-b border-gray-50 flex items-center gap-4 bg-white">
          <div className="relative flex-1">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="Search mail..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none" />
          </div>
          <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
             <MoreVertical size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {isLoading ? (
             <div className="space-y-px">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="p-4 border-b border-gray-50 animate-pulse bg-white">
                    <div className="flex justify-between mb-2"><div className="w-24 h-4 bg-gray-100 rounded" /><div className="w-12 h-3 bg-gray-100 rounded" /></div>
                    <div className="w-full h-3 bg-gray-100 rounded mb-1" />
                    <div className="w-2/3 h-3 bg-gray-100 rounded" />
                  </div>
                ))}
             </div>
          ) : (
            emails.map(email => (
              <div 
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={clsx(
                  "p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-red-50/30 group relative bg-white",
                  selectedEmail?.id === email.id && "bg-red-50 border-l-4 border-l-primary"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                   <h4 className={clsx("text-sm transition-colors", email.read ? "text-text-muted" : "font-bold text-text-main group-hover:text-primary")}>
                      {activeTab === 'sent' ? email.to : email.from}
                   </h4>
                   <span className="text-[10px] text-gray-400 font-medium">10:45 AM</span>
                </div>
                <div className="text-xs font-semibold text-text-main truncate mb-1">{email.subject}</div>
                <p className="text-xs text-text-muted line-clamp-1">{email.content}</p>
                
                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                   <button className="p-1 hover:text-primary"><Star size={14} /></button>
                   <button className="p-1 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reading Pane */}
      <div className={clsx(
        "flex-[1.5] bg-white flex flex-col transition-all",
        !selectedEmail && "hidden lg:flex"
      )}>
        {selectedEmail ? (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedEmail(null)} className="lg:hidden p-2 hover:bg-gray-50 rounded-lg"><ChevronLeft size={20}/></button>
                  <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><Archive size={18}/></button>
                  <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><Trash2 size={18}/></button>
                  <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><Mail size={18}/></button>
               </div>
               <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 hover:bg-gray-50 rounded-lg text-gray-400 text-xs font-medium flex items-center gap-1">
                     <Reply size={14} /> Reply
                  </button>
                  <button className="px-3 py-1.5 hover:bg-gray-50 rounded-lg text-gray-400 text-xs font-medium flex items-center gap-1">
                     <Forward size={14} /> Forward
                  </button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
               <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl font-bold text-text-main mb-8 border-b border-gray-100 pb-4">{selectedEmail.subject}</h2>
                  
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                           {selectedEmail.from[0]}
                        </div>
                        <div>
                           <div className="text-sm font-bold text-text-main">{selectedEmail.from}</div>
                           <div className="text-xs text-text-muted">To: {selectedEmail.to}</div>
                        </div>
                     </div>
                     <div className="text-xs text-text-muted font-medium">
                        Oct 24, 2026, 10:45 AM
                     </div>
                  </div>

                  <div className="text-text-main leading-relaxed text-sm whitespace-pre-wrap">
                     {selectedEmail.content}
                     <br/><br/>
                     Best regards,<br/>
                     {selectedEmail.from}
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50/30">
             <div className="w-20 h-20 bg-white shadow-xl shadow-red-500/5 rounded-3xl flex items-center justify-center mb-6 border border-gray-100">
                <Mail size={32} className="text-gray-300" />
             </div>
             <h3 className="text-xl font-bold text-text-main">Select an email to read</h3>
             <p className="text-text-muted text-sm mt-2 max-w-sm">
                Choose an email from the list on the left to view its contents and attachments here.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
