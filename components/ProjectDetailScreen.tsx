
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, FileText, Target, Layers, Eye, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { Project, ProjectItem, GeneratorType } from '../types';
import { projectService } from '../services/projectService';
import { downloadAsPng } from '../services/exportService';
import Button from './Button';
import GenerationTypeModal from './GenerationTypeModal';
import Toast from './Toast';

interface ProjectDetailScreenProps {
  project: Project;
  onBack: () => void;
  onNewItem: (type?: GeneratorType) => void;
  onEditItem: (item: ProjectItem) => void;
  onUpdateProject: (p: Project) => void;
}

const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({ 
  project, 
  onBack, 
  onNewItem, 
  onEditItem,
  onUpdateProject
}) => {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setDeletingItemId(itemId);
  };

  const confirmDelete = () => {
    if (deletingItemId) {
      const updated = projectService.deleteItem(project.id, deletingItemId);
      if (updated) {
        onUpdateProject(updated);
        setDeletingItemId(null);
        setShowToast(true);
      }
    }
  };

  const handleDownloadPng = (e: React.MouseEvent, item: ProjectItem) => {
    e.stopPropagation();
    downloadAsPng(item.data, item.inputContext.context, `${item.name.replace(/\s+/g, '-')}-Report`);
  };

  const renderEmptyState = () => (
    <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4">
        <Layers className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No artifacts found</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm">
        Create your first artifact to start building your research.
      </p>
    </div>
  );

  const renderListItem = (item: ProjectItem) => {
    // Determine badge content
    let badge = null;
    if (item.type === 'persona') {
        badge = (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                Design Persona
            </span>
        );
    } else if (item.type === 'jtbd') {
        badge = (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                JTBD
            </span>
        );
    } else if (item.type === 'both') {
        badge = (
            <div className="flex gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                    Design Persona
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    <Target className="w-3 h-3 mr-1" /> JTBD Included
                </span>
            </div>
        );
    }

    // Determine Description
    let description = '';
    if (item.type === 'persona' || item.type === 'both') {
        description = item.data.persona?.role || 'No role defined';
    } else {
        // For JTBD, show simplified count or context
        description = `${item.data.jtbd?.length || 0} Job Statements`;
    }

    return (
      <div key={item.id} className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all shadow-sm hover:shadow-md cursor-pointer gap-4"
          onClick={() => onEditItem(item)}
      >
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 mt-1 ${
            item.type === 'persona' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' :
            item.type === 'jtbd' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
            'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
          }`}>
            {item.type === 'persona' && <FileText className="w-6 h-6" />}
            {item.type === 'jtbd' && <Target className="w-6 h-6" />}
            {item.type === 'both' && <Layers className="w-6 h-6" />}
          </div>
          
          <div className="flex flex-col gap-1 min-w-0">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">{item.name}</h4>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                {description} <span className="mx-1 opacity-50">•</span> <span className="opacity-75">{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-1">
                {badge}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center pl-4 border-l border-gray-100 dark:border-gray-700 md:border-0 md:pl-0">
            <button 
                onClick={(e) => { e.stopPropagation(); onEditItem(item); }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
                <Eye className="w-4 h-4" /> <span className="hidden sm:inline">View</span>
            </button>
            
            <button 
                onClick={(e) => handleDownloadPng(e, item)} 
                className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Download as PNG"
            >
                <ImageIcon className="w-4 h-4" />
            </button>

            <button 
                onClick={(e) => handleDeleteClick(e, item.id)} 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Remove"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in flex flex-col h-full min-h-[calc(100vh-8rem)] relative">
      
      {/* Toast Notification */}
      <Toast 
        message="Artifact deleted successfully" 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />

      {/* Generation Selection Modal */}
      <GenerationTypeModal 
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSelect={(type) => {
            setIsGenerateModalOpen(false);
            onNewItem(type);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deletingItemId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
                <div className="flex items-center gap-3 mb-4 text-red-500">
                   <AlertTriangle className="w-6 h-6" />
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Artifact?</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this artifact?
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setDeletingItemId(null)}>Cancel</Button>
                  <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white shadow-red-500/20">
                    Delete Artifact
                  </Button>
                </div>
             </div>
        </div>
      )}

      {/* Project Workspace Header */}
      <div className="flex flex-col gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
           <button onClick={onBack} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" /> Projects
           </button>
           <span className="text-gray-300 dark:text-gray-600">/</span>
           <span className="font-medium text-gray-900 dark:text-white">{project.name}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <h6 className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">Project Workspace</h6>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{project.name}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
               <Button onClick={() => setIsGenerateModalOpen(true)} className="shadow-lg shadow-primary-500/20">
                  <Plus className="w-5 h-5 mr-2" /> Generate Artifact
               </Button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6 animate-fade-in">
         {/* Items List */}
         <div className="space-y-4">
           {project.items.length > 0 ? project.items.map(renderListItem) : renderEmptyState()}
         </div>
      </div>

    </div>
  );
};

export default ProjectDetailScreen;
