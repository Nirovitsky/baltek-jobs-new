# HTTPS Development Setup

This project is configured to run with HTTPS in development using locally generated SSL certificates.

## SSL Certificates

The project uses `mkcert` to generate local SSL certificates for development:

```bash
# Generate certificates (already done)
mkcert localhost 127.0.0.1 ::1

# Rename certificates
mv localhost+2.pem localhost.pem
mv localhost+2-key.pem localhost-key.pem
```

## Configuration

### Vite Configuration
The `vite.config.ts` file is configured to use HTTPS:

```typescript
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem'))
};

export default defineConfig({
  server: {
    https: httpsOptions,
    // ... other config
  }
});
```

### Environment Variables
The OAuth redirect URI is configured for HTTPS:

```env
VITE_OAUTH_REDIRECT_URI=https://localhost:5001/auth/callback
```

## Accessing the Application

- **HTTPS URL**: https://localhost:5001
- **HTTP/2**: Enabled automatically with HTTPS
- **Certificate**: Self-signed certificate trusted by mkcert

## Security Notes

- SSL certificate files (`*.pem`, `*.key`, `*.crt`) are gitignored
- Certificates are valid for `localhost`, `127.0.0.1`, and `::1`
- Certificates expire on December 5, 2027

## Troubleshooting

If you encounter SSL certificate issues:

1. **Trust the certificate**: Run `mkcert -install` to trust the root CA
2. **Regenerate certificates**: Delete existing `.pem` files and run the mkcert command again
3. **Check file permissions**: Ensure certificate files are readable by the Node.js process

## Production

For production deployment, use proper SSL certificates from a trusted Certificate Authority (CA) or Let's Encrypt.
