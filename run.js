#!/usr/bin/env node

import { spawn } from 'child_process';

// Start Vite development server
const vite = spawn('npx', ['vite', 'dev', '--host', '0.0.0.0', '--port', '5000'], {
  stdio: 'inherit',
  shell: true
});

vite.on('close', (code) => {
  console.log(`Vite server exited with code ${code}`);
  process.exit(code);
});

vite.on('error', (error) => {
  console.error('Failed to start Vite server:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping Vite server...');
  vite.kill('SIGINT');
});

process.on('SIGTERM', () => {
  vite.kill('SIGTERM');
});