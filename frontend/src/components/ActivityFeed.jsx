import React from 'react';
import { Activity, Clock } from 'lucide-react';

const ActivityFeed = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs">
        No recent team activities recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((item, idx) => (
        <div
          key={item._id || idx}
          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50"
        >
          {item.user?.avatar ? (
            <img
              src={item.user.avatar}
              alt={item.user.name}
              className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-slate-300 dark:border-slate-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
              {item.user?.name?.charAt(0) || 'A'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-snug">
              <span className="font-semibold text-slate-900 dark:text-white mr-1">
                {item.user?.name || 'System User'}
              </span>
              {item.action}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-mono">
              <Clock className="w-3 h-3" />
              <span>{new Date(item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
