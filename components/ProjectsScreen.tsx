
import React, { useState, useEffect } from 'react';
import { Plus, Folder, Edit2, Trash2, FolderOpen, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { Project } from '../types';
import { projectService } from '../services/projectService';
import Button from './Button';
import ProjectModal from './ProjectModal';

interface ProjectsScreenProps {
  onSelectProject: (project: Project) => void;
  onHistoryAction: (action: string, project: Project) => void;
}

const ProjectsScreen: React.FC<ProjectsScreenProps> = ({ onSelectProject, onHistoryAction }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Toast State
  const [showToast, setShowToast] = useState(false);
  
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    setProjects(projectService.getAll());
  };

  const handleCreate = (name: string, image?: string) => {
    const newProject = projectService.create(name, image);
    loadProjects();
    onHistoryAction(`Created project: ${name}`, newProject);
  };

  const handleUpdate = (name: string, image?: string) => {
    if (editingProject) {
        const updated = { 
            ...editingProject, 
            name,
            previewImage: image 
        };
        projectService.update(updated);
        setEditingProject(null);
        loadProjects();
        onHistoryAction(`Updated project: ${name}`, updated);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
        const p = projects.find(p => p.id === deletingId);
        projectService.delete(deletingId);
        setDeletingId(null);
        loadProjects();
        
        // Show Success Toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        
        if (p) {
            onHistoryAction(`Deleted project: ${p.name}`, p);
        }
    }
  };

  const handleRenameClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-8 z-[70] animate-fade-in">
          <div className="bg-white dark:bg-gray-800 border-l-4 border-green-500 shadow-lg rounded-r-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">Success</h4>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Project deleted successfully.</p>
            </div>
            <button onClick={() => setShowToast(false)} className="ml-4 text-gray-400 hover:text-gray-600">
               <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and organize your research.</p>
        </div>
        <Button onClick={() => { setEditingProject(null); setIsModalOpen(true); }}>
          <Plus className="w-5 h-5 mr-2" /> New Project
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
                <div className="flex items-center gap-3 mb-4 text-red-500">
                   <AlertTriangle className="w-6 h-6" />
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Project?</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  This action cannot be undone and all personas and JTBDs inside will be lost.
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancel</Button>
                  <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white shadow-red-500/20">
                    Delete Project
                  </Button>
                </div>
             </div>
        </div>
      )}

      {/* Create/Edit Project Modal */}
      <ProjectModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProject(null); }}
        onSubmit={editingProject ? handleUpdate : handleCreate}
        initialName={editingProject?.name}
        initialImage={editingProject?.previewImage}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        submitLabel={editingProject ? 'Save Changes' : 'Create Project'}
      />

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <Folder className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No projects found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
             Create your first project to start.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col h-56"
            >
              {/* Card Header / Preview Area */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 relative overflow-hidden">
                 {project.previewImage ? (
                    <img 
                        src={project.previewImage} 
                        alt={project.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                 ) : (
                    <div className="w-full h-full flex flex-col justify-center items-center">
                         <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                            <FolderOpen className="w-6 h-6 text-primary-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {project.items.length} Artifacts
                        </span>
                    </div>
                 )}
                 
                 {/* Action Menu (Hover) */}
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                    <button 
                        onClick={(e) => handleRenameClick(e, project)}
                        className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-md shadow-sm hover:text-primary-600 text-gray-500 backdrop-blur-sm"
                        title="Edit Project"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={(e) => handleDeleteClick(e, project.id)}
                        className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-md shadow-sm hover:text-red-500 text-gray-500 backdrop-blur-sm"
                        title="Delete Project"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 relative z-20 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-start">
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate" title={project.name}>
                            {project.name}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Edited {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                    {project.previewImage && (
                        <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-1 rounded-md">
                            {project.items.length} Artifacts
                        </span>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsScreen;
