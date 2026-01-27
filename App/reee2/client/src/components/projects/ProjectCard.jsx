import { MoreHorizontal, Clock, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

const statusStyles = {
  active: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  done: "bg-red-100 text-red-700",
};

export default function ProjectCard({ project }) {
  const { name, description, progress, status, dueDate, members } = project;

  return (
    <div className="riho-card hover:shadow-lg transition-all border-l-4 border-l-primary group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">
            {name}
          </h3>
          <span className={clsx(
            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mt-1 inline-block",
            statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-600"
          )}>
            {status}
          </span>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <p className="text-sm text-text-muted line-clamp-2 mb-6 h-10">
        {description}
      </p>

      {/* Progress */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-end">
          <span className="text-xs font-semibold text-text-main uppercase">Progress</span>
          <span className="text-xs font-bold text-primary">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex -space-x-2">
          {members?.map((member, i) => (
            <img 
              key={i}
              src={member.avatar || `https://i.pravatar.cc/100?u=${member.name}`}
              alt={member.name}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              title={member.name}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-1.5">
          {progress === 100 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
               <CheckCircle2 size={12} /> Finished
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-text-muted hover:text-red-500 transition-colors cursor-pointer">
              <Clock size={14} />
              <span className="text-[12px] font-medium">{dueDate || 'No date'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
