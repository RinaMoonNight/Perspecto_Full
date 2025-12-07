
import { Project, ProjectItem, GeneratedResult, InputContext, GeneratorType } from '../types';

const STORAGE_KEY = 'perspecto_projects';

const getProjects = (): Project[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const projectService = {
  getAll: (): Project[] => {
    return getProjects().sort((a, b) => b.updatedAt - a.updatedAt);
  },

  create: (name: string, previewImage?: string): Project => {
    const projects = getProjects();
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      previewImage,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: []
    };
    saveProjects([newProject, ...projects]);
    return newProject;
  },

  update: (project: Project) => {
    const projects = getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      projects[index] = { ...project, updatedAt: Date.now() };
      saveProjects(projects);
    }
  },

  delete: (id: string) => {
    const projects = getProjects();
    saveProjects(projects.filter(p => p.id !== id));
  },

  addItem: (projectId: string, item: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>): Project | null => {
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return null;

    const newItem: ProjectItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    projects[projectIndex].items.unshift(newItem);
    projects[projectIndex].updatedAt = Date.now();
    saveProjects(projects);
    
    return projects[projectIndex];
  },

  updateItem: (projectId: string, itemId: string, data: GeneratedResult): Project | null => {
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return null;

    const itemIndex = projects[projectIndex].items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return null;

    projects[projectIndex].items[itemIndex].data = data;
    projects[projectIndex].items[itemIndex].updatedAt = Date.now();
    
    // If we added JTBD to a persona-only type, upgrade type to 'both'
    if (data.persona && data.jtbd && data.jtbd.length > 0) {
        projects[projectIndex].items[itemIndex].type = 'both';
    }
    
    projects[projectIndex].updatedAt = Date.now();
    saveProjects(projects);

    return projects[projectIndex];
  },

  deleteItem: (projectId: string, itemId: string): Project | null => {
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return null;

    projects[projectIndex].items = projects[projectIndex].items.filter(i => i.id !== itemId);
    projects[projectIndex].updatedAt = Date.now();
    saveProjects(projects);

    return projects[projectIndex];
  }
};
