import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization Bearer header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cloudtask_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth API Methods
export const loginApi = (credentials) => API.post('/auth/login', credentials);
export const registerApi = (userData) => API.post('/auth/register', userData);
export const getMeApi = () => API.get('/auth/me');
export const updateProfileApi = (data) => API.put('/auth/profile', data);
export const changePasswordApi = (data) => API.put('/auth/change-password', data);
export const getUsersApi = () => API.get('/auth/users');

// Projects API Methods
export const getProjectsApi = () => API.get('/projects');
export const getProjectByIdApi = (id) => API.get(`/projects/${id}`);
export const createProjectApi = (data) => API.post('/projects', data);
export const updateProjectApi = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProjectApi = (id) => API.delete(`/projects/${id}`);
// Returns only the members of a specific project (used by task assignee dropdown)
export const getProjectMembersApi = (projectId) => API.get(`/projects/${projectId}/members`);

// Tasks API Methods
export const getTasksApi = (params) => API.get('/tasks', { params });
export const getTaskByIdApi = (id) => API.get(`/tasks/${id}`);
export const createTaskApi = (data) => API.post('/tasks', data);
export const updateTaskApi = (id, data) => API.put(`/tasks/${id}`, data);
export const updateTaskStatusApi = (id, status) => API.patch(`/tasks/${id}/status`, { status });
export const deleteTaskApi = (id) => API.delete(`/tasks/${id}`);

// Comments API Methods
export const getCommentsApi = (taskId) => API.get(`/tasks/${taskId}/comments`);
export const addCommentApi = (taskId, content) => API.post(`/tasks/${taskId}/comments`, { content });

// Attachments API Methods
export const uploadAttachmentApi = (taskId, formData) =>
  API.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  export const getAttachmentsByTask = (taskId) =>
  API.get(`/tasks/${taskId}/attachments`);

// Dashboard API Methods
export const getDashboardStatsApi = () => API.get('/dashboard/stats');

// Admin API Methods (Admin role required — backend enforces 403 for non-Admin)
export const getAdminUsersApi = () => API.get('/admin/users');
export const deleteAdminUserApi = (id) => API.delete(`/admin/users/${id}`);

export const getAdminProjectsApi = () => API.get('/admin/projects');
export const deleteAdminProjectApi = (id) => API.delete(`/admin/projects/${id}`);

export const getAdminTasksApi = () => API.get('/admin/tasks');
export const deleteAdminTaskApi = (id) => API.delete(`/admin/tasks/${id}`);

export default API;
