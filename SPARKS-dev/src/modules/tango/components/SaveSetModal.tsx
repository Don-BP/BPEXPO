// ========= START: bp-tango-dev/src/components/SaveSetModal.tsx (NEW FILE) =========
import React, { useState } from 'react';

interface SaveSetModalProps {
    isOpen: boolean;
    selectedCount: number;
    onSave: (setName: string) => void;
    onCancel: () => void;
}

const SaveSetModal: React.FC<SaveSetModalProps> = ({ isOpen, selectedCount, onSave, onCancel }) => {
    const [setName, setSetName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (setName.trim()) {
            onSave(setName.trim());
            setSetName(''); // Reset for next time
        }
    };

    return (
        <div className="modal-overlay">
            <div className="save-set-modal-content">
                <h2>Save Custom Set</h2>
                <p>You have selected {selectedCount} cards.</p>
                <p>Give your new set a name:</p>

                <form onSubmit={handleSubmit} className="save-set-form">
                    <input
                        type="text"
                        className="save-set-input"
                        value={setName}
                        onChange={(e) => setSetName(e.target.value)}
                        placeholder="e.g., My Difficult Words, Week 1 Review..."
                        autoFocus
                    />

                    <div className="save-set-actions">
                        <button type="button" className="save-set-btn cancel" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="save-set-btn save" disabled={!setName.trim()}>
                            Save Set
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaveSetModal;
// ========= END: bp-tango-dev/src/components/SaveSetModal.tsx (NEW FILE) =========
