import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRevenueCatInit } from './hooks/useRevenueCat';

const PlannerApp = lazy(() => import('./modules/planner/PlannerApp'));
const DiscoveryApp = lazy(() => import('./modules/discovery/DiscoveryApp'));
const TangoApp = lazy(() => import('./modules/tango/TangoApp'));
const TeacherToolsApp = lazy(() => import('./modules/teacher_tools/TeacherToolsApp'));
const ClassroomGamesApp = lazy(() => import('./modules/classroom_games/ClassroomGamesApp'));

const AdminShell    = lazy(() => import('./modules/admin/AdminShell'));
const AdminOverview = lazy(() => import('./modules/admin/pages/AdminOverview'));
const AdsPage       = lazy(() => import('./modules/admin/pages/AdsPage'));
const SocialPage    = lazy(() => import('./modules/admin/pages/SocialPage'));
const EmailPage     = lazy(() => import('./modules/admin/pages/EmailPage'));
const ResearchPage  = lazy(() => import('./modules/admin/pages/ResearchPage'));
const AutoLearnPage = lazy(() => import('./modules/admin/pages/AutoLearnPage'));
const AnalyticsPage = lazy(() => import('./modules/admin/pages/AnalyticsPage'));
const ContentPage   = lazy(() => import('./modules/admin/pages/ContentPage'));

const DashboardApp   = lazy(() => import('./modules/dashboard/DashboardApp'));
const LandingPage    = lazy(() => import('./pages/LandingPage'));
const PricingPage    = lazy(() => import('./pages/PricingPage'));
const PrivacyPolicy  = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Support        = lazy(() => import('./pages/Support'));
const Paywall        = lazy(() => import('./pages/Paywall'));

import ScrollToTop from './components/ScrollToTop';
import AdminGuard from './modules/admin/AdminGuard';
import { AuthProvider, useAuth } from './context/AuthContext';
import WalletStatus from './components/debug/WalletStatus';
import Login from './components/auth/Login';
import { AuthCallback } from './pages/AuthCallback';

const Loader = () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
);

const RootRoute: React.FC = () => {
    const { user } = useAuth();
    if (user) return <Navigate to="/hub" replace />;
    return <LandingPage />;
};

const AppInner: React.FC = () => {
    const { user } = useAuth();
    useRevenueCatInit(user?.id ?? null);

    return (
        <>
            <ScrollToTop />
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path="/" element={<RootRoute />} />
                    <Route path="/hub" element={
                        <>
                            <DashboardApp />
                            <WalletStatus />
                        </>
                    } />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/paywall" element={<Paywall />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms"   element={<TermsOfService />} />
                    <Route path="/support" element={<Support />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route
                        path="/admin/*"
                        element={
                            <AdminGuard>
                                <AdminShell />
                            </AdminGuard>
                        }
                    >
                        <Route index element={<AdminOverview />} />
                        <Route path="ads"       element={<AdsPage />} />
                        <Route path="social"    element={<SocialPage />} />
                        <Route path="email"     element={<EmailPage />} />
                        <Route path="research"  element={<ResearchPage />} />
                        <Route path="autolearn" element={<AutoLearnPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="content"   element={<ContentPage />} />
                        <Route path="*"         element={<AdminOverview />} />
                    </Route>

                    <Route path="/planner/*"         element={<PlannerApp />} />
                    <Route path="/discovery/*"       element={<DiscoveryApp />} />
                    <Route path="/tango/*"           element={<TangoApp />} />
                    <Route path="/teacher-tools/*"   element={<TeacherToolsApp />} />
                    <Route path="/classroom-games/*" element={<ClassroomGamesApp />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppInner />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
