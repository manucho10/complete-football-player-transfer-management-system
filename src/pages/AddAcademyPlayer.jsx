import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/SupabaseClient';

const AddAcademyPlayer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '', position: '', age: '', nationality: '', bio: '', is_grassroots: true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // 1. Ensure we only send valid columns to the database
        const payload = {
            name: formData.name,
            position: formData.position,
            age: Number(formData.age),
            nationality: formData.nationality,
            bio: formData.bio,
            academy_id: user.id,
            club: user.name || 'Local Academy',
            availability: 'Available',
            profile_public: true,
            is_grassroots: true,
            rating: 5.0 // Default rating for new players
        };

        console.log("Sending to Supabase:", payload);

        // 2. Perform the insert and CHECK FOR ERRORS
        const { data, error } = await supabase
            .from('players')
            .insert(payload)
            .select();

        setIsSaving(false);

        if (error) {
            // ⭐ THIS will show you exactly why it failed
            console.error("Supabase Insert Error:", error);
            alert(`Failed to save player: ${error.message} \nDetails: ${error.details}`);
            return;
        }

        // Success!
        navigate('/my-academy');
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6">
            <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Plus className="w-6 h-6 text-orange-600" /> Add Grassroots Player
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Position</label>
                            <select required value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500">
                                <option value="">Select</option>
                                <option>Goalkeeper</option><option>Defender</option><option>Midfielder</option><option>Forward</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Age</label>
                            <input type="number" required value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nationality</label>
                            <input type="text" required value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Short Bio</label>
                        <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 resize-none" />
                    </div>

                    <button type="submit" disabled={isSaving} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                        {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Player</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddAcademyPlayer;