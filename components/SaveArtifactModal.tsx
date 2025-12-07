
import React, { useState, useRef } from 'react';
import { Folder, Plus, Image as ImageIcon, X } from 'lucide-react';
import Button from './Button';
import { Project } from '../types';

interface SaveArtifactModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSaveToExisting: (projectId: string) => void;
  onSaveToNew: (name: string, image?: string) => void;
}

const SaveArtifactModal: React.FC<SaveArtifactModalProps> = ({ 
  isOpen, 
  onClose, 
  projects, 
  onSaveToExisting, 
  onSaveToNew 
}) => {
  const [mode, setMode] = useState<'existing' | 'new'>(projects.length > 0 ? 'existing' : 'new');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  
  // New Project State
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveToExisting = () => {
    if (selectedProjectId) {
      onSaveToExisting(selectedProjectId);
    }
  };

  const handleSaveToNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onSaveToNew(newName.trim(), newImage);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Save Artifact</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button 
                onClick={() => setMode('existing')}
                disabled={projects.length === 0}
                className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                    mode === 'existing' 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                } ${projects.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center justify-center gap-2">
                    <Folder className="w-4 h-4" /> Existing Project
                </div>
                {mode === 'existing' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-500"></div>}
            </button>
            <button 
                onClick={() => setMode('new')}
                className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                    mode === 'new' 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
            >
                <div className="flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> New Project
                </div>
                {mode === 'new' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-500"></div>}
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
            {mode === 'existing' ? (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Project</label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none"
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSaveToExisting}>Save to Project</Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSaveToNew} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Name</label>
                        <input
                            autoFocus
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g. Healthcare App Redesign"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Image (Optional)</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors relative overflow-hidden bg-gray-50 dark:bg-gray-900/50"
                        >
                            {newImage ? (
                                <>
                                <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <span className="text-white font-medium flex items-center"><Plus className="w-4 h-4 mr-2"/> Change</span>
                                </div>
                                </>
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <ImageIcon className="w-8 h-8 mb-2" />
                                    <span className="text-sm">Upload Cover</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Create & Save</Button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default SaveArtifactModal;
