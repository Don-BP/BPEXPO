import React, { useEffect } from 'react';

export interface AdProps {
    type?: 'banner' | 'rewarded';
    placement: string;
    onComplete?: () => void;
    onCancel?: () => void;
    onFailure?: (error: Error) => void;
}

const AdComponent: React.FC<AdProps> = ({ type = 'rewarded', placement, onComplete, onCancel }) => {

    // Simulate Rewarded Ad LifeCycle
    useEffect(() => {
        if (type === 'rewarded') {
            const timer = setTimeout(() => {
                if (onComplete) onComplete();
            }, 5000); // 5s mock ad

            return () => clearTimeout(timer);
        }
    }, [type, onComplete]);

    if (type === 'banner') {
        return (
            <div className="w-[300px] h-[50px] bg-gray-200 border border-gray-300 flex items-center justify-center text-xs text-gray-500 font-mono my-2 mx-auto">
                AD PLACEMENT: {placement}
            </div>
        );
    }

    // Rewarded is handled via modal usually, but if rendered inline:
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-slate-900 px-4 py-3 flex justify-between items-center text-white">
                    <span className="font-bold text-sm tracking-wide">ADVERTISEMENT</span>
                    <button onClick={onCancel} className="text-slate-400 hover:text-white px-2">✕</button>
                </div>

                <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4 text-2xl animate-pulse">
                        🎬
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Unlocking Content...</h3>
                    <p className="text-slate-500 text-sm mb-6">Please check out our sponsor to continue.</p>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-blue-600 animate-[width_5s_linear_forwards]" style={{ width: '0%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdComponent;
