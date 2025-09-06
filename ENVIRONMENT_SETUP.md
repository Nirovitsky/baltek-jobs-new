# Environment Configuration

This project uses environment variables for configuration. Follow these steps to set up your environment.

## Quick Setup

1. **Copy the example environment file:**
   ```bash
   cp env.example .env
   ```

2. **Update the values in `.env`** with your actual configuration values.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for the API | `https://api.baltek.net/api` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_APP_ENV` | Application environment | `development` | `development`, `production`, `test` |
| `VITE_APP_VERSION` | Application version | `1.0.0` | `1.0.0` |
| `VITE_APP_NAME` | Application name | `Baltek Jobs` | `Baltek Jobs` |
| `VITE_OAUTH_AUTH_URL` | OAuth authorization URL | `https://api.baltek.net/api/oauth2/authorize/` | `https://api.baltek.net/api/oauth2/authorize/` |
| `VITE_OAUTH_CLIENT_ID` | OAuth client ID | `your_oauth_client_id` | `abc123def456` |
| `VITE_OAUTH_TOKEN_URL` | OAuth token URL | `https://api.baltek.net/api/oauth2/token/` | `https://api.baltek.net/api/oauth2/token/` |
| `VITE_OAUTH_REDIRECT_URI` | OAuth redirect URI | `http://localhost:3000/auth/callback` | `https://your-domain.com/auth/callback` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `false` | `true`, `false` |
| `VITE_ENABLE_ERROR_TRACKING` | Enable error tracking | `false` | `true`, `false` |
| `VITE_DEBUG_MODE` | Enable debug mode | `true` | `true`, `false` |
| `VITE_LOG_LEVEL` | Logging level | `debug` | `debug`, `info`, `warn`, `error` |

## Environment-Specific Configurations

### Development
```env
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false
```

### Production
```env
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
```

## Usage in Code

The environment configuration is centralized in `client/src/config/environment.ts`:

```typescript
import { config, apiBaseUrl, isDevelopment } from '@/config/environment';

// Use individual values
console.log('API Base URL:', apiBaseUrl);
console.log('Is Development:', isDevelopment);

// Use the full config object
console.log('App Version:', config.appVersion);
```

## Security Notes

- **Never commit `.env` files** to version control
- **Use different OAuth client IDs** for development and production
- **Update redirect URIs** to match your deployment domains
- **Enable analytics and error tracking** only in production

## Troubleshooting

### Common Issues

1. **"VITE_API_BASE_URL is required" error**
   - Make sure you have set `VITE_API_BASE_URL` in your `.env` file

2. **OAuth redirect not working**
   - Check that `VITE_OAUTH_REDIRECT_URI` matches your OAuth app configuration
   - Ensure the domain matches your current environment

3. **Logging not working as expected**
   - Check `VITE_DEBUG_MODE` and `VITE_LOG_LEVEL` settings
   - In production, only warnings and errors are logged by default

### Validation

The environment configuration includes validation and will throw errors for missing required variables. Check the browser console for configuration warnings.
