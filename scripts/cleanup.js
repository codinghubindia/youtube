#!/usr/bin/env node

/**
 * Cleanup script
 * Removes temporary files and prepares the project for a clean build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

console.log(`${colors.cyan}=== YouTube Clone Cleanup Script ===${colors.reset}\n`);

// Function to log with timestamp
function log(message, color = colors.white) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log(`${colors.yellow}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
}

// Directories to clean
const cleanDirs = [
  'dist',
  'node_modules/.cache',
  '.netlify/state.json'
];

// Function to remove a directory
function removeDir(dir) {
  const fullPath = path.join(__dirname, '..', dir);
  
  if (fs.existsSync(fullPath)) {
    log(`Removing ${dir}...`, colors.cyan);
    try {
      if (process.platform === 'win32') {
        // On Windows, use a more compatible command
        execSync(`rmdir /s /q "${fullPath}"`, { stdio: 'ignore' });
      } else {
        // On Unix-like systems, use rm -rf
        execSync(`rm -rf "${fullPath}"`, { stdio: 'ignore' });
      }
      log(`✓ ${dir} removed.`, colors.green);
    } catch (error) {
      log(`⚠ Failed to remove ${dir}: ${error.message}`, colors.yellow);
    }
  } else {
    log(`ℹ ${dir} does not exist, skipping.`, colors.cyan);
  }
}

// Main execution
function main() {
  try {
    log('Starting cleanup process...', colors.cyan);
    
    // Clean directories
    cleanDirs.forEach(removeDir);
    
    // Clean up any leftover environment files (optional, uncomment if needed)
    // const envExample = path.join(__dirname, '..', '.env_example');
    // const env = path.join(__dirname, '..', '.env');
    // if (fs.existsSync(envExample) && !fs.existsSync(env)) {
    //   log('Creating default .env file from .env_example...', colors.cyan);
    //   fs.copyFileSync(envExample, env);
    //   log('✓ Default .env file created.', colors.green);
    // }
    
    log('🎉 Cleanup completed successfully!', colors.green);
  } catch (error) {
    log(`❌ Cleanup failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

main(); 