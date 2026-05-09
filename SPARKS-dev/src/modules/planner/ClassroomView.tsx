// src/ClassroomView.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Minimize, Clock, CheckCircle2, Play, Pause, RotateCcw } from 'lucide-react';
import { LessonPlan } from './types';
import { safeParseArray } from './utils';

// Timer Component specifically for Classroom View
const LargeSectionTimer = ({ minutes }: { minutes: number }) => {
    const safeMinutes = isNaN(minutes) ? 5 : minutes;
    const [timeLeft, setTimeLeft] = useState(safeMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        setTimeLeft(safeMinutes * 60);
        setIsActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, [safeMinutes]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = window.setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(safeMinutes * 60);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const percentage = (timeLeft / (safeMinutes * 60)) * 100;

    let colorClass = "text-slate-700";
    let barClass = "text-teal-500";

    if (timeLeft < 60) {
        colorClass = "text-rose-600 animate-pulse";
        barClass = "text-rose-500";
    } else if (timeLeft < (safeMinutes * 60) * 0.25) {
        colorClass = "text-amber-600";
        barClass = "text-amber-500";
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                        className="text-slate-100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className={`${isActive ? barClass : 'text-slate-300'} transition-all duration-1000 ease-linear`}
                        strokeDasharray={`${percentage}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-mono font-bold ${colorClass}`}>{formatTime(timeLeft)}</span>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={toggleTimer} className={`p-2 rounded-full ${isActive ? 'bg-amber-100 text-amber-600' : 'bg-teal-100 text-teal-600'}`}>
                    {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={resetTimer} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export const ClassroomView = ({ plan, onClose }: { plan: LessonPlan; onClose: () => void }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col h-screen w-screen overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex-none bg-white border-b border-slate-200 p-4 shadow-sm z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{plan.title}</h1>
                    <div className="flex items-center gap-2 text-teal-700 font-medium">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Target: {plan.target}</span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-md"
                >
                    <Minimize className="w-5 h-5" />
                    <span className="hidden sm:inline">Exit Classroom Mode</span>
                </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* Timeline */}
                    <div className="space-y-6">
                        {safeParseArray(plan.sections).map((section: any, i: number) => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start">
                                {/* Timer Column */}
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-32 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                                    <LargeSectionTimer minutes={parseInt(section.time) || 5} />
                                    {/* CHANGED: Shows 'Part X' instead of duplicate phase name */}
                                    <span className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-wider">Part {i + 1}</span>
                                </div>

                                {/* Content Column */}
                                <div className="flex-grow space-y-4 w-full">
                                    {/* CHANGED: Uses section.phase as the main title */}
                                    <h3 className="text-2xl font-bold text-slate-800">{section.phase}</h3>
                                    <div className="text-lg text-slate-600 whitespace-pre-wrap leading-relaxed">
                                        {section.activity}
                                    </div>
                                    {section.instructions && (
                                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-900 italic text-base">
                                            Tips: {section.instructions}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Padding */}
                    <div className="h-20"></div>
                </div>
            </div>
        </div>
    );
};