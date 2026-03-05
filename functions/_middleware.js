/**
 * Middleware to handle routing for status page
 * Serves static files and API endpoints
 */

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // API routes
  if (url.pathname.startsWith('/api/')) {
    return next();
  }

  // Static files - let Pages handle them
  return next();
}
