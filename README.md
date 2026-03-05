# Status Page

A modern, real-time status monitoring dashboard for thrallboy infrastructure. Tracks system health, deployment status, and tool versions with a clean, responsive UI.

## Architecture

```
status-page/
├── README.md                    # This file
├── wrangler.toml               # Cloudflare Pages configuration
├── src/
│   ├── index.html              # Modern UI with pagination
│   ├── style.css               # Clean, responsive styling
│   └── script.js               # Pagination & table rendering
├── functions/
│   └── api/
│       ├── logs/index.js       # GET - fetch paginated logs
│       └── logs/add.js         # POST - add new log entry
├── schema/
│   └── schema.sql              # D1 database schema
└── .github/
    └── workflows/
        └── deploy.yml          # Auto-deploy on push
```

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS (no build, minimal overhead)
- **Backend:** Cloudflare Pages Functions (serverless)
- **Database:** Cloudflare D1 (SQLite)
- **Hosting:** Cloudflare Pages (free tier)

## Setup & Deployment

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) CLI
- [Cloudflare account](https://dash.cloudflare.com)
- Git

### Local Development

```bash
# Install dependencies
npm install

# Create D1 database locally
wrangler d1 create status-logs --local

# Run locally
wrangler pages dev

# Visit http://localhost:8788
```

### Database Setup

```bash
# Create D1 database in Cloudflare
wrangler d1 create status-logs

# Apply schema
wrangler d1 execute status-logs --file schema/schema.sql
```

### Deployment to Cloudflare Pages

```bash
# Authenticate
wrangler login

# Deploy
wrangler pages deploy .

# Or push to GitHub and use GitHub Actions
git push origin main
```

## API Endpoints

### GET `/api/logs`

Fetch paginated status logs.

**Query Parameters:**
- `page` (optional, default: 1) — page number
- `limit` (optional, default: 25) — items per page
- `system` (optional) — filter by system name
- `date` (optional, YYYY-MM-DD) — filter by date

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "check_date": "2026-03-05",
      "system": "website",
      "status": "healthy",
      "issues": null,
      "created_at": "2026-03-05T06:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "pages": 6
  }
}
```

### POST `/api/logs/add`

Add a new status log entry.

**Request Body:**
```json
{
  "check_date": "2026-03-05",
  "system": "website",
  "status": "healthy",
  "issues": null
}
```

**Response:**
```json
{
  "success": true,
  "id": 1
}
```

## Daily Health Checks (06:00 UTC)

The DevOps agent runs daily checks and logs results to this database:

- **System Health:** Website, D1, GitHub backups, Cloudflare Pages
- **Tool Versions:** Node.js, Wrangler, npm, Git, GitHub CLI, 1Password CLI
- **Status:** Healthy, Warning (outdated), Critical (system down)

Cron job: `/home/node/.openclaw/workspace-devops/cron/daily-health-check.js`

## Environment Variables

Create a `.env.local` file for local development:

```env
D1_DATABASE_ID=your-d1-id
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

These are automatically injected in Cloudflare Pages Functions.

## Monitoring & Alerts

- Status page updates every time DevOps logs a check (06:00 UTC)
- Critical issues trigger Telegram alert via Mack agent
- Historical data retained indefinitely for trend analysis

## Security

- D1 database is secured via Cloudflare authentication
- API endpoints validate request origin
- No sensitive data logged (secrets managed via 1Password)
- Dependabot monitors dependencies

## Performance

- Pagination: 25 items/page by default (configurable)
- Database indexes on date and system for fast queries
- Static assets cached by Cloudflare CDN
- ~100ms response time for API calls

## Contributing

1. Make changes locally
2. Test with `wrangler pages dev`
3. Commit with clear messages
4. Push to `main` branch
5. Cloudflare Pages auto-deploys

## Support

Questions? Check the [Cloudflare Pages docs](https://developers.cloudflare.com/pages/) or [D1 docs](https://developers.cloudflare.com/d1/).
