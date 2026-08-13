import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  FolderKanban,
  CheckSquare,
  Trash2,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Search,
} from 'lucide-react';
import {
  getAdminUsersApi,
  deleteAdminUserApi,
  getAdminProjectsApi,
  deleteAdminProjectApi,
  getAdminTasksApi,
  deleteAdminTaskApi,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Toast Notification ──────────────────────────────────────
const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const base =
    'fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold backdrop-blur-md transition-all animate-in slide-in-from-bottom-4 duration-300';
  const styles =
    toast.type === 'success'
      ? 'bg-emerald-900/90 border-emerald-600/50 text-emerald-200'
      : 'bg-rose-900/90 border-rose-600/50 text-rose-200';

  return (
    <div className={`${base} ${styles}`}>
      {toast.type === 'success' ? (
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
      )}
      <span>{toast.message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ── Delete Confirmation Modal ────────────────────────────────
const ConfirmModal = ({ isOpen, onConfirm, onCancel, label }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Confirm Deletion</h3>
            <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Are you sure you want to permanently delete{' '}
          <span className="font-bold text-white">{label}</span>?
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-lg shadow-rose-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Role Badge ───────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    Admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    Manager: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Employee: 'bg-slate-500/15 text-slate-400 border-slate-600/30',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[role] || styles.Employee}`}
    >
      {role}
    </span>
  );
};

// ── Status Badge ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    'To Do': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'In Progress': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || ''}`}
    >
      {status}
    </span>
  );
};

// ── Empty State ──────────────────────────────────────────────
const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
      <Icon className="w-7 h-7 text-slate-500" />
    </div>
    <p className="text-sm font-semibold text-slate-400">{message}</p>
  </div>
);

