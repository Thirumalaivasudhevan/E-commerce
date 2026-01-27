import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import {
  Search, Plus, Upload, MoreVertical,
  Home, Folder, Clock, Star, Trash2, HardDrive,
  Video, Music, FileText, Download, Briefcase, File, Image, Edit, AlertCircle
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import clsx from 'clsx';

const SidebarLink = ({ icon: Icon, label, active, count, onClick }) => (
  <div
    onClick={onClick}
    className={clsx(
      "flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1",
      active ? "bg-primary/10 text-primary font-bold" : "text-text-muted hover:bg-surface-highlight hover:text-text-main"
    )}>
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span className="text-sm">{label}</span>
    </div>
    {count && <span className="text-xs bg-surface px-2 py-0.5 rounded-full text-text-muted font-bold">{count}</span>}
  </div >
);

const QuickAccessItem = ({ icon: Icon, label, color, onClick }) => (
  <div onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-surface hover:bg-surface-highlight rounded-2xl cursor-pointer transition-colors group">
    <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110", color)}>
      <Icon size={24} className="text-white" />
    </div>
    <span className="text-xs font-bold text-text-muted group-hover:text-text-main transition-colors">{label}</span>
  </div>
);

const ActionMenu = ({ onRename, onDelete, onRestore, onToggleStar, isDeleted, isStarred }) => (
  <div className="absolute right-2 top-8 bg-surface border border-border rounded-lg shadow-xl z-20 w-40 overflow-hidden animate-in fade-in zoom-in-95">
    {!isDeleted && (
      <>
        <button onClick={(e) => { e.stopPropagation(); onRename(); }} className="w-full text-left px-4 py-2 text-xs font-medium text-text-main hover:bg-surface-highlight flex items-center gap-2">
          <Edit size={12} /> Rename
        </button>
        <button onClick={(e) => { e.stopPropagation(); onToggleStar(); }} className="w-full text-left px-4 py-2 text-xs font-medium text-text-main hover:bg-surface-highlight flex items-center gap-2">
          <Star size={12} fill={isStarred ? "currentColor" : "none"} className={isStarred ? "text-yellow-500" : ""} /> {isStarred ? "Unstar" : "Star"}
        </button>
      </>
    )}

    {isDeleted ? (
      <>
        <button onClick={(e) => { e.stopPropagation(); onRestore(); }} className="w-full text-left px-4 py-2 text-xs font-medium text-green-500 hover:bg-green-500/10 flex items-center gap-2">
          <Upload size={12} className="rotate-180" /> Restore
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 flex items-center gap-2">
          <Trash2 size={12} /> Delete Forever
        </button>
      </>
    ) : (
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 flex items-center gap-2">
        <Trash2 size={12} /> Delete
      </button>
    )}
  </div>
);

const FolderItem = ({ item, onClick, onRename, onDelete, onRestore, onToggleStar }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div onClick={onClick} className="bg-surface-highlight p-4 rounded-xl border border-border flex items-center gap-4 hover:border-gray-600 transition-colors cursor-pointer relative group">
      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-yellow-500 relative">
        <Folder size={24} fill="currentColor" fillOpacity={0.2} />
        {item.isStarred && <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full border border-surface-highlight transform translate-x-1/3 -translate-y-1/3"></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-text-main text-sm truncate pr-2">{item.name}</h4>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
          >
            <MoreVertical size={14} className="text-text-muted" />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted font-medium whitespace-nowrap overflow-hidden">
          <span>{item.type}</span>
          <span className="flex items-center gap-1 truncate"><Clock size={10} /> {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
          <ActionMenu
            isDeleted={item.isDeleted}
            isStarred={item.isStarred}
            onRename={() => { setShowMenu(false); onRename(); }}
            onDelete={() => { setShowMenu(false); onDelete(); }}
            onRestore={() => { setShowMenu(false); onRestore(); }}
            onToggleStar={() => { setShowMenu(false); onToggleStar(); }}
          />
        </>
      )}
    </div>
  );
};

const FileItem = ({ item, icon: Icon, color, onRename, onDelete, onRestore, onToggleStar }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-surface-highlight p-4 rounded-xl border border-border flex items-center gap-4 hover:border-gray-600 transition-colors cursor-pointer group relative">
      <div className={clsx("w-12 h-12 rounded-lg flex items-center justify-center relative", color)}>
        <Icon size={24} />
        {item.isStarred && <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full border border-surface-highlight transform translate-x-1/3 -translate-y-1/3"></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-text-main text-sm truncate group-hover:text-primary transition-colors pr-2">{item.name}</h4>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
          >
            <MoreVertical size={14} className="text-text-muted" />
          </button>
        </div>
        <div className="text-[10px] text-text-muted font-medium mt-0.5">{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}, {item.size || '0 KB'}</div>
      </div>
      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
          <ActionMenu
            isDeleted={item.isDeleted}
            isStarred={item.isStarred}
            onRename={() => { setShowMenu(false); onRename(); }}
            onDelete={() => { setShowMenu(false); onDelete(); }}
            onRestore={() => { setShowMenu(false); onRestore(); }}
            onToggleStar={() => { setShowMenu(false); onToggleStar(); }}
          />
        </>
      )}
    </div>
  );
};

