import React from 'react';
import { Calendar, MessageSquare, Paperclip, AlertCircle, ArrowUpRight } from 'lucide-react';

const TaskCard = ({ task, onClick, onStatusChange }) => {
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div
      onClick={() => onClick(task)}
      className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 group"
    >
      {/* Priority Badge & Project Tag */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(task.priority)}`}>
          {task.priority} Priority
        </span>
        {task.project?.name && (
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-[120px]">
            {task.project.name}
          </span>
        )}
      </div>

      {/* Task Title */}
      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h3>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/40"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
        {/* Assignee Avatar */}
        <div className="flex items-center gap-2">
          {task.assignedTo?.avatar ? (
            <img
              src={task.assignedTo.avatar}
              alt={task.assignedTo.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-300 dark:border-slate-700"
              title={`Assigned to ${task.assignedTo.name}`}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold text-[10px] flex items-center justify-center border border-indigo-500/20">
              {task.assignedTo?.name?.charAt(0) || 'U'}
            </div>
          )}
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[90px]">
            {task.assignedTo?.name || 'Unassigned'}
          </span>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            <Calendar className="w-3 h-3" />
            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