// ── USERS TAB ────────────────────────────────────────────────
const UsersTab = ({ currentUser, onToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null); // { id, name }
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminUsersApi();
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async () => {
    if (!confirm) return;
    setDeletingId(confirm.id);
    setConfirm(null);
    try {
      const res = await deleteAdminUserApi(confirm.id);
      if (res.data.success) {
        onToast('success', res.data.message || 'User deleted successfully');
        fetchUsers();
      }
    } catch (err) {
      onToast('error', err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <ConfirmModal
        isOpen={!!confirm}
        label={confirm?.name}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} message="No users found" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700/60">
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {filtered.map((u) => {
                const isSelf = u._id === currentUser?._id;
                const isProtectedAdmin = u.role === 'Admin';
                const canDelete = !isSelf && !isProtectedAdmin;
                return (
                  <tr key={u._id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-4 py-3 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-[10px] shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span>
                          {u.name}
                          {isSelf && (
                            <span className="ml-1.5 text-[9px] font-bold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.5 rounded-full">YOU</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">{u.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3 text-slate-400">{u.department || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      {canDelete ? (
                        <button
                          id={`delete-user-${u._id}`}
                          onClick={() => setConfirm({ id: u._id, name: u.name })}
                          disabled={deletingId === u._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-all disabled:opacity-50"
                        >
                          {deletingId === u._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Delete
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-medium">
                          {isSelf ? 'Current Admin' : 'Protected'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[10px] text-slate-600 font-medium">
        Showing {filtered.length} of {users.length} users
      </p>
    </>
  );
};

// ── PROJECTS TAB ─────────────────────────────────────────────
const ProjectsTab = ({ onToast }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminProjectsApi();
      if (res.data.success) setProjects(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async () => {
    if (!confirm) return;
    setDeletingId(confirm.id);
    setConfirm(null);
    try {
      const res = await deleteAdminProjectApi(confirm.id);
      if (res.data.success) {
        onToast('success', res.data.message || 'Project deleted successfully');
        fetchProjects();
      }
    } catch (err) {
      onToast('error', err.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.status.toLowerCase().includes(search.toLowerCase()) ||
      (p.createdBy?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = {
    Active: 'text-emerald-400',
    Planning: 'text-blue-400',
    'On Hold': 'text-amber-400',
    Completed: 'text-slate-400',
  };

  return (
    <>
      <ConfirmModal
        isOpen={!!confirm}
        label={confirm?.name}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={fetchProjects}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FolderKanban} message="No projects found" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700/60">
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created By</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Members</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasks</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-200">{p.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{p.category}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{p.createdBy?.name || 'Unknown'}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${statusColor[p.status] || 'text-slate-400'}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{p.members?.length ?? 0}</td>
                  <td className="px-4 py-3 text-slate-400">{p.totalTasks ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden max-w-[60px]">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${p.progress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">{p.progress ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      id={`delete-project-${p._id}`}
                      onClick={() => setConfirm({ id: p._id, name: `"${p.name}" and its ${p.totalTasks} task(s)` })}
                      disabled={deletingId === p._id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-all disabled:opacity-50"
                    >
                      {deletingId === p._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[10px] text-slate-600 font-medium">
        Showing {filtered.length} of {projects.length} projects · Deleting a project also removes all its tasks, comments, and attachments
      </p>
    </>
  );
};

// ── TASKS TAB ────────────────────────────────────────────────
const TasksTab = ({ onToast }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminTasksApi();
      if (res.data.success) setTasks(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDelete = async () => {
    if (!confirm) return;
    setDeletingId(confirm.id);
    setConfirm(null);
    try {
      const res = await deleteAdminTaskApi(confirm.id);
      if (res.data.success) {
        onToast('success', res.data.message || 'Task deleted successfully');
        fetchTasks();
      }
    } catch (err) {
      onToast('error', err.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeletingId(null);
    }
  };

  const priorityColor = {
    High: 'text-rose-400',
    Medium: 'text-amber-400',
    Low: 'text-emerald-400',
  };

  const filtered = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.project?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.assignedTo?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      t.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <ConfirmModal
        isOpen={!!confirm}
        label={confirm?.name}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={fetchTasks}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} message="No tasks found" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700/60">
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Task</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned To</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {filtered.map((t) => (
                <tr key={t._id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-200 max-w-[200px]">
                    <div className="truncate">{t.title}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{t.project?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{t.assignedTo?.name || 'Unassigned'}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${priorityColor[t.priority] || 'text-slate-400'}`}>{t.priority}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      id={`delete-task-${t._id}`}
                      onClick={() => setConfirm({ id: t._id, name: `task "${t.title}"` })}
                      disabled={deletingId === t._id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-all disabled:opacity-50"
                    >
                      {deletingId === t._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[10px] text-slate-600 font-medium">
        Showing {filtered.length} of {tasks.length} tasks · Deleting a task also removes its comments and attachments
      </p>
    </>
  );
};

// ── MAIN ADMIN MANAGEMENT PAGE ───────────────────────────────
const TABS = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
];

const AdminManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast */}
      {toast && <Toast toast={toast} onDismiss={dismissToast} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Admin Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 ml-10.5">
            System-wide control panel — manage all users, projects, and tasks
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[11px] font-bold text-purple-400">Admin Access</span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-400">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-[11px] font-medium leading-relaxed">
          All operations are verified server-side using your Admin JWT. Deletions are permanent and cannot be undone.
          User deletion does <strong>not</strong> delete their projects or tasks.
          Project deletion <strong>does</strong> remove all related tasks, comments, and attachments.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-800/60 dark:bg-slate-900/60 rounded-2xl border border-slate-700/60 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <div className="bg-white/5 dark:bg-slate-900/40 border border-slate-200/10 dark:border-slate-700/60 rounded-2xl p-5">
        {activeTab === 'users' && (
          <UsersTab currentUser={user} onToast={showToast} />
        )}
        {activeTab === 'projects' && (
          <ProjectsTab onToast={showToast} />
        )}
        {activeTab === 'tasks' && (
          <TasksTab onToast={showToast} />
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
