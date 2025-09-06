# Environment Variables Setup

This project uses environment variables for configuration. Here's how to set them up:

## Quick Start

1. **Copy the example environment file:**
   ```bash
   cp env.example .env
   ```

2. **Or use the interactive setup script:**
   ```bash
   npm run setup-env
   ```

3. **Update the values in `.env`** with your actual configuration.

## Environment Variables

### Required
- `VITE_API_BASE_URL` - Base URL for the API (default: `https://api.baltek.net/api`)

### Optional
- `VITE_APP_ENV` - Environment (`development`, `production`, `test`)
- `VITE_APP_VERSION` - App version (default: `1.0.0`)
- `VITE_APP_NAME` - App name (default: `Baltek Jobs`)
- `VITE_OAUTH_AUTH_URL` - OAuth authorization URL
- `VITE_OAUTH_CLIENT_ID` - OAuth client ID
- `VITE_OAUTH_TOKEN_URL` - OAuth token URL
- `VITE_OAUTH_REDIRECT_URI` - OAuth redirect URI
- `VITE_ENABLE_ANALYTICS` - Enable analytics (`true`/`false`)
- `VITE_ENABLE_ERROR_TRACKING` - Enable error tracking (`true`/`false`)
- `VITE_DEBUG_MODE` - Enable debug mode (`true`/`false`)
- `VITE_LOG_LEVEL` - Log level (`debug`, `info`, `warn`, `error`)

## Usage

The environment configuration is automatically loaded and available throughout the application:

```typescript
import { config, apiBaseUrl, isDevelopment } from '@/config/environment';
```

## Security

- Never commit `.env` files to version control
- Use different values for development and production
- Keep sensitive values secure

For detailed information, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md).
