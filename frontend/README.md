# Bruno Personal Assistant - Frontend

This is the frontend application for Bruno PA, built with [Next.js](https://nextjs.org) and TypeScript.

## Environment Configuration

### Quick Setup

1. **Copy the environment template:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Update the values in `.env.local`:**
   ```env
   # Backend API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   
   # WebSocket Configuration  
   NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
   
   # App Configuration
   NEXT_PUBLIC_APP_NAME=Bruno Personal Assistant
   NEXT_PUBLIC_APP_ENV=development
   ```

### Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api` | Yes |
| `NEXT_PUBLIC_WS_URL` | WebSocket connection URL | Auto-generated from API URL | No |
| `NEXT_PUBLIC_API_TIMEOUT` | API request timeout (ms) | `30000` | No |
| `NEXT_PUBLIC_WS_RECONNECT_INTERVAL` | WebSocket reconnect interval (ms) | `5000` | No |
| `NEXT_PUBLIC_WS_MAX_RECONNECT_ATTEMPTS` | Max WebSocket reconnection attempts | `5` | No |
| `NEXT_PUBLIC_APP_NAME` | Application display name | `Bruno Personal Assistant` | No |
| `NEXT_PUBLIC_APP_ENV` | Environment override | Auto-detected | No |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` | No |

### Configuration Files

- **`lib/config.ts`** - Main configuration with inline defaults (industry standard)
- **`.env.local.example`** - Template with all available variables
- **`.env.local`** - Your local environment variables (gitignored)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Bruno PA Backend running on `http://localhost:8000`

### Installation

1. **Install dependencies:**

```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Troubleshooting

### Common Issues

#### "Configuration validation failed"
- **Cause:** Missing required environment variables
- **Solution:** Copy `.env.local.example` to `.env.local` and set required values
- **Check:** Ensure `NEXT_PUBLIC_API_URL` is set for production deployments

#### "Cannot connect to API" 
- **Cause:** Backend not running or incorrect API URL
- **Solution:** 
  1. Verify backend is running: `curl http://localhost:8000/api/health/`
  2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
  3. Restart the frontend development server

#### "WebSocket connection failed"
- **Cause:** WebSocket URL misconfiguration or backend not supporting WebSockets
- **Solution:**
  1. Check `NEXT_PUBLIC_WS_URL` in `.env.local`
  2. Verify backend WebSocket endpoint is available
  3. If not set, WebSocket URL is auto-generated from API URL

#### "Environment variables not loading"
- **Cause:** Environment variables not prefixed with `NEXT_PUBLIC_`
- **Solution:** All client-side variables must start with `NEXT_PUBLIC_`
- **Note:** Restart development server after changing environment variables

#### TypeScript errors in config files
- **Cause:** Missing dependencies or type mismatches
- **Solution:** 
  ```bash
  npm install --save-dev typescript @types/node
  npx tsc --noEmit lib/config.ts lib/config.defaults.ts
  ```

### Development Tips

- **Hot Reload:** The page auto-updates as you edit files
- **Environment Detection:** The app automatically detects development/production environments
- **Configuration Validation:** Invalid configurations show helpful error messages
- **Type Safety:** Full TypeScript support with proper interfaces

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
├── components/            # Reusable React components
├── lib/                   # Utilities and configuration
│   ├── config.ts          # Main configuration loader
│   ├── config.defaults.ts # Environment-specific defaults
│   └── api.ts             # API client functions
├── .env.local.example     # Environment variables template
└── .env.local             # Your local environment (gitignored)
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
