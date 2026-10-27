// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/SupabaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Helper: Calculate age from Date of Birth
const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null); // full profile row
    const [isLoading, setIsLoading] = useState(true);

    // ------------------------------------------------
    // Helper: fetch the profiles row for a given auth user
    // ------------------------------------------------
    const fetchProfile = async (authUser) => {
        if (!authUser) return null;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle();

            if (error) {
                console.error('Error fetching profile:', error.message);
                return null;
            }

            // If profile doesn't exist yet, create it
            if (!data) {
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authUser.id,
                        email: authUser.email,
                        full_name:
                            authUser.user_metadata?.full_name ||
                            authUser.email.split('@')[0],
                        role: authUser.user_metadata?.role || 'player',
                        phone: authUser.user_metadata?.phone || null,
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error creating profile:', insertError.message);
                    return null;
                }

                return newProfile;
            }

            return data;
        } catch (err) {
            console.error('fetchProfile error:', err);
            return null;
        }
    };

    // ------------------------------------------------
    // Map auth user + profile → app user shape
    // ------------------------------------------------
    const buildUser = (authUser, profileRow) => {
        if (!authUser) return null;

        return {
            // Auth fields
            id: authUser.id,
            email: authUser.email,
            token: authUser.id,
            // Profile fields
            name:
                profileRow?.full_name ||
                authUser.user_metadata?.full_name ||
                authUser.email.split('@')[0],
            role:
                profileRow?.role ||
                authUser.user_metadata?.role ||
                'player',
            phone: profileRow?.phone || null,
            country: profileRow?.country || null,
            bio: profileRow?.bio || null,
            avatar_url: profileRow?.avatar_url || null,
            // Role-specific fields
            position: profileRow?.position || null,
            currentClub: profileRow?.current_club || null,
            nationality: profileRow?.nationality || null,
            dateOfBirth: profileRow?.date_of_birth || null,
            agencyName: profileRow?.agency_name || null,
            licenseNumber: profileRow?.license_number || null,
            scoutClub: profileRow?.scout_club || null,
            teamName: profileRow?.team_name || null,
            league: profileRow?.league || null,
            transferBudget: profileRow?.transfer_budget || null,
            // Preferences
            profilePublic: profileRow?.profile_public ?? true,
            showEmail: profileRow?.show_email ?? false,
            showPhone: profileRow?.show_phone ?? false,
            theme: profileRow?.theme || 'dark',
            language: profileRow?.language || 'en',
            // Timestamps
            createdAt: profileRow?.created_at || null,
            updatedAt: profileRow?.updated_at || null,
        };
    };

    // ------------------------------------------------
    // 1. Restore session on mount + listen for changes
    // ------------------------------------------------
    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!isMounted) return;

                if (session?.user) {
                    const profileRow = await fetchProfile(session.user);
                    if (!isMounted) return;
                    setProfile(profileRow);
                    setUser(buildUser(session.user, profileRow));
                } else {
                    setUser(null);
                    setProfile(null);
                }
            } catch (err) {
                console.error('initAuth error:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        initAuth();

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            if (session?.user) {
                const profileRow = await fetchProfile(session.user);
                if (!isMounted) return;
                setProfile(profileRow);
                setUser(buildUser(session.user, profileRow));
            } else {
                setUser(null);
                setProfile(null);
            }

            setIsLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // ------------------------------------------------
    // 2. LOGIN
    // ------------------------------------------------
    const login = async ({ email, password }) => {
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            const profileRow = await fetchProfile(data.user);
            setProfile(profileRow);
            setUser(buildUser(data.user, profileRow));

            return { success: true, user: data.user, profile: profileRow };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // ------------------------------------------------
    // 3. REGISTER (Updated to create Player Record)
    // ------------------------------------------------
    const register = async (formData) => {
        setIsLoading(true);

        try {
            // 1. Create the Auth User
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: formData.role,
                        phone: formData.phone,
                    },
                },
            });

            if (error) {
                return { success: false, error: error.message };
            }

            // If email confirmation is required (no session yet)
            if (data.user && !data.session) {
                return {
                    success: true,
                    user: data.user,
                    message: 'Please check your email to confirm your account.',
                };
            }

            // 2. If session exists (instant login), handle Role-Specific Data
            if (data.session?.user) {
                const userId = data.session.user.id;

                // ⭐ CREATE PLAYER RECORD ⭐
                if (formData.role === 'player') {
                    try {
                        const { error: playerError } = await supabase
                            .from('players')
                            .insert({
                                user_id: userId,
                                name: formData.fullName,
                                position: formData.position || 'Midfielder',
                                age: calculateAge(formData.dateOfBirth),
                                date_of_birth: formData.dateOfBirth || null,
                                nationality: formData.nationality || null,
                                club: formData.currentClub || 'Free Agent',
                                rating: 5.0,
                                availability: 'Available',
                                profile_public: true,
                            });

                        if (playerError) {
                            console.error('Failed to create player record:', playerError);
                        }
                    } catch (err) {
                        console.error('Player creation error:', err);
                    }
                }

                // 3. Wait briefly for trigger, then fetch profile
                await new Promise((r) => setTimeout(r, 500));
                const profileRow = await fetchProfile(data.session.user);

                // Fallback: Update role-specific fields in profiles table
                if (profileRow && formData.role) {
                    const updates = buildRoleFields(formData);
                    if (Object.keys(updates).length > 0) {
                        const { data: updated, error: updErr } = await supabase
                            .from('profiles')
                            .update(updates)
                            .eq('id', userId)
                            .select()
                            .single();

                        if (!updErr && updated) {
                            setProfile(updated);
                            setUser(buildUser(data.session.user, updated));
                            return { success: true, user: data.session.user, profile: updated };
                        }
                    }
                }

                setProfile(profileRow);
                setUser(buildUser(data.session.user, profileRow));
                return { success: true, user: data.session.user, profile: profileRow };
            }

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Helper: pick role-specific fields from formData
    const buildRoleFields = (data) => {
        const fields = {};
        if (data.role === 'player') {
            if (data.position) fields.position = data.position;
            if (data.currentClub) fields.current_club = data.currentClub;
            if (data.nationality) fields.nationality = data.nationality;
            if (data.dateOfBirth) fields.date_of_birth = data.dateOfBirth;
        }
        if (data.role === 'agent') {
            if (data.agencyName) fields.agency_name = data.agencyName;
            if (data.licenseNumber) fields.license_number = data.licenseNumber;
        }
        if (data.role === 'scout') {
            if (data.scoutClub) fields.scout_club = data.scoutClub;
            if (data.scoutLicense) fields.license_number = data.scoutLicense;
        }
        if (data.role === 'team') {
            if (data.teamName) fields.team_name = data.teamName;
            if (data.league) fields.league = data.league;
            if (data.transferBudget) fields.transfer_budget = Number(data.transferBudget);
        }
        return fields;
    };

    // ------------------------------------------------
    // 4. LOGOUT
    // ------------------------------------------------
    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // ------------------------------------------------
    // 5. UPDATE USER
    // ------------------------------------------------
    const updateUser = async (updates) => {
        try {
            if (!user?.id) throw new Error('Not authenticated');

            const dbUpdates = {};
            if (updates.name !== undefined) dbUpdates.full_name = updates.name;
            if (updates.email !== undefined) dbUpdates.email = updates.email;
            if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
            if (updates.country !== undefined) dbUpdates.country = updates.country;
            if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
            if (updates.avatar_url !== undefined) dbUpdates.avatar_url = updates.avatar_url;

            // Role-specific
            if (updates.position !== undefined) dbUpdates.position = updates.position;
            if (updates.currentClub !== undefined) dbUpdates.current_club = updates.currentClub;
            if (updates.nationality !== undefined) dbUpdates.nationality = updates.nationality;
            if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth;
            if (updates.agencyName !== undefined) dbUpdates.agency_name = updates.agencyName;
            if (updates.licenseNumber !== undefined) dbUpdates.license_number = updates.licenseNumber;
            if (updates.scoutClub !== undefined) dbUpdates.scout_club = updates.scoutClub;
            if (updates.teamName !== undefined) dbUpdates.team_name = updates.teamName;
            if (updates.league !== undefined) dbUpdates.league = updates.league;
            if (updates.transferBudget !== undefined) dbUpdates.transfer_budget = updates.transferBudget;

            // Preferences
            if (updates.profilePublic !== undefined) dbUpdates.profile_public = updates.profilePublic;
            if (updates.showEmail !== undefined) dbUpdates.show_email = updates.showEmail;
            if (updates.showPhone !== undefined) dbUpdates.show_phone = updates.showPhone;
            if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
            if (updates.language !== undefined) dbUpdates.language = updates.language;

            const { data, error } = await supabase
                .from('profiles')
                .update(dbUpdates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            setProfile(data);
            setUser((prev) => ({ ...prev, ...updates }));

            return { success: true, profile: data };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: error.message };
        }
    };
    // ------------------------------------------------
    // 7. UPLOAD AVATAR
    // ------------------------------------------------
    const uploadAvatar = async (file) => {
        try {
            if (!user?.id) throw new Error('Not authenticated');

            // 1. Create a unique file name (e.g., userId-timestamp.jpg)
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 2. Upload the file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 3. Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 4. Save the URL to the profiles table
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // 5. Update local state
            setUser((prev) => ({ ...prev, avatar_url: publicUrl }));
            setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));

            return { success: true, url: publicUrl };
        } catch (error) {
            console.error('Error uploading avatar:', error);
            return { success: false, error: error.message };
        }
    };

    // ------------------------------------------------
    // 6. REFRESH PROFILE
    // ------------------------------------------------
    const refreshProfile = async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user) return null;

            const profileRow = await fetchProfile(session.user);
            setProfile(profileRow);
            setUser(buildUser(session.user, profileRow));
            return profileRow;
        } catch (err) {
            console.error('refreshProfile error:', err);
            return null;
        }
    };

    const value = {
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refreshProfile,
        uploadAvatar,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};