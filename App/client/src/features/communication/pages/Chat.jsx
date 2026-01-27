

import { useState, useRef, useEffect } from 'react';
import api from '../../../api/axios';
import {
  Search, Send, Phone, Video, Info, MoreVertical,
  Smile, Paperclip, Mic, Image as ImageIcon, Check
} from 'lucide-react';
import clsx from 'clsx';

export default function Chat() {
  const [activeTab, setActiveTab] = useState('Contacts');
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // To identify "Me" vs others

  // Get current user ID (decode token or from context - for simplicity, we rely on senderId from msg)
  // Actually, let's fetch /auth/me or similar if available, or just use the message senderId compare?
  // We'll rely on the backend response.

  useEffect(() => {
    fetchContacts();
    // Also fetch 'me' or assume 'me' is handled by UI logic (right align if senderId === myId)
    // For now, let's just fetch contacts.
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
      const interval = setInterval(() => fetchMessages(selectedContact.id), 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/chats'); // Returns { users: [...] }
      if (res.data.users) {
        setContacts(res.data.users.map(u => ({
          id: u.id,
          name: u.name,
          img: u.avatar,
          msg: 'Tap to chat',
          time: '',
          active: false
        })));
      }
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      const res = await api.get('/chats', { params: { partnerId } });
      setMessages(res.data.map(m => ({
        id: m.id,
        sender: m.senderId, // We need to know who is 'Me'. 
        // Ideally we need the current user ID. 
        // Let's assume we can get it from localStorage or a simple /me call.
        text: m.content,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderId: m.senderId
      })));
    } catch (err) {
      console.error("Failed to fetch messages");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContact) return;

    try {
      await api.post('/chats', {
        receiverId: selectedContact.id,
        content: messageText
      });
      setMessageText('');
      fetchMessages(selectedContact.id); // Refresh immediately
    } catch (err) {
      console.error("Failed to send message");
    }
  }

  // Helper to determine if message is mine.
  // Since we don't have currentUserId in state easily without context,
  // we can check if senderId !== selectedContact.id.
  const isMyMessage = (msg) => msg.senderId !== selectedContact?.id;

  return (
    <div className="flex bg-transparent rounded-3xl overflow-hidden text-text-main h-[calc(100vh-8rem)] glass-panel">

      {/* Sidebar List */}
      <div className="w-80 border-r border-border flex flex-col bg-transparent">
        {/* Search */}
        <div className="p-6 pb-2">
          <div className="bg-surface rounded-xl px-4 py-3 flex items-center gap-2 mb-6">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search here.." className="bg-transparent border-none outline-none text-sm w-full font-medium text-text-main placeholder-text-muted" />
          </div>

          {/* Tabs */}
          <div className="flex gap-8 border-b border-border mb-2">
            <button
              onClick={() => setActiveTab('Contacts')}
              className={clsx("pb-3 text-sm font-bold border-b-2 transition-colors", activeTab === 'Contacts' ? "border-primary text-primary" : "border-transparent text-text-muted")}
            >
              Contacts
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar">
          <div className="text-text-muted text-xs font-bold mb-4 uppercase tracking-widest pl-2">All Users</div>
          {contacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={clsx(
                "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all",
                selectedContact?.id === contact.id ? "bg-white/10 shadow-lg border-l-4 border-l-primary scale-[1.02]" : "hover:bg-white/5"
              )}
            >
              <div className="relative">
                <img src={contact.img} className="w-10 h-10 rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-text-main text-sm truncate">{contact.name}</h4>
                <p className={clsx("text-xs truncate font-medium", selectedContact?.id === contact.id ? "text-primary" : "text-text-muted")}>
                  {contact.msg}
                </p>
              </div>
            </div>
          ))}
          {contacts.length === 0 && <div className="text-center text-text-muted text-xs mt-4">No other users found.</div>}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-transparent">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="h-20 bg-transparent border-b border-border px-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={selectedContact.img} className="w-10 h-10 rounded-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-text-main">{selectedContact.name}</h3>
                  <p className="text-xs text-green-500 font-medium">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-3 hover:bg-white/5 rounded-xl text-text-muted"><Search size={18} /></button>
                <button className="p-3 hover:bg-white/5 rounded-xl text-text-muted"><Info size={18} /></button>
                <button className="p-3 hover:bg-white/5 rounded-xl text-text-muted"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.map((msg, idx) => {
                const isMe = isMyMessage(msg);
                return (
                  <div key={idx} className={clsx("flex gap-4 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                    <img
                      src={isMe ? "https://ui-avatars.com/api/?name=Me&background=random" : selectedContact.img}
                      className="w-8 h-8 rounded-full object-cover mt-auto"
                    />
                    <div>
                      <div className={clsx(
                        "p-5 rounded-2xl text-sm leading-relaxed shadow-sm relative",
                        isMe ? "bg-primary text-white rounded-br-none" : "bg-surface-highlight text-text-main rounded-bl-none border border-border"
                      )}>
                        {msg.text}
                      </div>
                      <div className={clsx("text-[10px] text-text-muted font-medium mt-2", isMe ? "text-right" : "text-left")}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-surface border-t border-border">
              <form onSubmit={handleSend} className="flex items-center gap-4">
                <button type="button" className="text-text-muted hover:text-primary"><PlusIcon /></button>
                <div className="flex-1 bg-surface-highlight rounded-xl px-4 py-3 flex items-center gap-3 border border-border">
                  <Smile size={20} className="text-text-muted" />
                  <input
                    type="text"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder="Type Message here.."
                    className="bg-transparent border-none outline-none text-sm w-full font-medium text-text-main placeholder-text-muted"
                  />
                  <Mic size={20} className="text-text-muted" />
                </div>
                <button type="submit" className="p-3 bg-primary text-white rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95">
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted font-medium">
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5v14" />
  </svg>
);
