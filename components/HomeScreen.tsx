
import React, { useState, useRef, useEffect } from 'react';
import { Project, ProjectItem } from '../types';
import { FolderOpen, User, Target, Layers, Folder, ChevronDown, Sparkles, FileText } from 'lucide-react';
import Button from './Button';

interface HomeScreenProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onSelectProjectItem: (project: Project, item: ProjectItem) => void;
  onNewProject: () => void;
  onCreateArtifact: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  projects, 
  onSelectProject, 
  onSelectProjectItem,
  onNewProject,
  onCreateArtifact
}) => {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Logic to get Recent Projects (top 3 by updatedAt)
  const recentProjects = [...projects]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 3);

  // Logic to get Recent Generations (all items flat, top 6 by updatedAt)
  const recentItems = projects
    .flatMap(p => p.items.map(i => ({ ...i, project: p })))
    .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
    .slice(0, 6);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
       month: 'short', day: 'numeric'
    });
  };

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
              setShowCreateMenu(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in space-y-12 pb-12">
      
      {/* Welcome / Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Home</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Pick up where you left off.</p>
        </div>
        
        <div className="relative" ref={menuRef}>
            <Button onClick={() => setShowCreateMenu(!showCreateMenu)} className="flex items-center shadow-lg shadow-primary-500/20">
                Create <ChevronDown className={`ml-2 w-4 h-4 transition-transform ${showCreateMenu ? 'rotate-180' : ''}`} />
            </Button>
            
            {showCreateMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20 animate-fade-in origin-top-right">
                    <button 
                        onClick={() => {
                            onNewProject();
                            setShowCreateMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 border-b border-gray-50 dark:border-gray-700/50"
                    >
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                             <Folder className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white text-sm">Create Project</div>
                            <div className="text-xs text-gray-500">Organize your work</div>
                        </div>
                    </button>
                    <button 
                        onClick={() => {
                            onCreateArtifact();
                            setShowCreateMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                             <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white text-sm">Create Artifact</div>
                            <div className="text-xs text-gray-500">Persona or JTBD</div>
                        </div>
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Recent Projects Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-gray-900 dark:text-white">
             Recent Projects
           </h2>
        </div>

        {recentProjects.length === 0 ? (
           <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                 <Folder className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No recent projects</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Your recently modified projects will appear here for quick access.
              </p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {recentProjects.map(project => (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col h-56"
                >
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
                        </div>
                     )}
                  </div>

                  <div className="p-4 border-t border-gray-100 dark:border-gray-700 relative z-20 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-start">
                        <div className="overflow-hidden">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate" title={project.name}>
                                {project.name}
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Edited {formatDate(project.updatedAt)}
                            </p>
                        </div>
                        <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-1 rounded-md">
                            {project.items.length} Artifacts
                        </span>
                    </div>
                  </div>
                </div>
             ))}
          </div>
        )}
      </section>

      {/* Recent Generations Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-gray-900 dark:text-white">
             Recent Generations
           </h2>
        </div>

        {recentItems.length === 0 ? (
           <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                 <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No recent generations</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Your recently generated personas and JTBDs will appear here.
              </p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {recentItems.map(item => {
                // Determine if we show avatar or icon
                const isPersona = item.type === 'persona' || item.type === 'both';
                const hasAvatar = isPersona && item.data.persona;

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectProjectItem(item.project, item)}
                    className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col h-48"
                  >
                    <div className={`flex-1 p-6 relative flex flex-col justify-between ${
                          item.type === 'persona' ? 'bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-gray-800' :
                          item.type === 'jtbd' ? 'bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-gray-800' :
                          'bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-gray-800'
                    }`}>
                      <div className="flex justify-between items-start">
                          {hasAvatar ? (
                             <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shadow-sm text-primary-600 dark:text-primary-400 font-bold text-lg">
                                {item.data.persona?.name.charAt(0).toUpperCase()}
                             </div>
                          ) : (
                             <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
                                item.type === 'persona' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' :
                                item.type === 'jtbd' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                             }`}>
                                {item.type === 'persona' && <User className="w-5 h-5" />}
                                {item.type === 'jtbd' && <Target className="w-5 h-5" />}
                                {item.type === 'both' && <Layers className="w-5 h-5" />}
                             </div>
                          )}
                          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full">
                            {item.type.toUpperCase()}
                          </span>
                      </div>
                      
                      <div>
                          <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">{item.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {item.inputContext.context}
                          </p>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <FolderOpen className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{item.project.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          Edited {formatDate(item.updatedAt || item.createdAt)}
                        </span>
                    </div>
                  </div>
                );
             })}
          </div>
        )}
      </section>

    </div>
  );
};

export default HomeScreen;