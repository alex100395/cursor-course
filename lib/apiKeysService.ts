import { supabase } from './supabaseClient';
import type { ApiKey } from '../types/apiKey';

export const apiKeysService = {
  async fetchAll(): Promise<ApiKey[]> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, value, created_at, usage')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys from Supabase:', error);
      throw new Error('Failed to fetch API keys');
    }

    return (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      key: row.value,
      createdAt: row.created_at,
      lastUsed: undefined,
    }));
  },

  async create(name: string, key: string): Promise<void> {
    const { error } = await supabase.from('api_keys').insert({
      name,
      value: key,
      usage: 0,
    });

    if (error) {
      console.error('Error creating API key in Supabase:', error);
      const errorMessage =
        (error as any).message || JSON.stringify(error) || 'Failed to create API key';
      throw new Error(errorMessage);
    }
  },

  async update(id: string, name: string, key: string): Promise<void> {
    const { error } = await supabase
      .from('api_keys')
      .update({
        name,
        value: key,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating API key in Supabase:', error);
      throw new Error('Failed to update API key');
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('api_keys').delete().eq('id', id);

    if (error) {
      console.error('Error deleting API key in Supabase:', error);
      throw new Error('Failed to delete API key');
    }
  },

  async validate(apiKey: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id')
        .eq('value', apiKey)
        .limit(1);

      if (error) {
        console.error('Error validating API key in Supabase:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    }
  },
};

