import React from 'react';
import { Calendar, Users, FolderKanban, CheckCircle2, ArrowRight } from 'lucide-react';

const ProjectCard = ({ project, onClick, onDelete }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Planning':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'On Hold':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const progress = project.progress !== undefined ? project.progress : 50;

  return (
    <div
      onClick={() => onClick(project)}
      className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
    >
      <div>
        {/* Category & Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/50 uppercase tracking-wider">
            {project.category || 'General'}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(project.status)}`}>
            {project.status}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {project.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>
      </div>

      <div>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer info: Members & Due Date */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          <div className="flex -space-x-2 overflow-hidden">
            {project.members && project.members.length > 0 ? (
              project.members.slice(0, 4).map((m, i) => (
                <img
                  key={m._id || i}
                  src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'User')}`}
                  alt={m.name}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-800 object-cover"
                  title={m.name}
                />
              ))
            ) : (
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                M
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 font-medium text-[11px] text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
            <span>View Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
