import React, { useEffect, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import { Plus, Search, Filter, FolderKanban } from 'lucide-react';
import { getProjectsApi, createProjectApi, updateProjectApi, getUsersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Projects = ({ onSelectProject }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await getProjectsApi();
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('[Projects]: Failed to fetch projects:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    getUsersApi()
      .then((res) => res.data.success && setUsers(res.data.data))
      .catch(() => {});
  }, []);

  const handleSaveProject = async (projectData) => {
    try {
      if (projectData._id) {
        await updateProjectApi(projectData._id, projectData);
      } else {
        await createProjectApi(projectData);
      }
      fetchProjects();
    } catch (err) {
      // Local state update fallback
      if (projectData._id) {
        setProjects(projects.map((p) => (p._id === projectData._id ? { ...p, ...projectData } : p)));
      } else {
        const newProj = {
          ...projectData,
          _id: 'proj_' + Date.now(),
          progress: 0,
        };
        setProjects([newProj, ...projects]);
      }
    } finally {
      setIsModalOpen(false);
      setEditingProject(null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Projects Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage high-level team initiatives, sprint milestones, and architecture deliverables
          </p>
        </div>

        {['Admin', 'Manager'].includes(user?.role) && (
          <button
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter projects by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Cloud Infrastructure">Cloud Infrastructure</option>
            <option value="Web Development">Web Development</option>
            <option value="Monitoring & Logging">Monitoring & Logging</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-16 glass-panel rounded-2xl">
            <FolderKanban className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No projects found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting search query or create a new project.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onClick={onSelectProject}
            />
          ))
        )}
      </div>

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <ProjectModal
          project={editingProject}
          isCreate={!editingProject}
          users={users}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProject}
        />
      )}
    </div>
  );
};

export default Projects;
