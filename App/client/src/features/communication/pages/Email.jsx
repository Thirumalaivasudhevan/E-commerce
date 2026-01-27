import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import {
  Inbox, Send, Star, File, Trash2, Mail, Plus, Search,
  MoreVertical, Archive, ChevronLeft, ChevronRight, Reply, Forward,
  AlertCircle, Briefcase, Lock, User
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';


const SidebarItem = ({ icon: Icon, label, count, color }) => (
  <div className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group">
    <div className="flex items-center gap-3 text-text-muted group-hover:text-primary transition-colors">
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    {count && <span className={clsx("text-xs px-2 py-0.5 rounded-full font-bold", color ? color : "bg-surface text-text-muted")}>{count}</span>}
  </div>
);

const LabelItem = ({ color, label }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
    <div className={clsx("w-2.5 h-2.5 rounded-full", color)} />
    <span className="text-sm font-medium text-text-muted">{label}</span>
  </div>
);

export default function Email() {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newEmail, setNewEmail] = useState({ to: '', subject: '', content: '' });

  // Fetch Emails
  const fetchEmails = async () => {
    setLoading(true);
    try {
      // Map frontend folder names to backend/logical names if needed
      // Backend supports 'inbox' (default) and 'sent' for now.
      const paramFolder = activeFolder === 'sent' ? 'sent' : 'inbox';
      const res = await api.get('/emails', {
        params: { folder: paramFolder }
      });

      const mappedEmails = res.data.map(e => ({
        id: e.id,
        from: e.from,
        subject: e.subject,
        content: e.content,
        time: new Date(e.createdAt).toLocaleDateString(),
        avatar: `https://ui-avatars.com/api/?name=${e.from}&background=random`,
        label: e.folder, // Using folder as label for now
        star: e.isStarred
      }));
      setEmails(mappedEmails);
    } catch (err) {
      console.error("Failed to fetch emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [activeFolder]);

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await api.post('/emails', newEmail);
      setIsComposeOpen(false);
      setNewEmail({ to: '', subject: '', content: '' });
      if (activeFolder === 'sent') fetchEmails(); // Refresh if in sent
      alert('Email sent successfully');
    } catch (err) {
      console.error("Failed to send email");
      alert('Failed to send email');
    }
  };

  return (
    <div className="flex bg-transparent rounded-3xl overflow-hidden text-text-main h-[calc(100vh-8rem)] glass-panel">

      {/* Sidebar */}
      <div className="w-64 bg-transparent border-r border-border flex flex-col p-6 overflow-y-auto">
        <button
          onClick={() => setIsComposeOpen(true)}
          className="w-full bg-surface-highlight text-white py-3 rounded-xl font-bold mb-8 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors shadow-lg shadow-black/20"
        >
          <Plus size={18} /> Compose Email
        </button>

        <div className="space-y-1 mb-8">
          <div className="bg-surface rounded-xl shadow-none border border-border">
            <div onClick={() => setActiveFolder('inbox')}>
              <SidebarItem icon={Inbox} label="Inbox" count={activeFolder === 'inbox' ? emails.length : undefined} color={activeFolder === 'inbox' ? "bg-primary text-white" : ""} />
            </div>
            <div onClick={() => setActiveFolder('sent')}>
              <SidebarItem icon={Send} label="Sent" color={activeFolder === 'sent' ? "bg-primary text-white" : ""} />
            </div>
            <SidebarItem icon={Star} label="Starred" count={0} color="bg-white/10 text-text-muted" />
            <SidebarItem icon={File} label="Draft" />
            <SidebarItem icon={Trash2} label="Trash" />
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="px-4 text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Labels</h4>
          <SidebarItem icon={Briefcase} label="Work" />
          <SidebarItem icon={Lock} label="Private" />
          <SidebarItem icon={AlertCircle} label="Support" />
          <button className="w-full text-left px-4 py-2 text-xs font-bold text-primary hover:text-white flex items-center gap-2 mt-2">
            <Plus size={14} /> Add Label
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-transparent">
        {/* Top Bar */}
        <div className="h-16 px-6 border-b border-border flex items-center justify-between">
          <div className="font-bold text-lg capitalize">{activeFolder}</div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto relative">
          {loading && <div className="p-8 text-center text-gray-500">Loading emails...</div>}

          {!loading && emails.length === 0 && (
            <div className="p-8 text-center text-gray-500">No emails in {activeFolder}</div>
          )}

          {!loading && emails.map(email => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={clsx(
                "flex items-center gap-4 p-5 border-b border-border hover:bg-white/5 cursor-pointer transition-colors group",
                selectedEmail?.id === email.id && "bg-white/5"
              )}
            >
              {/* ... Email Item UI ... */}
              <div className="w-5 h-5 border-2 border-border rounded-md flex-shrink-0" />
              <button className="text-gray-500 hover:text-yellow-400">
                <Star size={18} fill={email.star ? "gold" : "none"} stroke={email.star ? "gold" : "currentColor"} />
              </button>
              <img src={email.avatar} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3 font-bold text-text-main text-sm truncate">{email.from}</div>
                <div className="col-span-7 flex items-center gap-2 truncate">
                  <span className="text-sm text-text-muted truncate">{email.subject} - </span>
                  <span className="text-sm text-gray-500 truncate">{email.content}</span>
                </div>
                <div className="col-span-2 text-right text-xs text-text-muted font-medium">
                  {email.time}
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-center p-8">
            <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1">
              <button className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-md text-text-muted"><ChevronLeft size={16} /></button>
              <button className="w-8 h-8 flex items-center justify-center bg-surface-highlight text-white rounded-md font-bold text-xs">1</button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-md text-text-muted font-medium text-xs">2</button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-md text-text-muted"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* Compose Modal (Simplified inline for now) */}
        {isComposeOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <form onSubmit={handleSend} className="bg-surface p-6 rounded-2xl w-[500px] border border-border">
              <h3 className="font-bold mb-4">New Message</h3>
              <input
                className="w-full bg-surface-highlight p-3 rounded-lg mb-2 text-sm text-text-main border border-border"
                placeholder="To"
                value={newEmail.to}
                onChange={e => setNewEmail({ ...newEmail, to: e.target.value })}
                required
              />
              <input
                className="w-full bg-surface-highlight p-3 rounded-lg mb-2 text-sm text-text-main border border-border"
                placeholder="Subject"
                value={newEmail.subject}
                onChange={e => setNewEmail({ ...newEmail, subject: e.target.value })}
                required
              />
              <textarea
                className="w-full bg-surface-highlight p-3 rounded-lg mb-4 h-32 text-sm text-text-main border border-border"
                placeholder="Content"
                value={newEmail.content}
                onChange={e => setNewEmail({ ...newEmail, content: e.target.value })}
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsComposeOpen(false)} className="px-4 py-2 hover:bg-white/10 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-bold">Send</button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
