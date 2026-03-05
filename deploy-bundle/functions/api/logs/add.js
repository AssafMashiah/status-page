/**
 * POST /api/logs/add
 * 
 * Add a new status log entry to D1 database.
 * 
 * Request Body (JSON):
 * {
 *   "check_date": "YYYY-MM-DD",
 *   "system": "system-name",
 *   "status": "healthy|warning|critical",
 *   "issues": "optional issue description"
 * }
 */

export async function onRequest(context) {
  const { request, env } = context;

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse JSON body
    const body = await request.json();

    // Validate required fields
    const { check_date, system, status, issues } = body;

    if (!check_date || !system || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: check_date, system, status' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate status enum
    const validStatuses = ['healthy', 'warning', 'critical'];
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(check_date)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert into database
    const result = await env.DB.prepare(
      `INSERT INTO status_logs (check_date, system, status, issues) 
       VALUES (?, ?, ?, ?)`
    )
      .bind(check_date, system, status, issues || null)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        id: result.meta.last_row_id
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error adding log:', error);

    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to add log' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
