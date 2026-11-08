// src/pages/AITalentFinder.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Sparkles, Loader2, Star } from 'lucide-react';
import { supabase } from '../lib/SupabaseClient';

const AITalentFinder = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setHasSearched(true);
        setResults([]);

        try {
            // Call the new Edge Function
            const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/search-players-ai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY}`
                },
                body: JSON.stringify({ query })
            });

            const data = await response.json();

            if (data.success && data.results) {
                setResults(data.results);
            } else {
                throw new Error(data.error || "Failed to search");
            }
        } catch (error) {
            console.error(error);
            alert("AI search failed. Check the console.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" /> AI Talent Finder
                    </h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 sm:p-6 mt-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-3">Describe your ideal player</h2>
                    <p className="text-gray-400">Our AI will read your description and find the closest matches in the database.</p>
                </div>

                <form onSubmit={handleSearch} className="relative mb-12">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., A fast left-winger with high stamina who loves to press..."
                            className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl pl-14 pr-32 py-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !query.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 text-black font-bold py-2 px-6 rounded-xl transition-all flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                        </button>
                    </div>
                </form>

                {/* Results Area */}
                {/* Results Area */}
                {!isLoading && results.length > 0 && (
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className="text-xl font-bold mb-4">Best Matches</h3>
                        {results.map((player) => (
                            <div key={player.id} className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-4 flex items-center justify-between hover:border-yellow-500/50 transition-colors cursor-pointer" onClick={() => navigate(`/players/${player.id}`)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold">
                                        {player.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{player.name}</h4>
                                        <p className="text-sm text-gray-400">{player.position} • {player.club || 'Free Agent'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-green-400 font-semibold mb-1 justify-end">
                                        <Star className="w-4 h-4 fill-current" /> {player.rating || 'N/A'}
                                    </div>
                                    <div className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">
                                        {Math.round(player.similarity * 100)}% Match
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}


                {!isLoading && hasSearched && results.length === 0 && (
                    <div className="text-center py-10 bg-gray-800/50 rounded-2xl border border-gray-700">
                        <p className="text-gray-400">No players matched that description. Try being more specific!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AITalentFinder;