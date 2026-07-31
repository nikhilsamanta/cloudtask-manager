import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  const colorMap = {
    indigo: 'from-indigo-500/10 to-indigo-600/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    blue: 'from-blue-500/10 to-blue-600/5 text-blue-600 dark:text-blue-400 border-blue-500/20',
    emerald: 'from-emerald-500/10 to-emerald-600/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/10 to-amber-600/5 text-amber-600 dark:text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/10 to-rose-600/5 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
            {trend && <span className="text-emerald-500 font-semibold">{trend}</span>}
            <span>{subtitle}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
