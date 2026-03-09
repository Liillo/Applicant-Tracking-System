# ATS Web App

React frontend for the ATS workspace.

## Development

From the repository root:

```bash
npm run dev:web
```

The Vite dev server runs on `http://localhost:3000` and proxies `/api` and `/uploads` to the API server on `http://localhost:3001`.

## Production

Build the frontend:

```bash
npm run build:web
```

The API server serves the built files from `apps/web/dist`, so production traffic can go through the API server only.
