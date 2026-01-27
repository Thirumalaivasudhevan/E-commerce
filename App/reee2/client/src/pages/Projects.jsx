import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Filter } from 'lucide-react';
import ProjectCard from '../components/projects/ProjectCard'; // Verify path
import Modal from '../components/ui/Modal'; // Verify path

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newProject, setNewProject] = useState({ title: '', description: '', priority: 'medium' });

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setIsModalOpen(false);
      setNewProject({ title: '', description: '', priority: 'medium' });
      fetchProjects(); // Refresh list
    } catch (err) {
      alert("Failed to create");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic Update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus, progress: newStatus === 'done' ? 100 : p.progress } : p));
    
    try {
      await api.put(`/projects/${id}`, { 
        status: newStatus,
        progress: newStatus === 'done' ? 100 : 50 // simplistic logic
      });
    } catch (err) {
      console.error("Failed to update status");
      fetchProjects(); // Revert on error
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Project Dashboard</h2>
          <p className="text-text-muted">Manage your ongoing tasks and deliverables.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter size={18} /> Filter
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-lg shadow-red-500/30 transition-all font-medium"
          >
            <Plus size={18} /> New Project
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onStatusChange={handleStatusChange}
            />
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400">
              No projects found. Create one to get started!
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
            <input 
              required
              className="riho-input" 
              value={newProject.title}
              onChange={e => setNewProject({...newProject, title: e.target.value})}
              placeholder="e.g. Website Redesign"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              className="riho-input min-h-[100px]" 
              value={newProject.description}
              onChange={e => setNewProject({...newProject, description: e.target.value})}
              placeholder="Brief details about the project..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
