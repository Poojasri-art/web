import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';

// Core
import Home from './pages/Home';
import Splash from './pages/Splash';
import Intro from './pages/Intro';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Modules
import ModuleIntro from './pages/ModuleIntro';
import ModuleHome from './pages/ModuleHome';
import Session from './pages/Session';

// Profile
import Profile from './pages/Profile';
import UpdateInfo from './pages/UpdateInfo';
import ResetAccount from './pages/ResetAccount';
import Privacy from './pages/Privacy';

// Progress/Data
import ProgressDashboard from './pages/ProgressDashboard';
import SavedProgress from './pages/SavedProgress';

// Tasks
import TaskView from './pages/TaskView';
import NBack from './pages/Tasks/NBack';
import SART from './pages/Tasks/SART';
import SRT from './pages/Tasks/SRT';
import StroopTask from './pages/Tasks/StroopTask';
import TaskSwitch from './pages/Tasks/TaskSwitch';

// Simple Route Protection Wrapper
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Splash />} />
                        <Route path="/intro" element={<Intro />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Register />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* Protected App Routes with Layout */}
                        <Route path="/home" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
                        <Route path="/module-intro/:type" element={<ProtectedRoute><Layout><ModuleIntro /></Layout></ProtectedRoute>} />
                        <Route path="/module/:type" element={<ProtectedRoute><Layout><ModuleHome /></Layout></ProtectedRoute>} />
                        <Route path="/session" element={<ProtectedRoute><Layout><Session /></Layout></ProtectedRoute>} />

                        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
                        <Route path="/update-info" element={<ProtectedRoute><Layout><UpdateInfo /></Layout></ProtectedRoute>} />
                        <Route path="/reset-account" element={<ProtectedRoute><Layout><ResetAccount /></Layout></ProtectedRoute>} />
                        <Route path="/privacy" element={<ProtectedRoute><Layout><Privacy /></Layout></ProtectedRoute>} />

                        <Route path="/progress" element={<ProtectedRoute><Layout><ProgressDashboard /></Layout></ProtectedRoute>} />
                        <Route path="/progress-dashboard" element={<ProtectedRoute><Layout><ProgressDashboard /></Layout></ProtectedRoute>} />
                        <Route path="/saved-progress" element={<ProtectedRoute><Layout><SavedProgress /></Layout></ProtectedRoute>} />

                        <Route path="/task/generic/:type" element={<ProtectedRoute><Layout><TaskView /></Layout></ProtectedRoute>} />
                        <Route path="/task/nback" element={<ProtectedRoute><Layout><NBack /></Layout></ProtectedRoute>} />
                        <Route path="/task/sart" element={<ProtectedRoute><Layout><SART /></Layout></ProtectedRoute>} />
                        <Route path="/task/srt" element={<ProtectedRoute><Layout><SRT /></Layout></ProtectedRoute>} />
                        <Route path="/task/stroop" element={<ProtectedRoute><Layout><StroopTask /></Layout></ProtectedRoute>} />
                        <Route path="/task/switch" element={<ProtectedRoute><Layout><TaskSwitch /></Layout></ProtectedRoute>} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}
