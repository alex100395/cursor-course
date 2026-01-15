import { supabaseServer } from '../../../lib/supabaseServer';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  userId?: string;
}

const TABLE_NAME = 'api_keys';

export async function getAllApiKeys(userId?: string): Promise<ApiKey[]> {
  console.log('getAllApiKeys - Starting fetch from', TABLE_NAME);
  console.log('Using service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Query only the columns that actually exist in the table
  // Based on errors: table has 'value' not 'key', and no 'last_used' column
  let query = supabaseServer
    .from(TABLE_NAME)
    .select('id, name, value, created_at, usage, user_id')
    .order('created_at', { ascending: false });

  // Filter by user_id if provided
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getAllApiKeys - Supabase error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  console.log('getAllApiKeys - Fetched', data?.length || 0, 'rows');
  if (data && data.length > 0) {
    console.log('getAllApiKeys - Sample row:', JSON.stringify(data[0], null, 2));
  }

  return (
    data?.map((row: any) => ({
      id: row.id,
      name: row.name,
      key: row.value || '', // Use 'value' column (the actual column name)
      createdAt: row.created_at,
      lastUsed: undefined, // Column doesn't exist, so always undefined
      userId: row.user_id,
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

export async function createApiKey(name: string, key: string, userId?: string | null): Promise<ApiKey> {
  // Use 'value' field to match the table schema
  console.log('Creating API key with:', { name, keyLength: key.length, userId });
  console.log('Using Supabase client with service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Build insert data - user_id is optional for backward compatibility
  const insertData: any = { 
    name, 
    value: key, 
    usage: 0 
  };
  
  // Only add user_id if provided
  if (userId) {
    insertData.user_id = userId;
  }
  
  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .insert(insertData)
    .select('id, name, value, created_at, user_id')
    .single();

  if (error) {
    console.error('Error creating API key - Full error:', JSON.stringify(error, null, 2));
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    key: data.value, // Map 'value' to 'key' in the response
    createdAt: data.created_at,
    lastUsed: undefined, // Column doesn't exist
    userId: data.user_id,
  };
}

export async function updateApiKey(
  id: string,
  updates: Partial<Pick<ApiKey, 'name' | 'key'>>,
  userId?: string
): Promise<ApiKey | null> {
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.key !== undefined) {
    updateData.key = updates.key;
    updateData.value = updates.key; // Update both fields for compatibility
  }

  let query = supabaseServer
    .from(TABLE_NAME)
    .update(updateData)
    .eq('id', id);

  // If userId is provided, ensure the user owns this API key
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query
    .select('id, name, key, value, created_at, last_used, user_id')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    key: data.key || data.value, // Support both field names
    createdAt: data.created_at,
    lastUsed: data.last_used ?? undefined,
    userId: data.user_id,
  };
}

export async function deleteApiKey(id: string, userId?: string): Promise<boolean> {
  let query = supabaseServer.from(TABLE_NAME).delete().eq('id', id);
  
  // If userId is provided, ensure the user owns this API key
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { error } = await query;

  if (error) {
    throw error;
  }

  return true;
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    console.log('validateApiKey - Validating key (length:', apiKey.length, ')');
    
    // Only check 'value' column (the actual column name in the table)
    const { data, error } = await supabaseServer
      .from(TABLE_NAME)
      .select('id')
      .eq('value', apiKey)
      .limit(1);

    if (error) {
      console.error('Error validating API key in Supabase:', error);
      return false;
    }

    const isValid = data && data.length > 0;
    console.log('validateApiKey - Key is', isValid ? 'VALID' : 'INVALID');
    return isValid;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
}
