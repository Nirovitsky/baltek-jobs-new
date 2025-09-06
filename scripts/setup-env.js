#!/usr/bin/env node

/**
 * Environment Setup Script
 * Helps users set up their environment configuration
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnvironment() {
  console.log('🚀 Setting up environment configuration...\n');

  const envPath = path.join(__dirname, '..', '.env');
  const examplePath = path.join(__dirname, '..', 'env.example');

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('❌ Setup cancelled.');
      rl.close();
      return;
    }
  }

  // Check if example file exists
  if (!fs.existsSync(examplePath)) {
    console.log('❌ env.example file not found. Please make sure you\'re running this from the project root.');
    rl.close();
    return;
  }

  try {
    // Read the example file
    const exampleContent = fs.readFileSync(examplePath, 'utf8');
    
    // Get user input for key variables
    console.log('📝 Please provide the following configuration values:\n');

    const apiBaseUrl = await question('API Base URL (default: https://api.baltek.net/api): ') || 'https://api.baltek.net/api';
    const oauthAuthUrl = await question('OAuth Auth URL (default: https://api.baltek.net/api/oauth2/authorize/): ') || 'https://api.baltek.net/api/oauth2/authorize/';
    const oauthClientId = await question('OAuth Client ID (default: your_oauth_client_id): ') || 'your_oauth_client_id';
    const oauthTokenUrl = await question('OAuth Token URL (default: https://api.baltek.net/api/oauth2/token/): ') || 'https://api.baltek.net/api/oauth2/token/';
    const oauthRedirectUri = await question('OAuth Redirect URI (default: http://localhost:3000/auth/callback): ') || 'http://localhost:3000/auth/callback';
    const appName = await question('Application Name (default: Baltek Jobs): ') || 'Baltek Jobs';
    const appVersion = await question('Application Version (default: 1.0.0): ') || '1.0.0';

    // Replace values in the content
    let envContent = exampleContent
      .replace('VITE_API_BASE_URL=https://api.baltek.net/api', `VITE_API_BASE_URL=${apiBaseUrl}`)
      .replace('VITE_OAUTH_AUTH_URL=https://api.baltek.net/api/oauth2/authorize/', `VITE_OAUTH_AUTH_URL=${oauthAuthUrl}`)
      .replace('VITE_OAUTH_CLIENT_ID=your_oauth_client_id', `VITE_OAUTH_CLIENT_ID=${oauthClientId}`)
      .replace('VITE_OAUTH_TOKEN_URL=https://api.baltek.net/api/oauth2/token/', `VITE_OAUTH_TOKEN_URL=${oauthTokenUrl}`)
      .replace('VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback', `VITE_OAUTH_REDIRECT_URI=${oauthRedirectUri}`)
      .replace('VITE_APP_NAME=Baltek Jobs', `VITE_APP_NAME=${appName}`)
      .replace('VITE_APP_VERSION=1.0.0', `VITE_APP_VERSION=${appVersion}`);

    // Write the .env file
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Environment configuration created successfully!');
    console.log(`📁 Created: ${envPath}`);
    console.log('\n🔧 Next steps:');
    console.log('1. Review and update the .env file with your actual values');
    console.log('2. Run `npm run dev` to start the development server');
    console.log('3. Check the browser console for any configuration warnings\n');

  } catch (error) {
    console.error('❌ Error setting up environment:', error.message);
  }

  rl.close();
}

// Run the setup
setupEnvironment().catch(console.error);
