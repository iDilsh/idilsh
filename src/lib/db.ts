// Database client using Supabase (for Vercel) or local SQLite (for development)
// Supabase uses PostgREST HTTP API — no native modules, works perfectly on Vercel serverless

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============ Types ============

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  youtubeId: string;
  thumbnail: string | null;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

export interface DbResult {
  rows: Record<string, unknown>[];
  columns: string[];
}

// ============ Database Mode Detection ============

function getDatabaseMode(): 'supabase' | 'local' {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (url && key) return 'supabase';
  return 'local';
}

// ============ Supabase Client ============

let cachedSupabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!cachedSupabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
    }
    cachedSupabase = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return cachedSupabase;
}

// ============ Format Helpers ============

function formatBlogPost(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    title: row.title as string,
    excerpt: row.excerpt as string,
    content: row.content as string,
    imageUrl: row.imageUrl as string | null,
    category: row.category as string,
    published: Boolean(row.published),
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

function formatVideo(row: Record<string, unknown>): Video {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | null,
    youtubeId: row.youtubeId as string,
    thumbnail: row.thumbnail as string | null,
    category: row.category as string,
    published: Boolean(row.published),
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

function formatSiteSetting(row: Record<string, unknown>): SiteSetting {
  return {
    id: row.id as string,
    key: row.key as string,
    value: row.value as string,
  };
}

// ============ Generate ID ============

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const randomPart2 = Math.random().toString(36).substring(2, 10);
  return `c${timestamp}${randomPart}${randomPart2}`;
}

// ============ Raw SQL Execute (for local SQLite fallback) ============

export async function execute(sql: string, args: unknown[] = []): Promise<DbResult> {
  const { createClient: createLibsqlClient } = await import('@libsql/client');
  const client = createLibsqlClient({ url: 'file:./db/custom.db' });
  try {
    const result = await client.execute({ sql, args: args as import('@libsql/client').InValue[] });
    const rows = result.rows.map((row) => {
      const obj: Record<string, unknown> = {};
      result.columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
    return { rows, columns: result.columns };
  } finally {
    client.close();
  }
}

// ============ Blog Post CRUD ============

export async function getBlogPosts(includeUnpublished = false): Promise<BlogPost[]> {
  if (getDatabaseMode() === 'supabase') {
    const supabase = getSupabase();
    let query = supabase.from('BlogPost').select('*').order('createdAt', { ascending: false });
    if (!includeUnpublished) {
      query = query.eq('published', 1);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return (data || []).map(formatBlogPost);
  } else {
    const result = includeUnpublished
      ? await execute('SELECT * FROM "BlogPost" ORDER BY "createdAt" DESC')
      : await execute('SELECT * FROM "BlogPost" WHERE published = 1 ORDER BY "createdAt" DESC');
    return result.rows.map(formatBlogPost);
  }
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  if (getDatabaseMode() === 'supabase') {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('BlogPost').select('*').eq('id', id).single();
    if (error) return null;
    return data ? formatBlogPost(data) : null;
  } else {
    const result = await execute('SELECT * FROM "BlogPost" WHERE id = ?', [id]);
    return result.rows.length > 0 ? formatBlogPost(result.rows[0]) : null;
  }
}

export async function createBlogPost(data: {
  title: string;
  excerpt?: string;
  content?: string;
  imageUrl?: string | null;
  category?: string;
  published?: boolean;
}): Promise<BlogPost> {
  const id = generateId();
  const now = new Date().toISOString();

  if (getDatabaseMode() === 'supabase') {
    const supabase = getSupabase();
    const row = {
      id,
      title: data.title,
      excerpt: data.excerpt || '',
      content: data.content || '',
      imageUrl: data.imageUrl || null,
      category: data.category || 'Dharma',
      published: data.published ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    };
    const { data: inserted, error } = await supabase.from('BlogPost').insert(row).select().single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return formatBlogPost(inserted);
  } else {
    await execute(
      `INSERT INTO "BlogPost" (id, title, excerpt, content, "imageUrl", category, published, "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.title, data.excerpt || '', data.content || '', data.imageUrl || null, data.category || 'Dharma', data.published ? 1 : 0, now, now]
    );
    const result = await execute('SELECT * FROM "BlogPost" WHERE id = ?', [id]);
    if (result.rows.length === 0) throw new Error('Failed to create blog post');
    return formatBlogPost(result.rows[0]);
  }
}

export async function updateBlogPost(id: string, data: {
  title?: string;
  excerpt?: string;
  content?: string;
  imageUrl?: string | null;
  category?: string;
  published?: boolean;
}): Promise<BlogPost> {
  const now = new Date().toISOString();

  if (getDatabaseMode() === 'supabase') {
    const supabase = getSupabase();
    const updateData: Record<string, unknown> = { updatedAt: now };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.published !== undefined) updateData.published = data.published ? 1 : 0;

    const { data: updated, error } = await supabase.from('BlogPost').update(updateData).eq('id', id).select().single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (!updated) throw new Error('Blog post not found');
    return formatBlogPost(updated);
  } else {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.title !== undefined) { updates.push("title = ?"); values.push(data.title); }
    if (data.excerpt !== undefined) { updates.push("excerpt = ?"); values.push(data.excerpt); }
    if (data.content !== undefined) { updates.push("content = ?"); values.push(data.content); }
    if (data.imageUrl !== undefined) { updates.push('"imageUrl" = ?'); values.push(data.imageUrl); }
    if (data.category !== undefined) { updates.push("category = ?"); values.push(data.category); }
    if (data.published !== undefined) { updates.push("published = ?"); values.push(data.published ? 1 : 0); }

    if (updates.length === 0) throw new Error('No fields to update');

    updates.push('"updatedAt" = ?');
    values.push(now);
    values.push(id);

    await execute(`UPDATE "BlogPost" SET ${updates.join(", ")} WHERE id = ?`, values);

    const result = await execute('SELECT * FROM "BlogPost" WHERE id = ?', [id]);
    if (result.rows.length === 0) throw new Error('Blog post not found');
    return formatBlogPost(result.rows[0]);
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  if (getDatabaseMode() === 'supabase') {
    const supabase = getSupabase();
    const { error } = await supabase.from('BlogPost').delete().eq('id', id);
    if (error) throw new Error(`Supabase error: ${error.message}`);
  } else {
    await execute('DELETE FROM "BlogPost" WHERE id = ?', [id]);
  }
}

// ============ Video CRUD ============

export async function getVideos(includeUnpublished = false): Promise<Video[]> {
  if (getDatabaseMode() === 'supabase') {
    const supabase = getSupabase();
    let query = supabase.from('Video').select('*').order('createdAt', { ascending: false });
    if (!includeUnpublished) {
      query = query.eq('published', 1);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return (data || []).map(formatVideo);
  } else {
    const result = includeUnpublished
      ? await execute('SELECT * FROM "Video" ORDER BY "createdAt" DESC')
      : await execute('SELECT * FROM "Video" WHERE published = 1 ORDER BY "createdAt" DESC');
    return result.rows.map(formatVideo);
  }
}

export async function getVideo(id: string): Promise<Video | null> {
  if (getDatabaseMode() === 'supabase') {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('Video').select('*').eq('id', id).single();
    if (error) return null;
    return data ? formatVideo(data) : null;
  } else {
    const result = await execute('SELECT * FROM "Video" WHERE id = ?', [id]);
    return result.rows.length > 0 ? formatVideo(result.rows[0]) : null;
  }
}

export async function createVideo(data: {
  title: string;
  description?: string | null;
  youtubeId: string;
  thumbnail?: string | null;
  category?: string;
  published?: boolean;
}): Promise<Video> {
  const id = generateId();
  const now = new Date().toISOString();
  const publishedVal = data.published !== false ? 1 : 0;

  if (getDatabaseMode() === 'supabase') {
    const supabase = getSupabase();
    const row = {
      id,
      title: data.title,
      description: data.description || null,
      youtubeId: data.youtubeId,
      thumbnail: data.thumbnail || null,
      category: data.category || 'Sermon',
      published: publishedVal,
      createdAt: now,
      updatedAt: now,
    };
    const { data: inserted, error } = await supabase.from('Video').insert(row).select().single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return formatVideo(inserted);
  } else {
    await execute(
      `INSERT INTO "Video" (id, title, description, "youtubeId", thumbnail, category, published, "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.title, data.description || null, data.youtubeId, data.thumbnail || null, data.category || 'Sermon', publishedVal, now, now]
    );
    const result = await execute('SELECT * FROM "Video" WHERE id = ?', [id]);
    if (result.rows.length === 0) throw new Error('Failed to create video');
    return formatVideo(result.rows[0]);
  }
}

export async function updateVideo(id: string, data: {
  title?: string;
  description?: string | null;
  youtubeId?: string;
  thumbnail?: string | null;
  category?: string;
  published?: boolean;
}): Promise<Video> {
  const now = new Date().toISOString();

  if (getDatabaseMode() === 'supabase') {
    const supabase = getSupabase();
    const updateData: Record<string, unknown> = { updatedAt: now };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.youtubeId !== undefined) updateData.youtubeId = data.youtubeId;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.published !== undefined) updateData.published = data.published ? 1 : 0;

    const { data: updated, error } = await supabase.from('Video').update(updateData).eq('id', id).select().single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (!updated) throw new Error('Video not found');
    return formatVideo(updated);
  } else {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.title !== undefined) { updates.push("title = ?"); values.push(data.title); }
    if (data.description !== undefined) { updates.push("description = ?"); values.push(data.description); }
    if (data.youtubeId !== undefined) { updates.push('"youtubeId" = ?'); values.push(data.youtubeId); }
    if (data.thumbnail !== undefined) { updates.push("thumbnail = ?"); values.push(data.thumbnail); }
    if (data.category !== undefined) { updates.push("category = ?"); values.push(data.category); }
    if (data.published !== undefined) { updates.push("published = ?"); values.push(data.published ? 1 : 0); }

    if (updates.length === 0) throw new Error('No fields to update');

    updates.push('"updatedAt" = ?');
    values.push(now);
    values.push(id);

    await execute(`UPDATE "Video" SET ${updates.join(", ")} WHERE id = ?`, values);

    const result = await execute('SELECT * FROM "Video" WHERE id = ?', [id]);
    if (result.rows.length === 0) throw new Error('Video not found');
    return formatVideo(result.rows[0]);
  }
}

export async function deleteVideo(id: string): Promise<void> {
  if (getDatabaseMode() === 'supabase') {
    const supabase = getSupabase();
    const { error } = await supabase.from('Video').delete().eq('id', id);
    if (error) throw new Error(`Supabase error: ${error.message}`);
  } else {
    await execute('DELETE FROM "Video" WHERE id = ?', [id]);
  }
}

// ============ Site Settings CRUD ============

export async function getSettings(): Promise<Record<string, string>> {
  if (getDatabaseMode() === 'supabase') {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('SiteSetting').select('*');
    if (error) throw new Error(`Supabase error: ${error.message}`);
    const settingsMap: Record<string, string> = {};
    (data || []).forEach((row) => {
      settingsMap[row.key as string] = row.value as string;
    });
    return settingsMap;
  } else {
    const result = await execute('SELECT * FROM "SiteSetting"');
    const settingsMap: Record<string, string> = {};
    result.rows.forEach((row) => {
      settingsMap[row.key as string] = row.value as string;
    });
    return settingsMap;
  }
}

export async function saveSetting(key: string, value: string): Promise<SiteSetting> {
  if (getDatabaseMode() === 'supabase') {
    const supabase = getSupabase();

    // Try to update first
    const { data: existing, error: fetchError } = await supabase
      .from('SiteSetting')
      .select('*')
      .eq('key', key)
      .single();

    if (existing) {
      const { data: updated, error } = await supabase
        .from('SiteSetting')
        .update({ value })
        .eq('key', key)
        .select()
        .single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return formatSiteSetting(updated);
    } else {
      const id = generateId();
      const { data: inserted, error } = await supabase
        .from('SiteSetting')
        .insert({ id, key, value })
        .select()
        .single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return formatSiteSetting(inserted);
    }
  } else {
    const existing = await execute('SELECT * FROM "SiteSetting" WHERE key = ?', [key]);
    if (existing.rows.length > 0) {
      await execute('UPDATE "SiteSetting" SET value = ? WHERE key = ?', [value, key]);
    } else {
      const id = generateId();
      await execute('INSERT INTO "SiteSetting" (id, key, value) VALUES (?, ?, ?)', [id, key, value]);
    }
    const result = await execute('SELECT * FROM "SiteSetting" WHERE key = ?', [key]);
    if (result.rows.length === 0) throw new Error('Failed to save setting');
    return formatSiteSetting(result.rows[0]);
  }
}
