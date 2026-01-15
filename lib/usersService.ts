import { supabaseServer } from './supabaseServer';
import { supabase } from './supabaseClient';

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

const TABLE_NAME = 'users';

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    image: data.image,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    image: data.image,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Create or update user (upsert)
 * This is typically called after authentication
 */
export async function upsertUser(
  id: string,
  email: string,
  name?: string | null,
  image?: string | null
): Promise<User> {
  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .upsert(
      {
        id,
        email,
        name: name || null,
        image: image || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting user:', error);
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    image: data.image,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Get current authenticated user's profile
 * Uses client-side Supabase instance (respects RLS)
 */
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error) {
    console.error('Error fetching current user:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    image: data.image,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Update current user's profile
 * Uses client-side Supabase instance (respects RLS)
 */
export async function updateCurrentUser(
  updates: Partial<Pick<User, 'name' | 'image'>>
): Promise<User | null> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', authUser.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    image: data.image,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
