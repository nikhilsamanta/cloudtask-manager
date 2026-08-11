import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Send,
  Paperclip,
  Calendar,
  User,
  Tag,
  MessageSquare,
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  getCommentsApi,
  addCommentApi,
  uploadAttachmentApi,
  getAttachmentsByTask,
} from '../services/api';

const TaskModal = ({ task, isCreate, projects = [], users = [], onClose, onSave, onStatusChange }) => {
  const { user } = useAuth();

  // Form State
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'To Do');
  const [priority, setPriority] = useState(task?.priority || 'Medium');
  const [project, setProject] = useState(task?.project?._id || task?.project || projects[0]?._id || '');
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo?._id || task?.assignedTo || users[0]?._id || '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [tagsInput, setTagsInput] = useState(task?.tags ? task.tags.join(', ') : '');

  // Comments & Attachments State
  const [comments, setComments] = useState(task?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState(task?.attachments || []);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (task?._id && !isCreate) {
      // Fetch comments & attachments if available
      getCommentsApi(task._id)
        .then((res) => res.data.success && setComments(res.data.data))
        .catch(() => {});

      getAttachmentsByTask(task._id)
        .then((res) => res.data.success && setAttachments(res.data.data))
        .catch(() => {});
    }
  }, [task, isCreate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      _id: task?._id,
      title,
      description,
      status,
      priority,
      project,
      assignedTo,
      dueDate,
      tags: formattedTags,
    });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !task?._id) return;

    try {
      const res = await addCommentApi(task._id, newComment);
      if (res.data.success) {
        setComments([...comments, res.data.data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('[TaskModal]: Failed to add comment:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !task?._id) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadAttachmentApi(task._id, formData);
      if (res.data.success) {
        setAttachments([res.data.data, ...attachments]);
      }
    } catch (err) {
      console.error('[TaskModal]: Failed to upload attachment:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              {isCreate ? 'Create Task' : 'Task Details'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form / Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Provision AWS EKS Cluster with Terraform"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Add detailed task instructions, technical acceptance criteria, or context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Grid Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                >
                  <option value="To Do">To Do 📋</option>
                  <option value="In Progress">In Progress 🚀</option>
                  <option value="Completed">Completed ✅</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Low">Low 🟢</option>
                  <option value="Medium">Medium 🟡</option>
                  <option value="High">High 🔴</option>
                </select>
              </div>

              {/* Project */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Project
                </label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                >
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Assign To
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                >
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Docker, K8s, API"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
              >
                {isCreate ? 'Create Task' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* If existing task, show Comments and Attachments tabs */}
          {!isCreate && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700/80 space-y-4">
              <div className="flex border-b border-slate-200 dark:border-slate-700 gap-6">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                    activeTab === 'details'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Comments ({comments.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('attachments')}
                  className={`pb-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                    activeTab === 'attachments'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Paperclip className="w-4 h-4" />
                  <span>Attachments ({attachments.length})</span>
                </button>
              </div>

              {/* Comments View */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {/* Comments Feed */}
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {comments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No comments yet. Start the conversation!</p>
                    ) : (
                      comments.map((c, i) => (
                        <div key={c._id || i} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {c.user?.name || 'Team Member'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(c.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* Attachments View (AWS S3 ready) */}
              {activeTab === 'attachments' && (
                <div className="space-y-4">
                  {/* File Upload Dropzone */}
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 transition-colors">
                    <UploadCloud className="w-6 h-6 text-indigo-500 mb-1" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {uploading ? 'Uploading attachment...' : 'Click to upload task files / screenshots'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Stored locally or pushed directly to AWS S3</span>
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>

                  {/* File List */}
                  <div className="space-y-2">
                    {attachments.map((att, i) => (
                      <div key={att._id || i} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-medium truncate">{att.originalName || att.filename}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                          {Math.round((att.fileSize || 1024) / 1024)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
