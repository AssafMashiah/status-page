/**
 * GET /api/logs
 * 
 * Fetch paginated status logs from D1 database.
 * 
 * Query Parameters:
 * - page (optional, default: 1)
 * - limit (optional, default: 25, max: 100)
 * - system (optional) - filter by system name
 * - date (optional, YYYY-MM-DD) - filter by date
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse query parameters
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25', 10)));
    const system = url.searchParams.get('system')?.trim();
    const date = url.searchParams.get('date')?.trim();

    // Build SQL query
    let query = 'SELECT * FROM status_logs WHERE 1=1';
    const params = [];

    if (system) {
      query += ' AND system = ?';
      params.push(system);
    }

    if (date) {
      query += ' AND check_date = ?';
      params.push(date);
    }

    query += ' ORDER BY check_date DESC, created_at DESC';

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM status_logs WHERE 1=1';
    const countParams = [];

    if (system) {
      countQuery += ' AND system = ?';
      countParams.push(system);
    }

    if (date) {
      countQuery += ' AND check_date = ?';
      countParams.push(date);
    }

    const countResult = await env.DB.prepare(countQuery)
      .bind(...countParams)
      .first();

    const total = countResult?.count || 0;
    const pages = Math.ceil(total / limit);

    // Fetch paginated results
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await env.DB.prepare(query)
      .bind(...params)
      .all();

    const logs = result.results || [];

    return new Response(
      JSON.stringify({
        logs,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        }
      }
    );

  } catch (error) {
    console.error('Error fetching logs:', error);

    return new Response(
      JSON.stringify({ error: 'Failed to fetch logs' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
