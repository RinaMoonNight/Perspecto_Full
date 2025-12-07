
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface DeleteItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const DeleteItemModal: React.FC<DeleteItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Delete Item?",
  description = "Are you sure you want to delete this item? This action cannot be undone."
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
        <div className="flex items-center gap-3 mb-4 text-red-500">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {description}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white shadow-red-500/20">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteItemModal;
