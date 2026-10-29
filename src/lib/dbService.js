// src/lib/dbService.js
import { supabase } from './SupabaseClient';

// ==========================================
// PLAYERS
// ==========================================

export const fetchPlayers = async (filters = {}) => {
    // 1. Start the query: fetch public players
    let query = supabase
        .from('players')
        .select('*')
        .eq('profile_public', true);

    // 2. Apply server-side filters if provided
    if (filters.position) query = query.eq('position', filters.position);
    if (filters.nationality) query = query.ilike('nationality', `%${filters.nationality}%`);
    if (filters.club) query = query.ilike('club', `%${filters.club}%`);
    if (filters.minRating) query = query.gte('rating', Number(filters.minRating));

    // 3. Order by newest first (so your newly registered test players appear at the top!)
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error("Error in fetchPlayers:", error);
        throw error;
    }

    return data;
};

export const fetchPlayerById = async (id) => {
    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

// ==========================================
// TRANSFERS
// ==========================================

export const fetchTransfers = async (userId) => {
    const { data, error } = await supabase
        .from('transfers')
        .select(`
      *,
      player:players(name, position, club),
      from_user:profiles!transfers_from_user_id_fkey(full_name),
      to_user:profiles!transfers_to_user_id_fkey(full_name)
    `)
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Format for the UI
    return data.map(t => ({
        ...t,
        playerName: t.player?.name || t.player_name,
        fromName: t.from_user?.full_name || t.from_name,
        toName: t.to_user?.full_name || t.to_name,
    }));
};

export const updateTransferStatus = async (transferId, status) => {
    const { data, error } = await supabase
        .from('transfers')
        .update({ status })
        .eq('id', transferId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const createTransferOffer = async (offerData) => {
    const { data, error } = await supabase
        .from('transfers')
        .insert(offerData)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ==========================================
// NOTIFICATIONS
// ==========================================

export const fetchNotifications = async (userId) => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const markNotificationRead = async (id) => {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    if (error) throw error;
};

export const markAllNotificationsRead = async (userId) => {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
    if (error) throw error;
};

export const deleteNotification = async (id) => {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
    if (error) throw error;
};
// ==========================================
// DASHBOARD (Player Specific)
// ==========================================

export const fetchPlayerDashboardData = async (userId) => {
    // 1. Get Player ID and Stats
    const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (playerError) console.error("Player stats error:", playerError);

    // 2. Get Profile Views count
    const { count: viewsCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', playerData?.id)
        .eq('event_type', 'view');

    // 3. Get Active Offers count (transfers where the player is the subject)
    // Note: In a real app, transfers might be linked by player_id. 
    // For now, we'll count transfers where 'to_name' or 'player_name' matches the player.
    const { count: offersCount } = await supabase
        .from('transfers')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', playerData?.id)
        .in('status', ['pending', 'negotiating']);

    // 4. Get Watchlist count (how many scouts saved this player)
    const { count: watchlistCount } = await supabase
        .from('watchlists')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', playerData?.id);

    // 5. Get Recent Notifications (Activity Feed)
    const { data: activity } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(4);

    return {
        playerStats: playerData || null,
        stats: {
            views: viewsCount || 0,
            offers: offersCount || 0,
            interests: watchlistCount || 0,
            marketValue: playerData?.market_value || 'N/A',
        },
        recentActivity: activity || [],
    };
};
// src/lib/dbService.js

// ==========================================
// DASHBOARD (Scout Specific)
// ==========================================
export const fetchScoutDashboardData = async (userId) => {
    // 1. Get Watchlist Count and Player Details
    const { data: watchlistData } = await supabase
        .from('watchlists')
        .select(`
      id,
      created_at,
      player:players(id, name, position, age, rating, nationality)
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    const watchlistCount = watchlistData?.length || 0;

    // 2. Get Players Viewed Count (from analytics_events)
    const { count: viewsCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('viewer_id', userId)
        .eq('event_type', 'view');

    // 3. Get Recent Activity (Notifications)
    const { data: activity } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(4);

    // 4. Format Top Targets (Top 4 from watchlist)
    const topTargets = (watchlistData || [])
        .slice(0, 4)
        .map(w => w.player)
        .filter(Boolean); // Remove any nulls if player was deleted

    return {
        stats: {
            watchlist: watchlistCount,
            scouted: viewsCount || 0,
            // Since we don't have a "reports" table yet, we'll simulate this 
            // based on how many players you've watchlisted.
            reports: watchlistCount > 0 ? Math.floor(watchlistCount / 2) : 0,
        },
        topTargets,
        recentActivity: activity || [],
    };
};
// src/lib/dbService.js

// ==========================================
// DASHBOARD (Agent Specific)
// ==========================================
export const fetchAgentDashboardData = async (userId) => {
    // 1. Fetch Clients (Players managed by this agent)
    // We look for players where agent_id = userId (you may need to add this column to your players table later)
    // For now, we will just fetch a general list to display if the column doesn't exist yet.
    const { data: clients } = await supabase
        .from('players')
        .select('id, name, position, market_value, availability')
        .limit(5);

    // 2. Fetch Transfers involving this agent
    const { data: transfers } = await supabase
        .from('transfers')
        .select('*')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

    const openNegotiations = transfers?.filter(t => ['pending', 'negotiating'].includes(t.status)) || [];
    const closedDeals = transfers?.filter(t => t.status === 'accepted') || [];

    // 3. Calculate Commission (Mock calculation: 5% of closed deals)
    const totalCommission = closedDeals.reduce((sum, deal) => sum + (Number(deal.amount) * 0.05), 0);

    // 4. Recent Notifications
    const { data: activity } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(4);

    return {
        stats: {
            activeClients: clients?.length || 0,
            openNegotiations: openNegotiations.length,
            commission: totalCommission,
            closedDeals: closedDeals.length,
        },
        clients: clients || [],
        recentActivity: activity || [],
    };
};
// src/lib/dbService.js

// ==========================================
// DASHBOARD (Team Specific)
// ==========================================
export const fetchTeamDashboardData = async (userId) => {
    // 1. Fetch Available Players (Targets)
    const { data: availablePlayers } = await supabase
        .from('players')
        .select('*')
        .eq('availability', 'Available')
        .order('rating', { ascending: false })
        .limit(4);

    const { count: totalAvailable } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('availability', 'Available');

    // 2. Fetch Squad Size (Players under contract)
    const { count: squadSize } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('availability', 'Under Contract');

    // 3. Fetch Transfers involving this team
    const { data: transfers } = await supabase
        .from('transfers')
        .select('*')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

    const activeOffers = transfers?.filter(t => ['pending', 'negotiating'].includes(t.status)) || [];
    const acceptedDeals = transfers?.filter(t => t.status === 'accepted') || [];

    // Calculate Budget Spent
    const budgetSpent = acceptedDeals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);

    // 4. Recent Notifications
    const { data: activity } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(4);

    return {
        stats: {
            squadSize: squadSize || 0,
            activeOffers: activeOffers.length,
            budgetSpent: budgetSpent,
            totalAvailable: totalAvailable || 0,
        },
        topTargets: availablePlayers || [],
        recentActivity: activity || [],
    };
};
// src/lib/dbService.js

// ==========================================
// PLAYER VIDEOS
// ==========================================
export const fetchPlayerVideos = async (playerId) => {
    const { data, error } = await supabase
        .from('player_videos')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching videos:", error);
        return [];
    }
    return data;
};