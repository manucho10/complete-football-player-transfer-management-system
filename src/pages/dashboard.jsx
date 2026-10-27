// src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import PlayerDashboard from './Dashboards/PlayerDashboard';
import AgentDashboard from './Dashboards/AgentDashboard';
import ScoutDashboard from './Dashboards/ScoutDashboard';
import TeamDashboard from './Dashboards/TeamDashboard';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, isLoading, isAuthenticated } = useAuth();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading dashboard...</div>
            </div>
        );
    }

    // Not logged in (redirect is in-flight)
    if (!user) return null;

    // Route to the correct dashboard
    switch (user.role) {
        case 'agent':
            return <AgentDashboard user={user} />;
        case 'scout':
            return <ScoutDashboard user={user} />;
        case 'team':
            return <TeamDashboard user={user} />;
        case 'player':
        default:
            return <PlayerDashboard user={user} />;
    }
};

export default Dashboard;