import { createServerClient } from './supabaseClient';

export interface UserProfile {
    id: string;
    user_id: string | null;
    phone: string;
    email: string | null;
    name: string;
    created_at: string;
    updated_at: string;
}

/**
 * Create or update user profile
 * For guests: uses phone as identifier
 * For authenticated users: links to auth.users.id
 */
export async function createOrUpdateUserProfile(data: {
    phone: string;
    name: string;
    email?: string | null;
    user_id?: string | null;
}): Promise<UserProfile | null> {
    const supabase = createServerClient();

    // Check if profile exists by phone
    const { data: existingProfile } = await (supabase
        .from('user_profile') as any)
        .select('*')
        .eq('phone', data.phone)
        .single();

    if (existingProfile) {
        // Update existing profile
        const { data: updatedProfile, error } = await (supabase
            .from('user_profile') as any)
            .update({
                name: data.name,
                email: data.email || existingProfile.email,
                user_id: data.user_id || existingProfile.user_id,
                updated_at: new Date().toISOString(),
            })
            .eq('id', existingProfile.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating user profile:', error);
            return null;
        }

        return updatedProfile;
    } else {
        // Create new profile
        const { data: newProfile, error } = await (supabase
            .from('user_profile') as any)
            .insert({
                phone: data.phone,
                name: data.name,
                email: data.email || null,
                user_id: data.user_id || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating user profile:', error);
            return null;
        }

        return newProfile;
    }
}

/**
 * Get user profile by phone
 */
export async function getUserProfileByPhone(phone: string): Promise<UserProfile | null> {
    const supabase = createServerClient();

    const { data, error } = await (supabase
        .from('user_profile') as any)
        .select('*')
        .eq('phone', phone)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No rows returned
            return null;
        }
        console.error('Error fetching user profile:', error);
        return null;
    }

    return data;
}

/**
 * Get user profile by user_id (for authenticated users)
 */
export async function getUserProfileByUserId(userId: string): Promise<UserProfile | null> {
    const supabase = createServerClient();

    const { data, error } = await (supabase
        .from('user_profile') as any)
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No rows returned
            return null;
        }
        console.error('Error fetching user profile:', error);
        return null;
    }

    return data;
}
