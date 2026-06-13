// Database client using Turso HTTP API directly via fetch
// No native modules required - works reliably on Vercel and any serverless platform

export interface DbResult {
  rows: Record<string, unknown>[];
  columns: string[];
}

function getTursoConfig() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '';
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || '';

  if (url.startsWith('libsql://')) {
    // Convert libsql:// to https:// for HTTP API
    const httpsUrl = url.replace('libsql://', 'https://');
    return { url: httpsUrl, authToken, isTurso: true };
  }

  return { url: '', authToken: '', isTurso: false };
}

// Execute SQL query via Turso HTTP API (fetch-based, no native modules)
async function executeTurso(sql: string, args: unknown[] = []): Promise<DbResult> {
  const { url, authToken } = getTursoConfig();

  const response = await fetch(`${url}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql,
            args: args.map(arg => {
              if (arg === null || arg === undefined) return { type: 'null' };
              if (typeof arg === 'number') return { type: 'integer', value: String(arg) };
              if (typeof arg === 'boolean') return { type: 'integer', value: arg ? '1' : '0' };
              return { type: 'text', value: String(arg) };
            }),
          },
        },
        { type: 'close' },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Turso HTTP error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.results?.[0]?.type === 'error') {
    throw new Error(`Turso SQL error: ${data.results[0].error?.message || 'Unknown error'}`);
  }

  const result = data.results?.[0];
  if (!result || result.type !== 'ok') {
    return { rows: [], columns: [] };
  }

  const columns: string[] = result.response?.result?.cols?.map((c: { name: string }) => c.name) || [];
  const rows: Record<string, unknown>[] = (result.response?.result?.rows || []).map((row: unknown[]) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      const cell = row[i];
      if (cell === null || cell === undefined) {
        obj[col] = null;
      } else if (typeof cell === 'object' && 'type' in cell) {
        const typedCell = cell as { type: string; value?: string };
        if (typedCell.type === 'null') {
          obj[col] = null;
        } else if (typedCell.type === 'integer') {
          obj[col] = Number(typedCell.value);
        } else {
          obj[col] = typedCell.value || null;
        }
      } else {
        obj[col] = cell;
      }
    });
    return obj;
  });

  return { rows, columns };
}

// Fallback: use @libsql/client for local SQLite
async function executeLocal(sql: string, args: unknown[] = []): Promise<DbResult> {
  // Dynamic import to avoid bundling issues
  const { createClient } = await import('@libsql/client');
  const client = createClient({ url: 'file:./db/custom.db' });
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

// Main database execute function
export async function execute(sql: string, args: unknown[] = []): Promise<DbResult> {
  const { isTurso } = getTursoConfig();

  if (isTurso) {
    return executeTurso(sql, args);
  } else {
    return executeLocal(sql, args);
  }
}

// Generate a unique ID (CUID-like format for compatibility)
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const randomPart2 = Math.random().toString(36).substring(2, 10);
  return `c${timestamp}${randomPart}${randomPart2}`;
}

// Format helpers - convert SQLite INTEGER booleans to JavaScript booleans
export function formatBlogPost(row: Record<string, unknown>) {
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
  }
}

export function formatVideo(row: Record<string, unknown>) {
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
  }
}

export function formatSiteSetting(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    key: row.key as string,
    value: row.value as string,
  }
}
