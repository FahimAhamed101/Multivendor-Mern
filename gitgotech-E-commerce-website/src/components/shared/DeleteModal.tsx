'use client';

import { Trash2 } from 'lucide-react';

interface DeleteModalProps {
  show: boolean;
  title: string;
  itemName?: string;
  deleting?: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteModal({ show, title, itemName, deleting, onClose, onDelete }: DeleteModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-[#2C223C] to-[#18161C] border border-purple-500/30 rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2 font-cormorant">{title}</h2>
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to delete{' '}
          {itemName && <span className="text-white font-medium">{itemName}</span>}? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
