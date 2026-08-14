import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  Plus,
  Search,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  CheckCheck,
  Trash2,
  Menu,
  CheckSquare,
  FolderKanban,
  MessageSquare,
  ArrowRightCircle,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import {
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
} from '../services/api';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'task_assigned':
      return <CheckSquare className="w-4 h-4 text-indigo-500" />;
    case 'task_status_changed':
      return <ArrowRightCircle className="w-4 h-4 text-emerald-500" />;
    case 'task_updated':
      return <Sparkles className="w-4 h-4 text-amber-500" />;
    case 'project_assigned':
    case 'project_updated':
      return <FolderKanban className="w-4 h-4 text-purple-500" />;
    case 'comment_added':
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
    default:
      return <Bell className="w-4 h-4 text-indigo-500" />;
  }
};

const Navbar = ({ onOpenCreateTask, onNavigate, onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all' | 'unread'
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!user) return;
    if (!isSilent) setLoadingNotifications(true);
    try {
      const res = await getNotificationsApi();
      if (res.data.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[Navbar]: Notification fetch failed', err.message);
    } finally {
      if (!isSilent) setLoadingNotifications(false);
    }
  }, [user]);

  // Initial load & Polling interval
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 20000);

    const handleFocus = () => fetchNotifications(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchNotifications]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notification, e) => {
    if (e) e.stopPropagation();
    if (notification.isRead) return;
    try {
      const res = await markNotificationReadApi(notification._id);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(res.data.unreadCount ?? Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error('[Navbar]: Mark notification read failed', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllNotificationsReadApi();
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('[Navbar]: Mark all read failed', err);
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      const res = await deleteNotificationApi(notificationId);
      if (res.data.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        setUnreadCount(res.data.unreadCount ?? unreadCount);
      }
    } catch (err) {
      console.error('[Navbar]: Delete notification failed', err);
    }
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification);
    setShowNotificationDropdown(false);

    if (notification.type === 'project_assigned' || notification.type === 'project_updated') {
      if (onNavigate) onNavigate('projects');
    } else if (onNavigate) {
      onNavigate('tasks');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Manager':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    notificationFilter === 'unread' ? !n.isRead : true
  );

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between transition-colors shadow-sm">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, tasks, or members..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Task Create */}
        <button
          id="navbar-create-task-btn"
          onClick={onOpenCreateTask}
          className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Interactive Notifications Center */}
        <div className="relative" ref={notificationRef}>
          <button
            id="navbar-notification-btn"
            onClick={() => {
              setShowNotificationDropdown(!showNotificationDropdown);
              setShowProfileDropdown(false);
            }}
            className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                id="navbar-notification-badge"
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse shadow-sm"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotificationDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex px-3 pt-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setNotificationFilter('all')}
                  className={`px-3 py-1.5 font-bold border-b-2 transition-colors ${
                    notificationFilter === 'all'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotificationFilter('unread')}
                  className={`px-3 py-1.5 font-bold border-b-2 transition-colors ${
                    notificationFilter === 'unread'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {loadingNotifications ? (
                  <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading notifications...</span>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700 opacity-60" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No notifications</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {notificationFilter === 'unread'
                        ? "You're all caught up! No unread alerts."
                        : 'New updates and assignments will appear here.'}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group relative ${
                        !notification.isRead
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                          : ''
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700/60">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      {/* Delete action button on hover */}
                      <button
                        onClick={(e) => handleDeleteNotification(notification._id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-all absolute top-3 right-3"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            id="navbar-profile-menu-btn"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotificationDropdown(false);
            }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-slate-900 dark:text-white">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
                {user?.email}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate mt-0.5">{user?.name}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeClass(user?.role)}`}>
                    <Shield className="w-3 h-3" />
                    {user?.role || 'Employee'}
                  </span>
                  {user?.department && (
                    <span className="text-[10px] text-slate-400 truncate">· {user.department}</span>
                  )}
                </div>
              </div>

              {/* View Profile Button - Properly navigates to profile view without page reload */}
              <button
                id="navbar-view-profile-btn"
                onClick={() => {
                  setShowProfileDropdown(false);
                  if (onNavigate) {
                    onNavigate('profile');
                  }
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left"
              >
                <UserIcon className="w-4 h-4 text-indigo-500" />
                <span>View Profile & Settings</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              {/* Sign Out Button */}
              <button
                id="navbar-logout-btn"
                onClick={() => {
                  setShowProfileDropdown(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
