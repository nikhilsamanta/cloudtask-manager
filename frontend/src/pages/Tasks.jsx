import React, { useEffect, useState } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import {
  Plus,
  Search,
  Filter,
  Kanban,
  List,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  getTasksApi,
  getProjectsApi,
  getUsersApi,
  createTaskApi,
  updateTaskApi,
  updateTaskStatusApi,
} from '../services/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Filters
  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreate, setIsCreate] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await getTasksApi();
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      // Mock Fallback
      setTasks([
        {
          _id: 't1',
          title: 'Provision EKS Cluster with Terraform',
          description: 'Write Terraform modules for VPC, subnets, NAT Gateways, and EKS node pools with auto-scaling enabled.',
          status: 'In Progress',
          priority: 'High',
          project: { _id: 'p1', name: 'Kubernetes Cluster Migration' },
          assignedTo: { _id: 'u4', name: 'David Chen', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          tags: ['Terraform', 'AWS', 'EKS'],
        },
        {
          _id: 't2',
          title: 'Dockerize Express API & Multi-stage Build',
          description: 'Optimize Dockerfile using Node 20 Alpine base image, non-root user security, and layer caching.',
          status: 'Completed',
          priority: 'High',
          project: { _id: 'p1', name: 'Kubernetes Cluster Migration' },
          assignedTo: { _id: 'u1', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: ['Docker', 'Backend'],
        },
        {
          _id: 't3',
          title: 'Implement Interactive Kanban Board',
          description: 'Build responsive 3-column drag-and-drop board for To Do, In Progress, and Completed task states.',
          status: 'In Progress',
          priority: 'High',
          project: { _id: 'p2', name: 'CloudTask Pro V2 Frontend' },
          assignedTo: { _id: 'u3', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          tags: ['React', 'Kanban', 'UI'],
        },
        {
          _id: 't4',
          title: 'Setup JWT Auth & Role Authorization',
          description: 'Secure Express API endpoints using JWT Bearer token headers and role middleware checks.',
          status: 'Completed',
          priority: 'High',
          project: { _id: 'p2', name: 'CloudTask Pro V2 Frontend' },
          assignedTo: { _id: 'u3', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['Security', 'JWT', 'API'],
        },
        {
          _id: 't5',
          title: 'Configure Grafana Dashboards for API Latency',
          description: 'Design dashboards rendering P95/P99 request latency, HTTP status codes, and CPU/Memory usage metrics.',
          status: 'To Do',
          priority: 'Medium',
          project: { _id: 'p3', name: 'Prometheus & Grafana Observability' },
          assignedTo: { _id: 'u4', name: 'David Chen', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
          dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          tags: ['Grafana', 'DevOps'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    getProjectsApi()
      .then((res) => res.data.success && setProjects(res.data.data))
      .catch(() => {});
    getUsersApi()
      .then((res) => res.data.success && setUsers(res.data.data))
      .catch(() => {});
  }, []);

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
        await createTaskApi(taskData);
      }
      fetchTasks();
    } catch (err) {
      if (taskData._id) {
        setTasks(tasks.map((t) => (t._id === taskData._id ? { ...t, ...taskData } : t)));
      } else {
        const newTask = { ...taskData, _id: 't_' + Date.now() };
        setTasks([newTask, ...tasks]);
      }
    } finally {
      setIsModalOpen(false);
      setSelectedTask(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    const matchesProject = selectedProject === 'All' || (t.project?._id || t.project) === selectedProject;
    return matchesSearch && matchesPriority && matchesProject;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Task Management Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track, filter, and assign deliverables across all project pipelines
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedTask(null);
              setIsCreate(true);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="High">High 🔴</option>
            <option value="Medium">Medium 🟡</option>
            <option value="Low">Low 🟢</option>
          </select>
        </div>
      </div>

      {/* Content View */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          onTaskClick={(task) => {
            setSelectedTask(task);
            setIsCreate(false);
            setIsModalOpen(true);
          }}
          onStatusChange={handleStatusChange}
          onOpenCreateTask={() => {
            setSelectedTask(null);
            setIsCreate(true);
            setIsModalOpen(true);
          }}
        />
      ) : (
        /* List View Table */
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-900/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredTasks.map((t) => (
                <tr
                  key={t._id}
                  onClick={() => {
                    setSelectedTask(t);
                    setIsCreate(false);
                    setIsModalOpen(true);
                  }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {t.title}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-rose-500">{t.priority}</span>
                  </td>
                  <td className="py-3.5 px-4">{t.assignedTo?.name || 'Unassigned'}</td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          task={selectedTask}
          isCreate={isCreate}
          projects={projects}
          users={users}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};

export default Tasks;
