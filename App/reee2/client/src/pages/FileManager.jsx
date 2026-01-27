import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Folder, File, ChevronRight, Upload, Plus, MoreVertical, 
  Download, Trash2, LayoutGrid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileManager() {
  const [items, setItems] = useState([]);
  const [path, setPath] = useState([{ id: null, name: 'Root' }]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, [currentFolderId]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/files${currentFolderId ? `?parentId=${currentFolderId}` : ''}`);
      setItems(response.data);
    } catch (err) {
      console.error("Failed to fetch files", err);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (folder) => {
    if (folder.id === null) {
      setPath([{ id: null, name: 'Root' }]);
      setCurrentFolderId(null);
    } else {
      const index = path.findIndex(p => p.id === folder.id);
      if (index !== -1) {
        setPath(path.slice(0, index + 1));
      } else {
        setPath([...path, folder]);
      }
      setCurrentFolderId(folder.id);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt("Folder Name:");
    if (!name) return;
    try {
      await api.post('/files', { name, type: 'FOLDER', parentId: currentFolderId });
      fetchFiles();
    } catch (err) {
      alert("Failed to create folder");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 whitespace-nowrap no-scrollbar">
          {path.map((p, i) => (
            <div key={p.id || 'root'} className="flex items-center gap-2">
              {i > 0 && <ChevronRight size={16} className="text-gray-400" />}
              <button 
                onClick={() => navigateTo(p)}
                className={`text-sm font-medium hover:text-primary transition-colors ${i === path.length - 1 ? 'text-text-main' : 'text-text-muted'}`}
              >
                {p.name}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCreateFolder}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <Plus size={18} /> New Folder
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all text-sm font-medium">
            <Upload size={18} /> Upload
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="riho-card animate-pulse h-32 flex flex-col items-center justify-center gap-2">
               <div className="w-12 h-12 bg-gray-100 rounded-lg" />
               <div className="w-16 h-2 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item.id}
                onDoubleClick={() => item.type === 'FOLDER' && navigateTo(item)}
                className="riho-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center text-center p-4"
              >
                <div className="relative mb-3">
                  {item.type === 'FOLDER' ? (
                    <Folder size={48} className="text-amber-400 fill-amber-400/20" />
                  ) : (
                    <File size={48} className="text-blue-400 fill-blue-400/10" />
                  )}
                </div>
                <div className="text-xs font-semibold text-text-main truncate w-full mb-1">
                  {item.name}
                </div>
                <div className="text-[10px] text-text-muted">
                  {item.type === 'FOLDER' ? 'Folder' : `${(item.size / 1024).toFixed(1)} KB`}
                </div>

                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-1 hover:bg-gray-100 rounded shadow-sm bg-white">
                      <MoreVertical size={14} className="text-gray-500" />
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="col-span-full py-20 text-center">
               <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4">
                  <Folder size={48} className="text-gray-300" />
               </div>
               <h3 className="text-lg font-bold text-text-main">This folder is empty</h3>
               <p className="text-text-muted text-sm mt-1">Upload files or create folders to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
