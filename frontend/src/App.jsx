import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import AdminManagement from './pages/AdminManagement';
import TaskModal from './components/TaskModal';
import ProjectModal from './components/ProjectModal';
import { getProjectsApi, getUsersApi, createTaskApi, createProjectApi } from './services/api';

const App = () => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Quick Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectsList, setProjectsList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    if (user) {
      getProjectsApi()
        .then((res) => res.data.success && setProjectsList(res.data.data))
        .catch(() => {});
      getUsersApi()
        .then((res) => res.data.success && setUsersList(res.data.data))
        .catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-indigo-400">Loading ProjectFlow...</span>
        </div>
      </div>
    );
  }

  // Auth Screen
  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    setSelectedProject(null);
    setIsMobileSidebarOpen(false);
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setActiveTab('projectDetail');
  };

  const handleGlobalCreateTask = async (taskData) => {
    try {
      await createTaskApi(taskData);
      // Refresh project list to update stats
      getProjectsApi()
        .then((res) => res.data.success && setProjectsList(res.data.data))
        .catch(() => {});
    } catch (e) {
      // Local error handled in modal
    }
    setIsTaskModalOpen(false);
  };

  const handleGlobalCreateProject = async (projectData) => {
    try {
      await createProjectApi(projectData);
      getProjectsApi()
        .then((res) => res.data.success && setProjectsList(res.data.data))
        .catch(() => {});
    } catch (e) {
      // Local error handled in modal
    }
    setIsProjectModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onOpenCreateTask={() => setIsTaskModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={handleNavigate}
              onOpenCreateTask={() => setIsTaskModalOpen(true)}
              onOpenCreateProject={() => setIsProjectModalOpen(true)}
            />
          )}

          {activeTab === 'projects' && (
            <Projects onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'projectDetail' && selectedProject && (
            <ProjectDetail
              project={selectedProject}
              onBack={() => handleNavigate('projects')}
            />
          )}

          {activeTab === 'tasks' && <Tasks />}

          {activeTab === 'profile' && <Profile />}

          {/* Admin Management — rendered only for Admin role */}
          {activeTab === 'admin' && user?.role === 'Admin' && <AdminManagement />}
        </main>
      </div>

      {/* Global Quick Create Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          task={null}
          isCreate={true}
          projects={projectsList}
          users={usersList}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleGlobalCreateTask}
        />
      )}

      {/* Global Quick Create Project Modal */}
      {isProjectModalOpen && (
        <ProjectModal
          project={null}
          isCreate={true}
          users={usersList}
          onClose={() => setIsProjectModalOpen(false)}
          onSave={handleGlobalCreateProject}
        />
      )}
    </div>
  );
};

export default App;
