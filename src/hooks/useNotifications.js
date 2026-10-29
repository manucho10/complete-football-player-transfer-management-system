// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/SupabaseClient';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        // 1. Fetch initial count
        const fetchUnreadCount = async () => {
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('read', false);

            setUnreadCount(count || 0);
        };

        fetchUnreadCount();

        // 2. Listen for new notifications in Real-Time
        const channel = supabase
            .channel('user-notifications')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for INSERTs and UPDATEs (when marked as read)
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    // Whenever something changes, just re-fetch the count
                    fetchUnreadCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return unreadCount;
};