#!/usr/bin/env python3
import subprocess
import sys
import os

def main():
    """Run the Vite development server"""
    try:
        # Change to project directory
        os.chdir('/home/runner/workspace')
        
        # Run vite dev server
        cmd = ['npx', 'vite', 'dev', '--host', '0.0.0.0', '--port', '5000']
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        # Stream output
        for line in iter(process.stdout.readline, ''):
            print(line.rstrip())
            
        process.wait()
        return process.returncode
        
    except KeyboardInterrupt:
        print("\nShutting down server...")
        if 'process' in locals():
            process.terminate()
        return 0
    except Exception as e:
        print(f"Error starting server: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())