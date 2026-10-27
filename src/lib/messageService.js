// src/lib/messageService.js
import { supabase } from './SupabaseClient';

// 1. Fetch all conversations for the current user
export const getConversations = async (userId) => {
    // Fetch raw conversations
    const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

    if (convError) {
        console.error("Supabase error fetching conversations:", convError);
        return [];
    }

    if (!conversations || conversations.length === 0) return [];

    // Extract all unique user IDs from the conversations (excluding ourselves)
    const otherUserIds = conversations.map((conv) =>
        conv.user1_id === userId ? conv.user2_id : conv.user1_id
    );

    // Fetch the profiles for those user IDs
    const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .in('id', otherUserIds);

    if (profError) {
        console.error("Supabase error fetching profiles:", profError);
    }

    // Map it all together
    return conversations.map((conv) => {
        const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
        const otherProfile = profiles?.find((p) => p.id === otherUserId) || {};

        return {
            id: conv.id,
            participant: {
                id: otherUserId,
                name: otherProfile.full_name || 'Unknown User',
                role: otherProfile.role || 'player',
                avatar: otherProfile.avatar_url,
            },
            lastMessage: conv.last_message || 'Start a conversation',
            lastTime: new Date(conv.last_message_at || conv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: 0,
        };
    });
};

// ... (Keep getMessages, sendMessage, getOrCreateConversation as they were)

// 2. Fetch messages for a specific conversation
export const getMessages = async (conversationId) => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }

    return data.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        text: msg.text,
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: msg.read,
        attachment: msg.attachment_url ? { name: msg.attachment_name, url: msg.attachment_url } : null,
    }));
};

// 3. Send a new message
export const sendMessage = async (conversationId, senderId, text, attachment = null) => {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: senderId,
            text: text,
            attachment_url: attachment?.url || null,
            attachment_name: attachment?.name || null,
            attachment_type: attachment?.type || null,
        })
        .select()
        .single();

    if (error) throw error;

    // Update the conversation's last_message and timestamp
    await supabase
        .from('conversations')
        .update({
            last_message: text || '📎 Attachment',
            last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

    return data;
};

// 4. Create a new conversation (if one doesn't exist)
export const getOrCreateConversation = async (currentUserId, otherUserId) => {
    // Check if it exists
    const { data: existing, error: findError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${currentUserId})`)
        .maybeSingle();

    if (existing) return existing.id;

    // If not, create it
    const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
            user1_id: currentUserId,
            user2_id: otherUserId,
        })
        .select()
        .single();

    if (createError) throw createError;
    return newConv.id;
};