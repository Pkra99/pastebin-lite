# Pastebin Lite

A minimal, fast pastebin application for sharing code and text snippets with optional time-based expiry and view limits.

## Features

- **Create pastes** with arbitrary text content
- **Share links** to view pastes
- **Time-based expiry (TTL)** - pastes automatically become unavailable after a set duration
- **View limits** - pastes become unavailable after a maximum number of views
- **Combined constraints** - first triggered constraint makes the paste unavailable
- **Deterministic testing** - supports `x-test-now-ms` header for testing expiry logic

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Deployment**: Vercel

## Persistence Layer

This application uses **Upstash Redis** as its persistence layer

Data is stored as JSON objects in Redis with the key pattern `paste:{id}`.

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Upstash Redis account (free at [console.upstash.com](https://console.upstash.com))

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd pastebin-lite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Upstash Redis credentials to `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## API Reference

### Health Check
```
GET /api/healthz
Response: { "ok": true }
```

### Create Paste
```
POST /api/pastes
Content-Type: application/json

{
  "content": "Your text here",
  "ttl_seconds": 60,    // optional
  "max_views": 5        // optional
}

Response: {
  "id": "abc123xyz",
  "url": "https://your-app.vercel.app/p/abc123xyz"
}
```

### Fetch Paste (API)
```
GET /api/pastes/:id

Response: {
  "content": "Your text here",
  "remaining_views": 4,           // or null if unlimited
  "expires_at": "2024-01-01..."   // or null if no TTL
}
```

### View Paste (HTML)
```
GET /p/:id
Response: HTML page with paste content
```

## Deterministic Testing

For testing time-based expiry, set `TEST_MODE=1` and use the `x-test-now-ms` header:

```bash
# Create a paste with 60 second TTL
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Test","ttl_seconds":60}'

# Simulate future time (paste should be expired)
curl http://localhost:3000/api/pastes/<id> \
  -H "x-test-now-ms: 9999999999999"
```

