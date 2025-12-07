
import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeft, User, Target, Plus, Trash2, ArrowRight, Save, AlertTriangle, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import Button from './Button';
import { GeneratedResult, InputContext, PersonaData, JTBDData } from '../types';
import { downloadAsPng } from '../services/exportService';
import DeleteItemModal from './DeleteItemModal';

interface OutputScreenProps {
  data: GeneratedResult;
  inputContext: InputContext;
  onRegenerate: () => void;
  onBack: () => void;
  onGenerateJTBD: (persona: PersonaData) => void;
  onSave?: (data: GeneratedResult) => void;
  onDelete?: () => void;
  saved?: boolean;
  availablePersonas?: PersonaData[];
  onGeneratePersona?: () => void;
  onLinkPersona?: (persona: PersonaData) => void;
}

const OutputScreen: React.FC<OutputScreenProps> = ({ 
  data, 
  inputContext, 
  onRegenerate, 
  onBack, 
  onGenerateJTBD,
  onSave,
  onDelete,
  saved = false,
  availablePersonas = [],
  onGeneratePersona,
  onLinkPersona
}) => {
  const [editableData, setEditableData] = useState<GeneratedResult>(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showLinkPersona, setShowLinkPersona] = useState(false);

  // Check if we are in the intermediate state of the "Both" flow (Persona generated, JTBD pending)
  const isIntermediateState = inputContext.type === 'both' && editableData.persona && (!editableData.jtbd || editableData.jtbd.length === 0);

  useEffect(() => {
    setEditableData(data);
    if (saved) setHasUnsavedChanges(false);
  }, [data, saved]);

  // NOTE: Auto-save removed as per request. Saving is manual only.

  const handleDownload = () => {
    // Generate filename based on Persona name or context
    const filename = editableData.persona 
        ? `${editableData.persona.name.replace(/\s+/g, '-')}-Artifact`
        : `JTBD-Artifact-${Date.now()}`;
    downloadAsPng(editableData, inputContext.context, filename);
  };

  const handleSave = () => {
    if (onSave) {
        onSave(editableData);
        setHasUnsavedChanges(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
        onDelete();
    }
  };

  const handleBackClick = () => {
    // Show warning if there are unsaved changes
    if (hasUnsavedChanges && onSave) {
      setShowExitWarning(true);
    } else {
      onBack();
    }
  };

  const confirmExit = () => {
    setShowExitWarning(false);
    onBack();
  };

  // Helper wrapper for state updates to track changes
  const updateState = (newState: GeneratedResult) => {
    setEditableData(newState);
    setHasUnsavedChanges(true);
  };

  // Persona Updaters
  const updatePersonaField = (field: keyof PersonaData, value: string) => {
    if (!editableData.persona) return;
    updateState({
      ...editableData,
      persona: { ...editableData.persona, [field]: value }
    });
  };

  const updatePersonaList = (field: 'goals' | 'needs' | 'pains' | 'tasks', index: number, value: string) => {
    if (!editableData.persona) return;
    const newList = [...editableData.persona[field]];
    newList[index] = value;
    updateState({
      ...editableData,
      persona: { ...editableData.persona, [field]: newList }
    });
  };

  const addPersonaListItem = (field: 'goals' | 'needs' | 'pains' | 'tasks') => {
    if (!editableData.persona) return;
    updateState({
      ...editableData,
      persona: { ...editableData.persona, [field]: [...editableData.persona[field], "New item"] }
    });
  };

  const removePersonaListItem = (field: 'goals' | 'needs' | 'pains' | 'tasks', index: number) => {
    if (!editableData.persona) return;
    const newList = [...editableData.persona[field]];
    newList.splice(index, 1);
    updateState({
      ...editableData,
      persona: { ...editableData.persona, [field]: newList }
    });
  };

  // JTBD Updaters
  const updateJTBDItem = (index: number, field: keyof JTBDData, value: string) => {
    if (!editableData.jtbd) return;
    const newJTBD = [...editableData.jtbd];
    newJTBD[index] = { ...newJTBD[index], [field]: value };
    updateState({
      ...editableData,
      jtbd: newJTBD
    });
  };

  const addJTBDItem = () => {
    const newItem: JTBDData = {
      situation: "When I...",
      motivation: "I want to...",
      outcome: "so I can..."
    };
    updateState({
      ...editableData,
      jtbd: [...(editableData.jtbd || []), newItem]
    });
  };

  const removeJTBDItem = (index: number) => {
    if (!editableData.jtbd) return;
    const newJTBD = [...editableData.jtbd];
    newJTBD.splice(index, 1);
    updateState({
      ...editableData,
      jtbd: newJTBD
    });
  };

  const renderPersonaCard = () => {
    if (!editableData.persona) return null;
    const { name, role, goals, needs, pains, tasks } = editableData.persona;

    const renderListSection = (title: string, items: string[], field: 'goals' | 'needs' | 'pains' | 'tasks') => (
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h4>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="group flex items-start gap-2">
              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
              <div className="flex-1 relative">
                <textarea
                  value={item}
                  onChange={(e) => updatePersonaList(field, idx, e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary-300 focus:ring-0 p-0 text-sm text-gray-700 dark:text-gray-300 resize-none overflow-hidden"
                  rows={Math.max(1, Math.ceil(item.length / 40))}
                  style={{ height: 'auto', minHeight: '1.5em' }}
                />
              </div>
              <button 
                onClick={() => removePersonaListItem(field, idx)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1 no-print"
                title="Remove item"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </li>
          ))}
          <li className="no-print">
            <button 
              onClick={() => addPersonaListItem(field)}
              className="flex items-center text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1"
            >
              <Plus className="w-3 h-3 mr-1" /> Add {title.slice(0, -1).toLowerCase()}
            </button>
          </li>
        </ul>
      </div>
    );

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col animate-fade-in print-break-inside-avoid mb-6">
        <div className="bg-gradient-to-r from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-800 p-8 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Generated Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-xl shadow-primary-500/30 flex items-center justify-center shrink-0 ring-4 ring-white dark:ring-gray-800">
               <span className="text-4xl font-extrabold text-white tracking-wider">{name.charAt(0).toUpperCase()}</span>
            </div>
            
            <div className="flex-1 min-w-0 w-full text-center md:text-left">
              <input 
                value={name}
                onChange={(e) => updatePersonaField('name', e.target.value)}
                className="block w-full text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 placeholder-gray-400 text-center md:text-left"
                placeholder="Persona Name"
              />
              <input 
                value={role}
                onChange={(e) => updatePersonaField('role', e.target.value)}
                className="block w-full text-xl text-primary-600 dark:text-primary-400 font-medium bg-transparent border-none focus:ring-0 p-0 mt-2 placeholder-primary-300 text-center md:text-left"
                placeholder="Role / Title"
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
             {renderListSection("Goals", goals, 'goals')}
             {renderListSection("Pains", pains, 'pains')}
           </div>
           <div className="space-y-6">
             {renderListSection("Needs", needs, 'needs')}
             {renderListSection("Key Tasks", tasks, 'tasks')}
           </div>
        </div>
      </div>
    );
  };

  const renderJTBDSection = () => {
    if (!editableData.jtbd || editableData.jtbd.length === 0) return null;
    
    return (
      <div className="flex flex-col space-y-4">
        {editableData.persona && (
           <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-4 mb-2">
             <Target className="w-5 h-5 text-primary-500" />
             Linked Jobs-To-Be-Done
           </h3>
        )}

        {editableData.jtbd.map((jtbd, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in relative group print-break-inside-avoid">
              
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                <button 
                  onClick={() => removeJTBDItem(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Remove this JTBD"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                 <div className="flex-1 space-y-4 w-full">
                    <div className="flex gap-2">
                        <span className="shrink-0 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded">
                            Situation
                        </span>
                        <textarea
                            value={jtbd.situation}
                            onChange={(e) => updateJTBDItem(index, 'situation', e.target.value)}
                            className="w-full text-sm text-gray-800 dark:text-gray-200 bg-transparent border-0 border-b border-gray-100 dark:border-gray-700 focus:border-primary-500 focus:ring-0 p-0 pb-1 resize-none"
                            rows={1}
                        />
                    </div>
                    <div className="flex gap-2">
                        <span className="shrink-0 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded">
                            Motivation
                        </span>
                        <textarea
                            value={jtbd.motivation}
                            onChange={(e) => updateJTBDItem(index, 'motivation', e.target.value)}
                            className="w-full text-sm text-gray-800 dark:text-gray-200 bg-transparent border-0 border-b border-gray-100 dark:border-gray-700 focus:border-primary-500 focus:ring-0 p-0 pb-1 resize-none"
                            rows={1}
                        />
                    </div>
                    <div className="flex gap-2">
                        <span className="shrink-0 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded">
                            Outcome
                        </span>
                        <textarea
                            value={jtbd.outcome}
                            onChange={(e) => updateJTBDItem(index, 'outcome', e.target.value)}
                            className="w-full text-sm text-gray-800 dark:text-gray-200 bg-transparent border-0 border-b border-gray-100 dark:border-gray-700 focus:border-primary-500 focus:ring-0 p-0 pb-1 resize-none"
                            rows={1}
                        />
                    </div>
                 </div>
              </div>
            </div>
          ))}

        <div className="pt-2 no-print">
           <Button variant="outline" fullWidth onClick={addJTBDItem} className="border-dashed">
             <Plus className="w-4 h-4 mr-2" /> Add another JTBD
           </Button>
        </div>
      </div>
    );
  };

  const renderAddJTBDCTA = () => {
    // Only show if the artifact is already saved (not first generation)
    if (!saved) return null;
    // Hidden if 'Both' flow was selected
    if (inputContext.type === 'both') return null;

    return (
      <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center animate-fade-in no-print">
         <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm w-fit mx-auto mb-4">
             <Target className="w-8 h-8 text-primary-500" />
         </div>
         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Expand your research</h3>
         <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
             Generate targeted Jobs-To-Be-Done statements based specifically on this persona's goals and pains.
         </p>
         <Button 
            onClick={() => editableData.persona && onGenerateJTBD(editableData.persona)} 
            className="shadow-lg shadow-primary-500/20"
         >
             <Plus className="w-4 h-4 mr-2" /> Generate Linked Jobs
         </Button>
      </div>
    );
  };

  const renderMissingPersonaCTA = () => {
    // Only show if the artifact is already saved
    if (!saved) return null;

    return (
        <div className="mt-8 mb-8 bg-primary-50 dark:bg-primary-900/20 border border-dashed border-primary-200 dark:border-primary-800 rounded-2xl p-6 text-center animate-fade-in no-print">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm w-fit mx-auto mb-4">
                <User className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Who is this for?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                These Jobs-To-Be-Done are orphaned. Create a persona or link an existing one to provide context.
            </p>
            <div className="flex justify-center gap-4 flex-wrap relative z-10">
                {onGeneratePersona && (
                    <Button 
                        onClick={onGeneratePersona} 
                        className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20"
                    >
                        <Sparkles className="w-4 h-4 mr-2" /> Generate Persona
                    </Button>
                )}
                
                {onLinkPersona && availablePersonas && availablePersonas.length > 0 && (
                    <div className="relative">
                        <Button 
                            variant="outline"
                            onClick={() => setShowLinkPersona(!showLinkPersona)} 
                            className="bg-white dark:bg-gray-800"
                        >
                            Link Existing Persona
                        </Button>
                        
                        {showLinkPersona && (
                            <>
                            <div className="fixed inset-0 z-20 cursor-default" onClick={() => setShowLinkPersona(false)}></div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-30 overflow-hidden animate-fade-in text-left">
                                <div className="p-2 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase">
                                    Select Persona
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {availablePersonas.map((p, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (onLinkPersona) onLinkPersona(p);
                                                setShowLinkPersona(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                                        >
                                            <div className="font-bold text-gray-900 dark:text-white text-sm">{p.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{p.role}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
  };

  // Show save button if artifact is NOT saved OR if there are unsaved changes
  const showSaveButton = !saved || hasUnsavedChanges;

  return (
    <div className="flex flex-col h-full animate-fade-in max-w-full relative pb-20">
      
      {/* Save Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4 text-amber-500">
               <AlertTriangle className="w-6 h-6" />
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">Unsaved Changes</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to leave this page without saving?
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={confirmExit}
                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
              >
                Leave Page
              </Button>
              <Button onClick={() => setShowExitWarning(false)} className="shadow-lg shadow-primary-500/20">
                Stay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteItemModal 
        isOpen={showDeleteWarning}
        onClose={() => setShowDeleteWarning(false)}
        onConfirm={() => {
            setShowDeleteWarning(false);
            handleDelete();
        }}
        title="Delete Artifact?"
        description="Are you sure you want to delete this artifact? This action cannot be undone."
      />

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 no-print">
        <Button variant="ghost" onClick={handleBackClick} size="sm" className="text-gray-500 dark:text-gray-400">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        
        <div className="flex items-center gap-3">
          {/* Show different actions based on state */}
          {isIntermediateState ? (
             <Button 
                onClick={() => editableData.persona && onGenerateJTBD(editableData.persona)} 
                className="shadow-lg shadow-primary-500/20"
             >
                Next: Generate JTBD <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
          ) : (
             <>
               {onSave && showSaveButton && (
                   <Button 
                    variant="primary" 
                    onClick={handleSave} 
                    size="sm"
                    className="transition-colors min-w-[100px] shadow-lg shadow-primary-500/20"
                   >
                       <Save className="w-4 h-4 mr-2" /> Save
                   </Button>
               )}
               
               {saved && onDelete && (
                 <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteWarning(true)} 
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50 hover:border-red-700 dark:text-red-500 dark:border-red-500 dark:hover:bg-red-900/20 dark:hover:border-red-400"
                 >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                 </Button>
               )}

               <Button variant="outline" onClick={handleDownload} size="sm">
                  <ImageIcon className="w-4 h-4 mr-2" /> Save as PNG
               </Button>
               <Button variant="outline" onClick={onRegenerate} size="sm">
                 <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
               </Button>
             </>
          )}
        </div>
      </div>

      {/* Content Layout - Vertical Stack */}
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Persona Section */}
        {editableData.persona && (
          <div className="mb-4">
            {renderPersonaCard()}
          </div>
        )}

        {/* JTBD Section - Below Persona */}
        {editableData.jtbd && editableData.jtbd.length > 0 ? (
          <>
            {renderJTBDSection()}
            {/* Persona Suggestion Below JTBD */}
            {!editableData.persona && renderMissingPersonaCTA()}
          </>
        ) : (
          editableData.persona && renderAddJTBDCTA()
        )}
      </div>
    </div>
  );
};

export default OutputScreen;
