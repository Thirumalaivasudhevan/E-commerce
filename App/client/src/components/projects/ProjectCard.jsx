import { useState } from 'react';
import { MoreHorizontal, Clock, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

const ActionMenu = ({ onEdit, onDelete }) => (
  <div className="absolute right-2 top-8 bg-surface border border-border rounded-lg shadow-xl z-20 w-32 overflow-hidden animate-in fade-in zoom-in-95">
    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-full text-left px-4 py-2 text-xs font-medium text-text-main hover:bg-surface-highlight flex items-center gap-2">
      <Edit size={12} /> Edit
    </button>
    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 flex items-center gap-2">
      <Trash2 size={12} /> Delete
    </button>
  </div>
);

const statusStyles = {
  active: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  pending: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  done: "bg-green-500/10 text-green-500 border border-green-500/20",
  doing: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
};

export default function ProjectCard({ project, onEdit, onDelete }) {
  const { title, description, progress = 0, status = 'pending', dueDate, members } = project || {};
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="nexus-card p-6 flex flex-col h-64 border border-border bg-surface-highlight hover:border-text-muted transition-all duration-300 group relative overflow-hidden">

      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className={clsx(
            "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block shadow-sm",
            statusStyles[(status || 'pending').toLowerCase()] || "bg-surface text-text-muted border border-border"
          )}>
            {status}
          </div>
          <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors line-clamp-1">
            {title || project?.name}
          </h3>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="text-text-muted hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <MoreHorizontal size={20} />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
            <ActionMenu
              onEdit={() => { setShowMenu(false); if (onEdit) onEdit(project); }}
              onDelete={() => { setShowMenu(false); if (onDelete) onDelete(project); }}
            />
          </>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-text-muted line-clamp-2 mb-auto leading-relaxed">
        {description || "No description provided."}
      </p>

      {/* Footer Area */}
      <div className="space-y-4 mt-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-end text-xs">
            <span className="font-bold text-text-muted uppercase tracking-wider">Progress</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-primary shadow-[0_0_10px_rgba(0,149,246,0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex -space-x-2 pl-2">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-[8px] text-text-muted">
                ?
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-text-muted">
            <Clock size={12} />
            <span className="text-xs font-medium">{dueDate ? new Date(dueDate).toLocaleDateString() : 'No Deadline'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
