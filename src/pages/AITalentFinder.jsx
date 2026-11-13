// src/pages/AITalentFinder.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Sparkles, Loader2, Star, User, ChevronRight } from 'lucide-react';

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
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Top Navigation */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" /> AI Powered
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Sparkles className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Describe your ideal player.
                    </h1>
                    <p className="text-lg text-gray-500 max-w-xl mx-auto">
                        Our AI reads your description and instantly scans the database to find the perfect tactical fit for your team.
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative mb-12 max-w-3xl mx-auto">
                    <div className="relative flex items-center">
                        <Search className="absolute left-5 w-6 h-6 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., A fast left-winger with high stamina who loves to press..."
                            className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-14 pr-40 py-5 text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !query.trim()}
                            className="absolute right-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                        </button>
                    </div>
                </form>

                {/* Results Area */}
                {isLoading && (
                    <div className="text-center py-16">
                        <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Analyzing player statistics and styles...</p>
                    </div>
                )}

                {!isLoading && hasSearched && results.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-3xl mx-auto">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No matches found</h3>
                        <p className="text-gray-500">Try adjusting your description to be more specific or broader.</p>
                    </div>
                )}

                {!isLoading && results.length > 0 && (
                    <div className="space-y-4 max-w-3xl mx-auto animate-fadeIn">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                Top AI Matches
                            </h3>
                            <span className="text-sm font-medium text-gray-400">
                                {results.length} results
                            </span>
                        </div>

                        {results.map((player) => (
                            <div
                                key={player.id}
                                onClick={() => navigate(`/players/${player.id}`)}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-5">
                                    {/* Avatar */}
                                    <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center shrink-0">
                                        <User className="w-6 h-6 text-gray-400" />
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                            {player.name}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {player.position} • {player.club || 'Free Agent'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {/* Rating */}
                                    <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-100">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-bold text-sm">{player.rating || 'N/A'}</span>
                                    </div>

                                    {/* Match Percentage */}
                                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                                        <span className="text-xs font-semibold text-green-700">Match</span>
                                        <span className="text-lg font-bold text-green-600">
                                            {Math.round(player.similarity * 100)}%
                                        </span>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default AITalentFinder;