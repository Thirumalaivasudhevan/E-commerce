import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        />

        {/* Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-surface border border-border w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 overflow-hidden ring-1 ring-white/5"
        >

          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border relative z-10">
            <h3 className="text-xl font-bold text-text-main tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-highlight rounded-full text-text-muted hover:text-text-main transition-all transform hover:rotate-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar relative z-10">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
