import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Send, Phone, Video, Info, MoreVertical, 
  Smile, Paperclip, ChevronLeft, CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Chat() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef();

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id);
      // Polling for simulation
      const interval = setInterval(() => fetchMessages(activeContact.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeContact]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const resp = await api.get('/chats/contacts');
      setContacts(resp.data);
      if (resp.data.length > 0 && !activeContact) setActiveContact(resp.data[0]);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const fetchMessages = async (contactId) => {
    try {
      const resp = await api.get(`/chats/messages?contactId=${contactId}`);
      setMessages(resp.data);
    } catch (err) { console.error(err); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    const tempMsg = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: user.id,
      receiverId: activeContact.id,
      createdAt: new Date(),
    };

    setMessages([...messages, tempMsg]);
    setNewMessage('');

    try {
      await api.post('/chats/messages', {
        receiverId: activeContact.id,
        content: tempMsg.content
      });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-surface rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className={clsx(
        "w-full md:w-80 border-r border-gray-100 flex flex-col transition-all",
        activeContact ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-gray-50 bg-white">
           <h2 className="text-xl font-bold text-text-main mb-4">Messages</h2>
           <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search chats..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary" />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50/30 no-scrollbar">
           {contacts.map(contact => (
             <button 
               key={contact.id}
               onClick={() => setActiveContact(contact)}
               className={clsx(
                 "w-full p-4 flex items-center gap-3 transition-all border-l-4",
                 activeContact?.id === contact.id ? "border-l-primary bg-red-50/50" : "border-l-transparent hover:bg-white"
               )}
             >
                <div className="relative">
                   <img src={contact.avatar || `https://i.pravatar.cc/100?u=${contact.email}`} className="w-12 h-12 rounded-full border border-gray-100" />
                   <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 text-left min-w-0">
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-text-main truncate">{contact.name}</span>
                      <span className="text-[10px] text-gray-400">12:30 PM</span>
                   </div>
                   <p className="text-xs text-text-muted truncate">Tap to open conversation...</p>
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={clsx(
        "flex-1 flex flex-col bg-white transition-all",
        !activeContact && "hidden md:flex"
      )}>
        {activeContact ? (
          <>
            {/* Header */}
            <div className="h-20 px-6 border-b border-gray-50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <button onClick={() => setActiveContact(null)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20}/></button>
                  <img src={activeContact.avatar || `https://i.pravatar.cc/100?u=${activeContact.email}`} className="w-10 h-10 rounded-full" />
                  <div>
                     <h3 className="text-sm font-bold text-text-main leading-tight">{activeContact.name}</h3>
                     <span className="text-[11px] text-red-500 font-medium">Online</span>
                  </div>
               </div>
               <div className="flex items-center gap-4 text-gray-400">
                  <button className="hover:text-primary"><Phone size={20}/></button>
                  <button className="hover:text-primary"><Video size={20}/></button>
                  <button className="hover:text-primary"><Info size={20}/></button>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/20 no-scrollbar">
               {messages.map((msg, i) => {
                 const isMe = msg.senderId === user.id;
                 return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id || i}
                      className={clsx("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
                    >
                      <div className={clsx(
                        "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                        isMe ? "bg-primary text-white rounded-br-none" : "bg-white text-text-main rounded-bl-none border border-gray-100"
                      )}>
                        {msg.content}
                      </div>
                      <div className={clsx("text-[10px] mt-1 text-right flex items-center gap-1", isMe ? "text-red-600" : "text-gray-400")}>
                         {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         {isMe && <CheckCheck size={12} />}
                      </div>
                    </motion.div>
                 );
               })}
               <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-50">
               <form onSubmit={handleSend} className="flex items-center gap-2 bg-gray-100 p-2 rounded-2xl">
                  <button type="button" className="p-2 hover:text-primary text-gray-400"><Paperclip size={20}/></button>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent border-none outline-none text-sm px-2"
                  />
                  <button type="button" className="p-2 hover:text-primary text-gray-400"><Smile size={20}/></button>
                  <button type="submit" className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-red-500/20 hover:scale-105 transition-all">
                     <Send size={20} />
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-50/30">
             <div className="w-20 h-20 bg-white shadow-xl shadow-red-500/5 rounded-full flex items-center justify-center mb-6">
                <Send size={32} className="text-gray-300" />
             </div>
             <h3 className="text-xl font-bold text-text-main">Welcome to Riho Chat</h3>
             <p className="text-text-muted text-sm mt-2 max-w-xs">Select a contact from the sidebar to start messaging securely.</p>
          </div>
        )}
      </div>
    </div>
  );
}
