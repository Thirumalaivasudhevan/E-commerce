import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { Plus, Filter } from 'lucide-react';
import ProjectCard from '../../../components/projects/ProjectCard';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', status: 'doing', dueDate: '' });

  const { addToast } = useToast();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, formData);
        addToast('Project updated successfully', 'success');
      } else {
        await api.post('/projects', formData);
        addToast('Project created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingProject(null);
      setFormData({ title: '', description: '', priority: 'medium', status: 'doing', dueDate: '' });
      fetchProjects();
    } catch (err) {
      addToast(editingProject ? 'Failed to update project' : 'Failed to create project', 'error');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      priority: project.priority || 'medium',
      status: project.status || 'doing',
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.title}"?`)) return;
    try {
      await api.delete(`/projects/${project.id}`);
      fetchProjects();
      addToast('Project deleted', 'success');
    } catch (err) {
      addToast('Failed to delete project', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic Update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus, progress: newStatus === 'done' ? 100 : p.progress } : p));

    try {
      await api.put(`/projects/${id}`, {
        status: newStatus,
        progress: newStatus === 'done' ? 100 : 50
      });
    } catch (err) {
      console.error("Failed to update status");
      fetchProjects(); // Revert on error
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({ title: '', description: '', priority: 'medium', status: 'doing', dueDate: '' });
    setIsModalOpen(true);
  };

  const filteredProjects = projects.filter(p => filter === 'all' || p.status === filter);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Project Dashboard</h2>
          <p className="text-text-muted">Manage your ongoing tasks and deliverables.</p>
        </div>
        <div className="flex gap-3 relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text-muted hover:text-text-main hover:border-text-muted transition-colors"
          >
            <Filter size={18} /> {filter === 'all' ? 'Filter' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>

          {showFilterMenu && (
            <div className="absolute top-12 left-0 w-32 bg-surface border border-border rounded-lg shadow-xl z-20 py-1 overflow-hidden">
              <button onClick={() => { setFilter('all'); setShowFilterMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-surface-highlight text-text-main text-sm transition-colors">All</button>
              <button onClick={() => { setFilter('doing'); setShowFilterMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-surface-highlight text-text-main text-sm transition-colors">Doing</button>
              <button onClick={() => { setFilter('done'); setShowFilterMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-surface-highlight text-text-main text-sm transition-colors">Done</button>
            </div>
          )}

          <button
            onClick={openCreateModal}
            className="nexus-btn nexus-btn-primary shadow-lg shadow-primary/20"
          >
            <Plus size={18} /> New Project
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-surface-highlight rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onStatusChange={handleStatusChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-20 text-center text-text-muted">
              No projects found. Create one to get started!
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Edit Project" : "Create New Project"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Project Title</label>
            <input
              required
              className="nexus-input"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Website Redesign"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Description</label>
            <textarea
              className="nexus-input min-h-[100px]"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief details about the project..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Status</label>
              <select
                className="nexus-input"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="doing">Doing</option>
                <option value="pending">Pending</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Due Date</label>
              <input
                type="date"
                className="nexus-input"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
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
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
