import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import TeacherToolsDashboard from './TeacherToolsDashboard';
import BeatChantGame from './tools/BeatChantGame';
import SnakesAndLaddersGame from './tools/SnakesAndLaddersGame';

const BeatChantPage = () => {
    const navigate = useNavigate();
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <BeatChantGame isFullscreen={true} onGoHome={() => navigate('/teacher-tools')} />
        </div>
    );
};

const SnakesAndLaddersPage = () => {
    const navigate = useNavigate();
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <SnakesAndLaddersGame isFullscreen={true} onGoHome={() => navigate('/teacher-tools')} />
        </div>
    );
};

const TeacherToolsApp = () => {
    return (
        <div className="h-full w-full overflow-auto bg-[#FFF9C4] relative">
            <Routes>
                <Route index element={<TeacherToolsDashboard />} />
                <Route path="beat-chant" element={<BeatChantPage />} />
                <Route path="snakes-and-ladders" element={<SnakesAndLaddersPage />} />
            </Routes>
        </div>
    );
};

export default TeacherToolsApp;
