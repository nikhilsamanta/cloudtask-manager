import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import ActivityFeed from '../components/ActivityFeed';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Plus,
  Users,
  PieChart as PieIcon,
  ArrowRight,
} from 'lucide-react';
import { getDashboardStatsApi } from '../services/api';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const Dashboard = ({ onNavigate, onOpenCreateTask, onOpenCreateProject }) => {
  const [stats, setStats] = useState({
    summary: {
      totalProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      pendingTasks: 0,
      totalTeamMembers: 0,
      completionRate: 0,
    },
    statusDistribution: [
      { name: 'To Do', value: 0, color: '#f59e0b' },
      { name: 'In Progress', value: 0, color: '#3b82f6' },
      { name: 'Completed', value: 0, color: '#10b981' },
    ],
    priorityBreakdown: [
      { name: 'High', count: 0, color: '#ef4444' },
      { name: 'Medium', count: 0, color: '#f59e0b' },
      { name: 'Low', count: 0, color: '#10b981' },
    ],
    recentActivities: [],
    recentProjects: [],
  });

  useEffect(() => {
    getDashboardStatsApi()
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.data);
        }
      })
      .catch(() => {
        // Clear or keep initial zeroed state on error
      });
  }, []);

  const summary = stats.summary || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time project velocity, task progress, and team activity logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateProject}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
          <button
            onClick={onOpenCreateTask}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={summary.totalProjects ?? 0}
          subtitle="Active Workspaces"
          icon={FolderKanban}
          color="indigo"
          trend="+0%"
        />
        <StatCard
          title="Total Tasks"
          value={summary.totalTasks ?? 0}
          subtitle={`${summary.completedTasks ?? 0} completed deliverables`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Completion Rate"
          value={`${summary.completionRate ?? 0}%`}
          subtitle="Overall sprint velocity"
          icon={CheckCircle2}
          color="emerald"
          trend="+0%"
        />
        <StatCard
          title="Pending Tasks"
          value={summary.pendingTasks ?? 0}
          subtitle="Require team action"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Analytics Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Status Distribution Doughnut */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Task Status Breakdown</h3>
            </div>
          </div>

          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{summary.totalTasks ?? 0}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Tasks</span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div>
              <span className="block text-xs font-bold text-amber-500">{summary.todoTasks ?? 0}</span>
              <span className="text-[10px] text-slate-400 font-medium">To Do</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-blue-500">{summary.inProgressTasks ?? 0}</span>
              <span className="text-[10px] text-slate-400 font-medium">In Progress</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-emerald-500">{summary.completedTasks ?? 0}</span>
              <span className="text-[10px] text-slate-400 font-medium">Completed</span>
            </div>
          </div>
        </div>

        {/* Priority Breakdown Progress Bars */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Task Priority Risk Profile</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-600 dark:text-rose-400">High Priority</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {stats.priorityBreakdown?.[0]?.count ?? 0} tasks
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: summary.totalTasks ? `${Math.round(((stats.priorityBreakdown?.[0]?.count || 0) / summary.totalTasks) * 100)}%` : '0%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-600 dark:text-amber-400">Medium Priority</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {stats.priorityBreakdown?.[1]?.count ?? 0} tasks
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: summary.totalTasks ? `${Math.round(((stats.priorityBreakdown?.[1]?.count || 0) / summary.totalTasks) * 100)}%` : '0%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-600 dark:text-emerald-400">Low Priority</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {stats.priorityBreakdown?.[2]?.count ?? 0} tasks
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: summary.totalTasks ? `${Math.round(((stats.priorityBreakdown?.[2]?.count || 0) / summary.totalTasks) * 100)}%` : '0%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>DevOps SLA Readiness</span>
            <span className="font-bold text-emerald-500">99.9% Compliant</span>
          </div>
        </div>

        {/* Audit / Recent Activity Log */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Audit Trail</h3>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              <span>View Tasks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <ActivityFeed activities={stats.recentActivities} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
