import React from 'react';
import TaskCard from './TaskCard';
import { Circle, Clock, CheckCircle2, Plus } from 'lucide-react';

const KanbanBoard = ({ tasks = [], onTaskClick, onStatusChange, onOpenCreateTask }) => {
  const columns = [
    {
      id: 'To Do',
      title: 'To Do',
      icon: Circle,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      icon: Clock,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 'Completed',
      title: 'Completed',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((col) => {
        const Icon = col.icon;
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div key={col.id} className="kanban-col">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${col.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {col.title}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {colTasks.length}
                </span>
              </div>

              {col.id === 'To Do' && (
                <button
                  onClick={onOpenCreateTask}
                  className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                  title="Add Task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Task Cards Stack */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
              {colTasks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <p className="text-xs font-medium text-slate-400">No tasks in {col.title}</p>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={onTaskClick}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