import { useToast } from '../../../components/ui/Toast';

export default function FileManager() {
  const [activeTab, setActiveTab] = useState('Home');
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null); // null = root
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Home' }]);
  const [loading, setLoading] = useState(true); // Changed initial state to true
  const { addToast } = useToast();

  // Fetch files
  const fetchFiles = async () => {
    setLoading(true);
    try {
      // Map 'Home' to empty filter filter
      let filterParam = undefined;
      if (activeTab === 'Recent') filterParam = 'recent';
      if (activeTab === 'Starred') filterParam = 'starred';
      if (activeTab === 'Deleted') filterParam = 'deleted';
      // Quick Access mappings
      if (activeTab === 'Videos') filterParam = 'video';
      if (activeTab === 'Apps') filterParam = 'app';
      if (activeTab === 'Documents') filterParam = 'doc';
      if (activeTab === 'Music') filterParam = 'audio';
      if (activeTab === 'Downloads') filterParam = 'archive';
      if (activeTab === 'Folders') filterParam = 'folder';

      const res = await api.get('/files', {
        params: {
          parentId: filterParam ? undefined : currentFolder,
          filter: filterParam
        }
      });
      setFiles(res.data);
    } catch (err) {
      console.error("Failed to fetch files", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentFolder, activeTab]);

  const handleFolderClick = (folderId, folderName) => {
    setCurrentFolder(folderId);
    setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }]);
  };

  const handleBreadcrumbClick = (folderId, index) => {
    setCurrentFolder(folderId);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'rename'
  const [inputValue, setInputValue] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const fileInputRef = React.useRef(null); // Will fix React import below if needed, or assume global React/import

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('File too large (Max 5MB)', 'error');
      return;
    }

    try {
      // Create metadata entry
      await api.post('/files', {
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'doc',
        parentId: currentFolder,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });
      fetchFiles();
      addToast('File uploaded successfully', 'success');
    } catch (err) {
      addToast('Upload failed', 'error');
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setInputValue('');
    setIsModalOpen(true);
  };

  const openRenameModal = (item) => {
    setModalMode('rename');
    setInputValue(item.name);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (activeTab === 'Deleted') {
      if (!window.confirm(`Permanently delete ${item.name}? This cannot be undone.`)) return;
    }
    // Soft delete logic handled by backend unless hardDelete param is passed
    try {
      const url = activeTab === 'Deleted' ? `/files/${item.id}?hardDelete=true` : `/files/${item.id}`;
      await api.delete(url);
      fetchFiles();
      addToast(activeTab === 'Deleted' ? 'Permanently deleted' : 'Moved to trash', 'success');
    } catch (err) {
      addToast('Failed to delete', 'error');
    }
  };

  const handleRestore = async (item) => {
    try {
      await api.put(`/files/${item.id}/restore`);
      fetchFiles();
      addToast('Item restored', 'success');
    } catch {
      addToast('Failed to restore', 'error');
    }
  };

  const handleToggleStar = async (item) => {
    try {
      await api.put(`/files/${item.id}/star`);
      fetchFiles();
      // addToast('Updated', 'success');
    } catch {
      addToast('Failed to update star', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      if (modalMode === 'create') {
        await api.post('/files', {
          name: inputValue,
          type: 'folder',
          parentId: currentFolder
        });
        addToast('Folder created', 'success');
      } else {
        await api.put(`/files/${selectedItem.id}`, {
          name: inputValue
        });
        addToast('Item renamed', 'success');
      }
      setIsModalOpen(false);
      fetchFiles();
    } catch (err) {
      addToast('Operation failed', 'error');
    }
  };

  // Filter into folders and files
  const folders = files.filter(f => f.type === 'folder');
  const fileItems = files.filter(f => f.type !== 'folder');

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">

      {/* Left Sidebar */}
      <div className="w-full lg:w-72 nexus-card p-6 flex flex-col h-full overflow-y-auto shrink-0 bg-transparent glass-panel border border-border">
        <button
          onClick={() => { setCurrentFolder(null); setBreadcrumbs([{ id: null, name: 'Home' }]); }}
          className="w-full bg-surface-highlight text-white py-3 rounded-xl font-bold mb-6 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
        >
          <Home size={18} /> Home
        </button>

        <div className="space-y-1 mb-8">
          <SidebarLink icon={Briefcase} label="All Files" active={activeTab === 'Home'} count={files.length} onClick={() => { setActiveTab('Home'); setCurrentFolder(null); }} />
          <SidebarLink icon={Clock} label="Recent" active={activeTab === 'Recent'} onClick={() => { setActiveTab('Recent'); setCurrentFolder(null); }} />
          <SidebarLink icon={Star} label="Starred" active={activeTab === 'Starred'} onClick={() => { setActiveTab('Starred'); setCurrentFolder(null); }} />
          <SidebarLink icon={Trash2} label="Deleted" active={activeTab === 'Deleted'} onClick={() => { setActiveTab('Deleted'); setCurrentFolder(null); }} />
          <SidebarLink icon={HardDrive} label="Storage" />
        </div>

        <div className="mt-auto pt-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4 text-text-main font-bold">
            <HardDrive size={18} /> Storage
          </div>
          <div className="h-2 w-full bg-surface rounded-full overflow-hidden mb-2">
            <div className="h-full bg-primary w-[25%] rounded-full" />
          </div>
          <div className="text-xs text-text-muted font-medium mb-6">25 GB of 100 GB used</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 nexus-card p-6 flex flex-col h-full overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Breadcrumbs */}
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.id || 'root'} className="flex items-center gap-2 text-sm">
                {idx > 0 && <span className="text-text-muted">/</span>}
                <span
                  onClick={() => handleBreadcrumbClick(crumb.id, idx)}
                  className={clsx(
                    "cursor-pointer hover:text-white transition-colors",
                    idx === breadcrumbs.length - 1 ? "font-bold text-white" : "text-text-muted"
                  )}
                >
                  {crumb.name}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/20"
            >
              <Plus size={18} /> New Folder
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 px-6 py-2.5 border border-border text-text-muted rounded-lg font-bold text-sm hover:border-gray-500 hover:text-white transition-colors"
            >
              <Upload size={18} /> Upload File
            </button>
          </div>
        </div>

        <div className="overflow-y-auto pr-2 space-y-8 flex-1">
          {loading && <div className="text-center text-text-muted">Loading files...</div>}

          {!loading && (
            <>
              {/* Quick Access (Static for now) */}
              <div>
                <h3 className="text-lg font-bold text-text-main mb-4">Quick Access</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <QuickAccessItem icon={Video} label="Videos" color="bg-red-500" onClick={() => { setActiveTab('Videos'); setCurrentFolder(null); }} />
                  <QuickAccessItem icon={Briefcase} label="Apps" color="bg-primary" onClick={() => { setActiveTab('Apps'); setCurrentFolder(null); }} />
                  <QuickAccessItem icon={FileText} label="Documents" color="bg-green-500" onClick={() => { setActiveTab('Documents'); setCurrentFolder(null); }} />
                  <QuickAccessItem icon={Music} label="Music" color="bg-yellow-500" onClick={() => { setActiveTab('Music'); setCurrentFolder(null); }} />
                  <QuickAccessItem icon={Download} label="Downloads" color="bg-purple-500" onClick={() => { setActiveTab('Downloads'); setCurrentFolder(null); }} />
                  <QuickAccessItem icon={Folder} label="Folders" color="bg-blue-500" onClick={() => { setActiveTab('Folders'); setCurrentFolder(null); }} />
                </div>
              </div>

              {/* Folders */}
              {folders.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-text-main mb-4">Folders</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {folders.map(folder => (
                      <FolderItem
                        key={folder.id}
                        item={folder}
                        onClick={() => handleFolderClick(folder.id, folder.name)}
                        onRename={() => openRenameModal(folder)}
                        onDelete={() => handleDelete(folder)}
                        onRestore={() => handleRestore(folder)}
                        onToggleStar={() => handleToggleStar(folder)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {fileItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-text-main mb-4">Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {fileItems.map(file => (
                      <FileItem
                        key={file.id}
                        item={file}
                        icon={file.type === 'image' ? Image : FileText}
                        color={file.type === 'image' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"}
                        onRename={() => openRenameModal(file)}
                        onDelete={() => handleDelete(file)}
                        onRestore={() => handleRestore(file)}
                        onToggleStar={() => handleToggleStar(file)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {folders.length === 0 && fileItems.length === 0 && (
                <div className="text-center py-20 bg-surface-highlight rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                    <Folder size={32} className="text-text-muted opacity-50" />
                  </div>
                  <h3 className="text-lg font-bold text-text-main">No items found</h3>
                  <p className="text-sm text-text-muted mt-1 max-w-xs mx-auto">
                    {activeTab === 'Home'
                      ? "This folder is empty. Start by adding new files."
                      : `No ${activeTab.toLowerCase()} found in your library.`}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? "Create New Folder" : "Rename Item"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Name</label>
            <input
              className="nexus-input"
              autoFocus
              placeholder={modalMode === 'create' ? "e.g. My Documents" : "Enter new name"}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-text-muted hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="btn btn-primary px-6">
              {modalMode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
