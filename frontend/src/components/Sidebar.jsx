import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  User,
  Settings,
  Cloud,
  Server,
  Terminal,
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks Board', icon: CheckSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between hidden md:flex shrink-0 transition-colors">
      <div>
        {/* Brand Logo */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              ProjectFlow
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Keep Track of Projects</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="p-4 space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* DevOps Ready Widget */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800/90 dark:to-slate-900 border border-slate-700/60 text-white">
        <div className="flex items-center gap-2 mb-1.5 text-indigo-400 text-xs font-semibold">
          <Server className="w-4 h-4" />
          <span>DevOps Architecture</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug mb-3">
          Stateless REST API ready for Docker, Kubernetes (EKS), Terraform & AWS S3.
        </p>
        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <Terminal className="w-3 h-3" />
          <span>STATUS: 200 OK (MDB)</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
