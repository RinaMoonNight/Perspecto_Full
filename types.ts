
export type ViewState = 'landing' | 'onboarding' | 'welcome' | 'home' | 'projects' | 'project_detail' | 'input' | 'loading' | 'output' | 'settings';

export type GeneratorType = 'persona' | 'jtbd' | 'both';

export interface PersonaData {
  name: string;
  role: string;
  goals: string[];
  needs: string[];
  pains: string[];
  tasks: string[];
}

export interface JTBDData {
  situation: string; // When I...
  motivation: string; // I want to...
  outcome: string; // So I can...
}

export interface GeneratedResult {
  persona?: PersonaData;
  jtbd?: JTBDData[]; // Changed to array to support multiple items
}

export interface InputContext {
  context: string;
  type: GeneratorType;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  inputContext: InputContext;
  result: GeneratedResult;
}

export interface ProjectItem {
  id: string;
  type: GeneratorType;
  name: string;
  createdAt: number;
  updatedAt: number;
  data: GeneratedResult;
  inputContext: InputContext;
}

export interface Project {
  id: string;
  name: string;
  previewImage?: string; // Base64 string for cover image
  createdAt: number;
  updatedAt: number;
  items: ProjectItem[];
}
