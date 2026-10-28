// src/components/dashboard/UploadHighlightModal.jsx
import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Video, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/SupabaseClient';
import { useAuth } from '../../context/AuthContext';

const UploadHighlightModal = ({ isOpen, onClose, playerId, onSuccess }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        // Check file size (max 50MB for videos)
        if (selected.size > 50 * 1024 * 1024) {
            setError('File is too large. Maximum size is 50MB.');
            return;
        }
        // Check file type
        if (!selected.type.startsWith('video/')) {
            setError('Please select a valid video file (MP4, WebM, etc).');
            return;
        }

        setError('');
        setFile(selected);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title.trim() || !playerId) {
            setError('Please provide a title and select a video.');
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            // 1. Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${playerId}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('videos')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('videos')
                .getPublicUrl(fileName);

            // 3. Save to Database
            const { error: dbError } = await supabase
                .from('player_videos')
                .insert({
                    player_id: playerId,
                    title: title,
                    video_url: publicUrl,
                });

            if (dbError) throw dbError;

            // Success!
            setTitle('');
            setFile(null);
            onSuccess(); // Tell parent to refresh
            onClose();

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to upload video.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-md w-full p-6">

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Video className="w-5 h-5 text-blue-400" /> Upload Highlight
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Video Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Best Goals 2024"
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Select Video</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-600 hover:border-blue-500 bg-gray-700/30 rounded-xl p-8 text-center cursor-pointer transition-colors"
                        >
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-300 font-medium">
                                {file ? file.name : 'Click to browse your files'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">MP4, WebM up to 50MB</p>
                        </div>
                        <input
                            type="file"
                            accept="video/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUploading}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading || !file}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            {isUploading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                            ) : (
                                'Upload'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadHighlightModal;