import React from 'react';
import { User, Briefcase, Search, Shield } from 'lucide-react';

export const roleConfig = {
    player: {
        icon: <User className="w-5 h-5" />,
        label: 'Player',
        color: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
    },
    agent: {
        icon: <Briefcase className="w-5 h-5" />,
        label: 'Agent',
        color: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
    },
    scout: {
        icon: <Search className="w-5 h-5" />,
        label: 'Scout',
        color: 'from-green-500 to-green-600',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-400',
    },
    team: {
        icon: <Shield className="w-5 h-5" />,
        label: 'Team',
        color: 'from-red-500 to-red-600',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
    },
};