import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface AdModalProps {
    isOpen: boolean;
    featureName: string;
    onComplete: () => void;
    onCancel: () => void;
}

const AdModal: React.FC<AdModalProps> = ({ isOpen, featureName, onComplete, onCancel }) => {
    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => {
            onComplete();
        }, 5000);
        return () => clearTimeout(timer);
    }, [isOpen, onComplete]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                    <span className="text-white font-bold tracking-wide">ADVERTISEMENT</span>
                    <button onClick={onCancel} className="text-slate-400 hover:text-white">✕</button>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-3xl">
                        🎬
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Unlocking {featureName}</h3>
                    <p className="text-slate-600 mb-6">
                        Please wait while we prepare your content...
                    </p>

                    {/* Progress Bar Simulation */}
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
                        <div className="h-full bg-blue-600 animate-[width_5s_linear_forwards]" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-xs text-slate-400">Ad plays for 5 seconds</span>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AdModal;
