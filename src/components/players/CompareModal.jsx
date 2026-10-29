// src/components/players/CompareModal.jsx
import React from 'react';
import { X, TrendingUp, Building2, Globe } from 'lucide-react';

const CompareModal = ({ players, onClose }) => {
    // ⭐ Fallback: If the modal somehow opens with no players, close it immediately
    if (!players || players.length === 0) {
        onClose();
        return null;
    }

    const attributes = [
        { key: 'rating', label: 'Overall', color: 'bg-yellow-500' },
        { key: 'pace', label: 'Pace', color: 'bg-green-500' },
        { key: 'shooting', label: 'Shooting', color: 'bg-red-500' },
        { key: 'passing', label: 'Passing', color: 'bg-blue-500' },
        { key: 'dribbling', label: 'Dribbling', color: 'bg-purple-500' },
        { key: 'defending', label: 'Defending', color: 'bg-cyan-500' },
        { key: 'physical', label: 'Physical', color: 'bg-orange-500' },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full my-8">

                <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10 rounded-t-2xl">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" /> Player Comparison
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 border-b border-gray-700 grid gap-4" style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}>
                    {players.map((player) => (
                        <div key={player.id} className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                                {player.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <h3 className="font-bold text-lg truncate">{player.name}</h3>
                            <p className="text-sm text-gray-400 mb-2">{player.position}</p>
                            <div className="flex flex-col items-center gap-1 text-xs text-gray-400 mb-2">
                                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {player.club || 'Free Agent'}</span>
                                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {player.nationality || 'Unknown'}</span>
                            </div>
                            <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                                {player.market_value || 'N/A'}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 space-y-6">
                    {attributes.map((attr) => {
                        // Ensure we parse as numbers, defaulting to 0 if null/undefined
                        const values = players.map(p => Number(p[attr.key]) || 0);
                        const maxVal = Math.max(...values);

                        return (
                            <div key={attr.key}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-300 w-24">{attr.label}</span>
                                    <div className="flex-1 grid gap-4" style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}>
                                        {players.map((player) => {
                                            const val = Number(player[attr.key]) || 0;
                                            const isBest = val === maxVal && maxVal > 0;
                                            return (
                                                <div key={player.id} className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${attr.color} rounded-full transition-all duration-500`}
                                                            style={{ width: `${val}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`text-xs font-bold w-6 text-right ${isBest ? 'text-green-400' : 'text-gray-400'}`}>
                                                        {val}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default CompareModal;