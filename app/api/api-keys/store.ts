import { supabaseServer } from '../../../lib/supabaseServer';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

const TABLE_NAME = 'api_keys';

export async function getAllApiKeys(): Promise<ApiKey[]> {
  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .select('id, name, key, created_at, last_used')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (
    data?.map((row: any) => ({
      id: row.id,
      name: row.name,
      key: row.key,
      createdAt: row.created_at,
      lastUsed: row.last_used ?? undefined,
    })) ?? []
  );
}

export async function getApiKeyById(id: string): Promise<ApiKey | null> {
  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .select('id, name, key, created_at, last_used')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    key: data.key,
    createdAt: data.created_at,
    lastUsed: data.last_used ?? undefined,
  };
}

export async function createApiKey(name: string, key: string): Promise<ApiKey> {
  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .insert({ name, key })
    .select('id, name, key, created_at, last_used')
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    key: data.key,
    createdAt: data.created_at,
    lastUsed: data.last_used ?? undefined,
  };
}

export async function updateApiKey(
  id: string,
  updates: Partial<Pick<ApiKey, 'name' | 'key'>>
): Promise<ApiKey | null> {
  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.key !== undefined && { key: updates.key }),
    })
    .eq('id', id)
    .select('id, name, key, created_at, last_used')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    key: data.key,
    createdAt: data.created_at,
    lastUsed: data.last_used ?? undefined,
  };
}

export async function deleteApiKey(id: string): Promise<boolean> {
  const { error } = await supabaseServer.from(TABLE_NAME).delete().eq('id', id);

  if (error) {
    throw error;
  }

  return true;
}
