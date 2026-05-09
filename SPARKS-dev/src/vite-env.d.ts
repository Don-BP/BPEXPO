// vite-env.d.ts

/// <reference types="vite/client" />

interface Window {
    webkitSpeechRecognition: any;
}

declare namespace NodeJS {
    interface ProcessEnv {
        readonly API_KEY: string;
        readonly GEMINI_API_KEY: string;
    }
}