import React, { useState, useEffect } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import { ArrowLeft, Calendar, Users, Plus, Shield, CheckCircle2 } from 'lucide-react';
import { getProjectByIdApi, getTasksApi, createTaskApi, updateTaskApi, updateTaskStatusApi, getUsersApi } from '../services/api';

const ProjectDetail = ({ project: initialProject, onBack }) => {
  const [project, setProject] = useState(initialProject);
  const [tasks, setTasks] = useState(initialProject?.tasks || []);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateTask, setIsCreateTask] = useState(false);

  const fetchProjectDetails = async () => {
    if (!initialProject?._id) return;
    try {
      const res = await getProjectByIdApi(initialProject._id);
      if (res.data.success) {
        setProject(res.data.data);
        setTasks(res.data.data.tasks || []);
      }
    } catch (err) {
      // Mock fallback
      const mockTasks = [
        {
          _id: 't1',
          title: 'Provision EKS Cluster with Terraform',
          description: 'Write Terraform modules for VPC, subnets, NAT Gateways, and EKS node pools with auto-scaling enabled.',
          status: 'In Progress',
          priority: 'High',
          project: initialProject._id,
          assignedTo: { name: 'David Chen', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          tags: ['Terraform', 'AWS', 'EKS'],
        },
        {
          _id: 't2',
          title: 'Dockerize Express API & Multi-stage Build',
          description: 'Optimize Dockerfile using Node 20 Alpine base image, non-root user security, and layer caching.',
          status: 'Completed',
          priority: 'High',
          project: initialProject._id,
          assignedTo: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: ['Docker', 'Backend'],
        },
      ];
      setTasks(mockTasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    getUsersApi()
      .then((res) => res.data.success && setUsers(res.data.data))
      .catch(() => {});
  }, [initialProject]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatusApi(taskId, newStatus);
      setTasks(tasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) {
      setTasks(tasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData._id) {
        await updateTaskApi(taskData._id, taskData);
      } else {
        await createTaskApi({ ...taskData, project: project._id });
      }
      fetchProjectDetails();
    } catch (err) {
      if (taskData._id) {
        setTasks(tasks.map((t) => (t._id === taskData._id ? { ...t, ...taskData } : t)));
      } else {
        const newTask = { ...taskData, _id: 'task_' + Date.now() };
        setTasks([...tasks, newTask]);
      }
    } finally {
      setIsTaskModalOpen(false);
      setSelectedTask(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Back Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </button>

      {/* Project Overview Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                {project.category || 'General'}
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {project.status || 'Active'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedTask(null);
              setIsCreateTask(true);
              setIsTaskModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Team & Details Footer */}
        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Team Roster:</span>
            <div className="flex -space-x-2 overflow-hidden">
              {project.members && project.members.length > 0 ? (
                project.members.map((m, idx) => (
                  <img
                    key={m._id || idx}
                    src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'User')}`}
                    alt={m.name}
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-800 object-cover"
                    title={m.name}
                  />
                ))
              ) : (
                <span className="text-slate-400 italic">No assigned members</span>
              )}
            </div>
          </div>

          {project.dueDate && (
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Target Delivery: {new Date(project.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Project Tasks Kanban Board */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Project Tasks ({tasks.length})
        </h2>
        <KanbanBoard
          tasks={tasks}
          onTaskClick={(task) => {
            setSelectedTask(task);
            setIsCreateTask(false);
            setIsTaskModalOpen(true);
          }}
          onStatusChange={handleStatusChange}
          onOpenCreateTask={() => {
            setSelectedTask(null);
            setIsCreateTask(true);
            setIsTaskModalOpen(true);
          }}
        />
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          task={selectedTask}
          isCreate={isCreateTask}
          projects={[project]}
          users={users}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
