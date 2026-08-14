import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMeApi, changePasswordApi } from '../services/api';
import {
  User,
  Mail,
  Shield,
  Briefcase,
  Key,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Lock,
} from 'lucide-react';

const Profile = () => {
  const { user: authUser, updateProfile } = useAuth();

  const [userData, setUserData] = useState(authUser || {});
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState(authUser?.name || '');
  const [email, setEmail] = useState(authUser?.email || '');
  const [department, setDepartment] = useState(authUser?.department || 'Engineering');
  const [avatar, setAvatar] = useState(authUser?.avatar || '');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status Alerts
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Fetch fresh profile from MongoDB on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getMeApi()
      .then((res) => {
        if (isMounted && res.data.success) {
          const freshData = res.data.data;
          setUserData(freshData);
          setName(freshData.name || '');
          setEmail(freshData.email || '');
          setDepartment(freshData.department || 'Engineering');
          setAvatar(freshData.avatar || '');
        }
      })
      .catch((err) => {
        console.warn('[Profile]: Failed to fetch fresh profile data', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const success = await updateProfile({ name, email, department, avatar });
      if (success) {
        setProfileMsg({ type: 'success', text: 'Profile information updated successfully!' });
        setUserData((prev) => ({ ...prev, name, email, department, avatar }));
      } else {
        setProfileMsg({ type: 'error', text: 'Failed to update profile. Please check your data.' });
      }
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Error updating profile',
      });
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 4000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });

    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await changePasswordApi({ currentPassword, newPassword });
      if (res.data.success) {
        setPassMsg({ type: 'success', text: 'Security password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPassMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password. Verify your current password.',
      });
    } finally {
      setIsChangingPass(false);
      setTimeout(() => setPassMsg({ type: '', text: '' }), 4000);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Manager':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
  };

  const avatarUrl =
    avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366f1&color=fff&bold=true`;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          User Profile & Security
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal identity, organization department, and account security credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Identity Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center shadow-sm">
            <div className="relative mb-4">
              <img
                src={avatarUrl}
                alt={name}
                className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500/20 shadow-xl"
              />
              <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-md border-2 border-white dark:border-slate-900">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <h2 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
              {userData.name || name}
            </h2>
            <p className="text-xs text-slate-400 font-medium">{userData.email || email}</p>

            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full border ${getRoleBadge(
                  userData.role
                )}`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{userData.role || 'Employee'}</span>
              </span>
            </div>

            {/* Quick Meta Stats */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 w-full space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Department</span>
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {userData.department || department}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Member Since</span>
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {userData.createdAt
                    ? new Date(userData.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                <span>Personal Information</span>
              </h3>
            </div>

            {profileMsg.text && (
              <div
                className={`p-3 text-xs font-semibold rounded-xl flex items-center gap-2 border animate-in fade-in duration-150 ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}
              >
                {profileMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    id="profile-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    id="profile-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Department / Squad
                  </label>
                  <input
                    type="text"
                    id="profile-dept-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Engineering, DevOps, Product, Design"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Custom Avatar Image URL
                  </label>
                  <input
                    type="text"
                    id="profile-avatar-input"
                    placeholder="https://images.unsplash.com/..."
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  id="profile-save-btn"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-rose-500" />
                <span>Change Security Password</span>
              </h3>
            </div>

            {passMsg.text && (
              <div
                className={`p-3 text-xs font-semibold rounded-xl flex items-center gap-2 border animate-in fade-in duration-150 ${
                  passMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}
              >
                {passMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  id="profile-current-pass"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    id="profile-new-pass"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    id="profile-confirm-pass"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  id="profile-update-pass-btn"
                  disabled={isChangingPass}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
