import React, { useState, useEffect } from 'react';
import { History, LayoutGrid, Home, LogIn, User as UserIcon, LogOut, Sun, Moon } from 'lucide-react';
import InputScreen from './components/InputScreen';
import LoadingScreen from './components/LoadingScreen';
import OutputScreen from './components/OutputScreen';
import HistorySidebar from './components/HistorySidebar';
import ProjectsScreen from './components/ProjectsScreen';
import ProjectDetailScreen from './components/ProjectDetailScreen';
import HomeScreen from './components/HomeScreen';
import LandingScreen from './components/LandingScreen';
import ProjectModal from './components/ProjectModal';
import GenerationTypeModal from './components/GenerationTypeModal';
import SaveArtifactModal from './components/SaveArtifactModal';
import Toast from './components/Toast';
import Button from './components/Button';
import AuthModal from './components/AuthModal'; // Import AuthModal
import { ViewState, InputContext, GeneratedResult, HistoryItem, PersonaData, Project, ProjectItem, GeneratorType } from './types';
import { generateUXData } from './services/geminiService';
import { projectService } from './services/projectService';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [inputContext, setInputContext] = useState<InputContext | null>(null);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Project State
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeProjectItem, setActiveProjectItem] = useState<ProjectItem | null>(null); // For editing an existing item
  const [initialInputType, setInitialInputType] = useState<GeneratorType>('both'); // To pre-select type in input
  const [isInputTypeLocked, setIsInputTypeLocked] = useState(false); // To hide type selector in InputScreen
  
  // Home Screen Modals State
  const [isHomeProjectModalOpen, setIsHomeProjectModalOpen] = useState(false);
  const [isHomeArtifactModalOpen, setIsHomeArtifactModalOpen] = useState(false);
  const [isSaveArtifactModalOpen, setIsSaveArtifactModalOpen] = useState(false);
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Pending Save State (for standalone generation saving)
  const [pendingSaveData, setPendingSaveData] = useState<GeneratedResult | null>(null);

  // Store all projects to pass to HomeScreen
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  // Global Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && view === 'landing') {
        setView('home');
      } else if (!currentUser && view !== 'landing') {
        setView('landing');
      }
    });
    return () => unsubscribe();
  }, [view]);

  // Theme Handling
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Load history and projects and Restore Session
  useEffect(() => {
    const savedHistory = localStorage.getItem('perspecto_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    
    // Refresh projects list
    const projects = projectService.getAll();
    setAllProjects(projects);

    // Restore Session
    const session = localStorage.getItem('perspecto_session');
    if (session) {
        try {
            const { 
                view: savedView, 
                projectId, 
                itemId, 
                tempInputContext, 
                tempResult,
                savedInitialInputType,
                savedIsInputTypeLocked 
            } = JSON.parse(session);

            // Restore UI State params
            if (savedInitialInputType) setInitialInputType(savedInitialInputType);
            if (savedIsInputTypeLocked !== undefined) setIsInputTypeLocked(savedIsInputTypeLocked);

            // Restore Active Data
            if (projectId) {
                const p = projects.find(proj => proj.id === projectId);
                if (p) {
                    setActiveProject(p);
                    if (itemId) {
                        const item = p.items.find(i => i.id === itemId);
                        if (item) {
                            setActiveProjectItem(item);
                            // If we have saved data in the item, prefer that, otherwise use temp if available
                            setInputContext(item.inputContext);
                            setResult(item.data);
                        }
                    } else {
                        // If no item ID but we have temp data (e.g. creating new item), restore it
                        if (tempInputContext) setInputContext(tempInputContext);
                        if (tempResult) setResult(tempResult);
                    }
                    if (savedView && savedView !== 'landing') setView(savedView);
                }
            } else {
                // No active project, but maybe standalone generation
                if (tempInputContext) setInputContext(tempInputContext);
                if (tempResult) setResult(tempResult);
                if (savedView && savedView !== 'landing') setView(savedView);
            }
        } catch (e) {
            console.error("Failed to restore session", e);
        }
    }
  }, []);

  // Persist Session on State Change
  useEffect(() => {
    if (view === 'landing') return; // Don't persist landing view state

    const session = {
        view,
        projectId: activeProject?.id,
        itemId: activeProjectItem?.id,
        tempInputContext: inputContext,
        tempResult: result,
        savedInitialInputType: initialInputType,
        savedIsInputTypeLocked: isInputTypeLocked
    };
    localStorage.setItem('perspecto_session', JSON.stringify(session));
  }, [view, activeProject, activeProjectItem, inputContext, result, initialInputType, isInputTypeLocked]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const refreshProjects = () => {
    setAllProjects(projectService.getAll());
  };

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('perspecto_history', JSON.stringify(newHistory));
  };
  
  // Helper to append history
  const appendHistory = (actionDescription: string, data: GeneratedResult | null, ctx: InputContext | null) => {
      const historyCtx = ctx || { context: actionDescription, type: 'both' };
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        inputContext: { ...historyCtx, context: actionDescription }, // Use context field for description
        result: data || {}
      };
      saveHistory([newItem, ...history]);
  };

  // Callback for ProjectsScreen to bubble up history events
  const handleHistoryAction = (action: string, project: Project) => {
    appendHistory(action, null, { context: action, type: 'both' });
  };

  const handleStart = () => {
    setActiveProject(null);
    setActiveProjectItem(null);
    setInitialInputType('both');
    setIsInputTypeLocked(false);
    setView('input');
  };

  const handleGenerate = async (ctx: InputContext) => {
    setInputContext(ctx);
    setView('loading');
    setResult(null);
    
    try {
      const typeToGenerate = ctx.type === 'both' ? 'persona' : ctx.type;
      const data = await generateUXData(ctx.context, typeToGenerate);
      setResult(data);
      
      // Save initial generation to history if standalone
      if (ctx.type !== 'both' && !activeProjectItem && !activeProject) {
         appendHistory(`Generated ${ctx.type}: ${ctx.context.substring(0, 30)}...`, data, ctx);
      }
      
      setView('output');
    } catch (error) {
      console.error("Failed to generate", error);
      setView('input'); 
    }
  };

  const handleContinueToJTBD = async (editedPersona: PersonaData) => {
    if (!inputContext) return;
    setView('loading');
    
    try {
        const jtbdData = await generateUXData(inputContext.context, 'jtbd', editedPersona);
        
        if (activeProject && activeProjectItem) {
            // We are inside a project item, updating it to add JTBD
            const updatedData: GeneratedResult = {
                persona: editedPersona,
                jtbd: jtbdData.jtbd
            };
            
            // Save directly to project item immediately
            const updatedProject = projectService.updateItem(activeProject.id, activeProjectItem.id, updatedData);
            if (updatedProject) {
                setActiveProject(updatedProject);
                // Refresh the active item ref
                const updatedItem = updatedProject.items.find(i => i.id === activeProjectItem.id);
                if (updatedItem) setActiveProjectItem(updatedItem);
                refreshProjects();
                
                // Track history
                appendHistory(`Expanded JTBD for ${editedPersona.name} in ${activeProject.name}`, updatedData, inputContext);
            }
            
            setResult(updatedData);
        } else {
            // Standalone flow
            const completeResult: GeneratedResult = {
                persona: editedPersona,
                jtbd: jtbdData.jtbd
            };
            setResult(completeResult);
            appendHistory(`Generated JTBD for ${editedPersona.name}`, completeResult, inputContext);
        }

        setView('output');
    } catch (error) {
        console.error("Failed to generate JTBD", error);
        setView('output');
    }
  };

  const handleLinkPersona = (persona: PersonaData) => {
    if (!activeProject || !activeProjectItem || !result) return;
    
    const updatedData: GeneratedResult = {
        ...result,
        persona: persona
    };
    
    const updatedProject = projectService.updateItem(activeProject.id, activeProjectItem.id, updatedData);
    if (updatedProject) {
        setActiveProject(updatedProject);
        const updatedItem = updatedProject.items.find(i => i.id === activeProjectItem.id);
        if (updatedItem) setActiveProjectItem(updatedItem);
        setResult(updatedData);
        refreshProjects();
        triggerToast("Persona linked successfully");
        appendHistory(`Linked Persona ${persona.name} to JTBD in ${activeProject.name}`, updatedData, inputContext || activeProjectItem.inputContext);
    }
  };

  const handleGeneratePersonaFromJTBD = async () => {
    if (!inputContext || !result?.jtbd || !activeProject || !activeProjectItem) return;
    setView('loading');

    try {
       const personaData = await generateUXData(inputContext.context, 'persona');
       
       const updatedData: GeneratedResult = {
           persona: personaData.persona,
           jtbd: result.jtbd
       };

       const updatedProject = projectService.updateItem(activeProject.id, activeProjectItem.id, updatedData);
       if (updatedProject) {
            setActiveProject(updatedProject);
            const updatedItem = updatedProject.items.find(i => i.id === activeProjectItem.id);
            if (updatedItem) setActiveProjectItem(updatedItem);
            setResult(updatedData);
            refreshProjects();
            triggerToast("Persona generated successfully");
            appendHistory(`Generated Persona for JTBD in ${activeProject.name}`, updatedData, inputContext);
       }
       setView('output');

    } catch (error) {
        console.error("Failed to generate Persona from JTBD", error);
        setView('output');
    }
  };

  const handleRegenerate = () => {
    if (inputContext) handleGenerate(inputContext);
  };

  const handleInputBack = () => {
    if (activeProject) {
        // If we were adding to a project, go back to project detail
        setView('project_detail');
    } else {
        // If standalone flow (from Home), go back to Home
        setView('home');
    }
  };

  // --- Project Handlers ---

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    setView('project_detail');
  };
  
  const handleSelectProjectItemFromHome = (project: Project, item: ProjectItem) => {
    setActiveProject(project);
    setActiveProjectItem(item);
    setInputContext(item.inputContext);
    setResult(item.data);
    setView('output');
  };

  const handleNewProjectItem = (type: GeneratorType = 'both') => {
    // When adding a new item from project detail
    setActiveProjectItem(null);
    setInitialInputType(type);
    setIsInputTypeLocked(true); // Lock the input type since we clicked a specific "Generate [Type]" button
    setView('input');
  };

  const handleEditProjectItem = (item: ProjectItem) => {
    setActiveProjectItem(item);
    setInputContext(item.inputContext);
    setResult(item.data);
    setView('output');
  };

  const handleDeleteProjectItem = () => {
     if (activeProject && activeProjectItem) {
         const updated = projectService.deleteItem(activeProject.id, activeProjectItem.id);
         if (updated) {
             setActiveProject(updated);
             setActiveProjectItem(null);
             refreshProjects();
             triggerToast("Artifact deleted successfully");
             appendHistory(`Deleted artifact ${activeProjectItem.name} from ${activeProject.name}`, activeProjectItem.data, activeProjectItem.inputContext);
             setView('project_detail');
         }
     }
  };

  const handleSaveToProject = (data: GeneratedResult) => {
    if (!inputContext) return;

    if (!activeProject) {
        setPendingSaveData(data);
        setIsSaveArtifactModalOpen(true);
        return;
    }

    if (activeProjectItem) {
        // Update existing item
        const updated = projectService.updateItem(activeProject.id, activeProjectItem.id, data);
        if (updated) {
            setActiveProject(updated);
            // Must update activeProjectItem to reflect the saved state (so 'saved' prop works)
            const updatedItem = updated.items.find(i => i.id === activeProjectItem.id);
            if (updatedItem) setActiveProjectItem(updatedItem);
            
            refreshProjects();
            triggerToast("Changes successfully saved");
            appendHistory(`Updated artifact ${activeProjectItem.name} in ${activeProject.name}`, data, inputContext);
            setView('project_detail');
        }
    } else {
        // Add new item
        let name = "New Item";
        if (data.persona) name = data.persona.name;
        else if (data.jtbd && data.jtbd.length > 0) name = "JTBD Set";

        const updated = projectService.addItem(activeProject.id, {
            type: inputContext.type,
            name: name,
            data: data,
            inputContext: inputContext
        });

        if (updated) {
            setActiveProject(updated);
            // Set the newly created item as active to mark as "saved"
            const newItem = updated.items[0]; // addItem prepends
            if (newItem) setActiveProjectItem(newItem);
            
            refreshProjects();
            triggerToast("Artifact saved successfully");
            appendHistory(`Created artifact ${name} in ${activeProject.name}`, data, inputContext);
            setView('project_detail');
        }
    }
  };

  // Called from SaveArtifactModal -> Save to Existing
  const handleSaveToExistingProject = (projectId: string) => {
     if (!pendingSaveData || !inputContext) return;

     let itemName = "New Item";
     if (pendingSaveData.persona) itemName = pendingSaveData.persona.name;
     else if (pendingSaveData.jtbd && pendingSaveData.jtbd.length > 0) itemName = "JTBD Set";

     const updated = projectService.addItem(projectId, {
         type: inputContext.type,
         name: itemName,
         data: pendingSaveData,
         inputContext: inputContext
     });

     if (updated) {
         setActiveProject(updated);
         setPendingSaveData(null);
         refreshProjects();
         setIsSaveArtifactModalOpen(false);
         triggerToast("Artifact saved to project");
         appendHistory(`Saved standalone artifact ${itemName} to ${updated.name}`, pendingSaveData, inputContext);
         setView('project_detail');
     }
  };

  // Called from SaveArtifactModal -> Save to New (or directly from Home "Create Project")
  const handleCreateNewProject = (name: string, image?: string) => {
    const newProject = projectService.create(name, image);
    refreshProjects();
    appendHistory(`Created project: ${name}`, null, null);
    
    // Check if we were trying to save an artifact
    if (pendingSaveData && inputContext) {
        let itemName = "New Item";
        if (pendingSaveData.persona) itemName = pendingSaveData.persona.name;
        else if (pendingSaveData.jtbd && pendingSaveData.jtbd.length > 0) itemName = "JTBD Set";

        const updated = projectService.addItem(newProject.id, {
            type: inputContext.type,
            name: itemName,
            data: pendingSaveData,
            inputContext: inputContext
        });

        if (updated) {
            setActiveProject(updated);
            setPendingSaveData(null);
            setIsSaveArtifactModalOpen(false);
            triggerToast("Project created and artifact saved");
            appendHistory(`Saved artifact ${itemName} to new project ${name}`, pendingSaveData, inputContext);
            setView('project_detail');
        }
    } else {
        // Normal project creation flow from Home
        setActiveProject(newProject);
        setView('project_detail');
        setIsHomeProjectModalOpen(false);
        triggerToast("Project created successfully");
    }
  };

  const handleUpdateProject = (p: Project) => {
      setActiveProject(p);
      refreshProjects();
      appendHistory(`Updated project details for ${p.name}`, null, null);
  };

  const handleSelectArtifactTypeFromHome = (type: GeneratorType) => {
    setIsHomeArtifactModalOpen(false); // Close the modal
    setActiveProject(null); // Standalone flow
    setActiveProjectItem(null);
    setInitialInputType(type);
    setIsInputTypeLocked(true);
    setView('input');
  };

  // Auth Handling
  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setView('landing');
      triggerToast("Signed out successfully");
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const handleLandingStart = () => {
    if (user) {
      setView('home');
    } else {
      handleOpenAuth('signup');
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 selection:bg-primary-500 selection:text-white overflow-x-hidden">
      
      {/* Global Toast */}
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
            triggerToast(authMode === 'signin' ? "Welcome back!" : "Account created successfully");
        }}
      />

      {/* Home Screen Modals */}
      <ProjectModal 
        isOpen={isHomeProjectModalOpen}
        onClose={() => {
            setIsHomeProjectModalOpen(false);
        }}
        onSubmit={handleCreateNewProject}
        title="Create New Project"
        submitLabel="Create Project"
      />
      
      <GenerationTypeModal 
        isOpen={isHomeArtifactModalOpen}
        onClose={() => setIsHomeArtifactModalOpen(false)}
        onSelect={handleSelectArtifactTypeFromHome}
      />

      {/* Save Artifact Modal (New vs Existing) */}
      <SaveArtifactModal 
        isOpen={isSaveArtifactModalOpen}
        onClose={() => {
            setIsSaveArtifactModalOpen(false);
        }}
        projects={allProjects}
        onSaveToExisting={handleSaveToExistingProject}
        onSaveToNew={handleCreateNewProject}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between max-w-7xl">
           <div 
             className="flex items-center space-x-3 cursor-pointer group" 
             onClick={() => setView(user ? 'home' : 'landing')}
           >
              <div className="bg-primary-600 p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary-500/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                    <path d="M12 3v18" />
                    <path d="M3 12h18" />
                    <path d="M5.64 5.64l12.72 12.72" />
                    <path d="M18.36 5.64L5.64 18.36" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Perspecto</span>
           </div>
           
           <div className="flex items-center gap-2">
             {!user ? (
                // Landing Page Navigation
                <>
                  <Button variant="ghost" onClick={() => handleOpenAuth('signin')} className="text-sm font-medium">Sign In</Button>
                  <Button size="sm" onClick={() => handleOpenAuth('signup')}>Sign Up</Button>
                  <div className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={toggleTheme}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none"
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                  </div>
                </>
             ) : (
                // App Navigation
                <>
                    <button 
                        onClick={() => setView('home')}
                        className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center gap-2 ${view === 'home' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Home className="w-5 h-5" />
                        <span className="hidden sm:inline text-sm font-medium">Home</span>
                    </button>

                    <button 
                        onClick={() => setView('projects')}
                        className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center gap-2 ${view === 'projects' || view === 'project_detail' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                        <span className="hidden sm:inline text-sm font-medium">Projects</span>
                    </button>

                    <button 
                        onClick={() => setIsHistoryOpen(true)}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center gap-2"
                    >
                        <History className="w-5 h-5" />
                        <span className="hidden sm:inline text-sm font-medium">History</span>
                    </button>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs shadow-sm ring-2 ring-white dark:ring-gray-900">
                          {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <button 
                          onClick={handleSignOut}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none"
                          title="Sign Out"
                      >
                          <LogOut className="w-5 h-5" />
                      </button>
                    </div>

                    <button 
                        onClick={toggleTheme}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none"
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </>
             )}
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          
          {view === 'landing' && (
            <LandingScreen onStart={handleLandingStart} />
          )}

          {view === 'home' && (
             <HomeScreen 
                projects={allProjects} 
                onSelectProject={handleSelectProject}
                onSelectProjectItem={handleSelectProjectItemFromHome}
                onNewProject={() => setIsHomeProjectModalOpen(true)}
                onCreateArtifact={() => setIsHomeArtifactModalOpen(true)}
             />
          )}

          {view === 'projects' && (
             <ProjectsScreen 
                onSelectProject={handleSelectProject} 
                onHistoryAction={handleHistoryAction}
             />
          )}

          {view === 'project_detail' && activeProject && (
             <ProjectDetailScreen 
                project={activeProject} 
                onBack={() => setView('projects')}
                onNewItem={handleNewProjectItem}
                onEditItem={handleEditProjectItem}
                onUpdateProject={handleUpdateProject}
             />
          )}

          {view === 'input' && (
            <InputScreen 
                onGenerate={handleGenerate} 
                initialType={initialInputType} 
                lockType={isInputTypeLocked}
                onBack={handleInputBack}
            />
          )}
          
          {view === 'loading' && <LoadingScreen />}
          
          {view === 'output' && result && inputContext && (
            <OutputScreen 
              data={result} 
              inputContext={inputContext}
              onRegenerate={handleRegenerate}
              onBack={() => {
                  // If we were editing a project item or started from a project, go back to details
                  if (activeProject) setView('project_detail');
                  else setView('input');
              }}
              onGenerateJTBD={handleContinueToJTBD}
              onSave={handleSaveToProject}
              onDelete={activeProjectItem ? handleDeleteProjectItem : undefined}
              saved={!!activeProjectItem} 
              availablePersonas={activeProject ? activeProject.items.filter(i => i.type === 'persona' || i.type === 'both').map(i => i.data.persona!).filter(Boolean) : []}
              onGeneratePersona={handleGeneratePersonaFromJTBD}
              onLinkPersona={handleLinkPersona}
            />
          )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto no-print">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
             Powered by Google Gemini 2.5 Flash
          </p>
        </div>
      </footer>
      
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={(item) => {
            setInputContext(item.inputContext);
            setResult(item.result);
            setActiveProject(null); // Viewing history detaches from project context
            setView('output');
            setIsHistoryOpen(false);
        }}
        onClear={() => saveHistory([])}
      />

    </div>
  );
}

export default App;