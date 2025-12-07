
import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Image as ImageIcon, X } from 'lucide-react';
import Button from './Button';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, image?: string) => void;
  initialName?: string;
  initialImage?: string;
  title: string;
  submitLabel: string;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialName = '', 
  initialImage, 
  title, 
  submitLabel 
}) => {
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState<string | undefined>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setImage(initialImage);
    }
  }, [isOpen, initialName, initialImage]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), image);
      onClose();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {title}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 space-y-2">
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
             <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mobile Banking App"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
          </div>
          
          <div className="mb-6 space-y-2">
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image (Optional)</label>
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors relative overflow-hidden bg-gray-50 dark:bg-gray-900/50"
             >
                {image ? (
                    <>
                       <img src={image} alt="Preview" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white font-medium flex items-center"><Edit2 className="w-4 h-4 mr-2"/> Change</span>
                       </div>
                    </>
                ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-sm">Click to upload image</span>
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
             {image && (
                <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setImage(undefined); }}
                    className="text-xs text-red-500 hover:underline flex items-center"
                >
                    <X className="w-3 h-3 mr-1" /> Remove Image
                </button>
             )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
