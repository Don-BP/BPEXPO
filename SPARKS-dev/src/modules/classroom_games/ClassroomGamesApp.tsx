import React, { useRef } from 'react';
import { useIframeMonetization } from '../../hooks/useIframeMonetization';
import AdModal from '../../components/monetization/AdModal';

const ClassroomGamesApp = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { adRequest, handleAdComplete, handleAdCancel, sendState } = useIframeMonetization(iframeRef);

    return (
        <div className="h-full w-full overflow-hidden bg-slate-900 relative">
            <AdModal
                isOpen={!!adRequest}
                featureName={adRequest?.featureName || 'Game'}
                onComplete={handleAdComplete}
                onCancel={handleAdCancel}
            />
            <iframe
                ref={iframeRef}
                src="/classroom_games/index.html"
                title="Classroom Games"
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={sendState}
            />
        </div>
    );
};

export default ClassroomGamesApp;
