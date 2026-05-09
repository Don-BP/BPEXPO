// --- START OF SECTION: src/ConfirmationModal.tsx ---
import React from 'react';
import { AlertTriangle, Save, X, ArrowRight } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose?: () => void; // Optional cancel/close
    onConfirm: () => void;
    onDiscard: () => void; // Used as Secondary Action
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    onDiscard,
    title,
    message,
    confirmLabel = "Save & Leave",
    cancelLabel = "Discard Changes",
    isDestructive = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">
                                {title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onDiscard} // Secondary Action (Discard or Cancel)
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        onClick={onConfirm}
                        className={`group px-4 py-2 font-bold text-white rounded-lg shadow-sm flex items-center gap-2 transition-all ${isDestructive
                                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                            }`}
                    >
                        {isDestructive ? null : <Save className="w-4 h-4" />}
                        {confirmLabel}
                        {isDestructive ? null : <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- END OF SECTION: src/ConfirmationModal.tsx ---