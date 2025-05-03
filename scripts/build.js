#!/usr/bin/env node

/**
 * Pre-deployment build script
 * This script runs before the main build process to ensure everything is ready
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

console.log(`${colors.cyan}=== YouTube Clone Pre-Deployment Build Script ===${colors.reset}\n`);

// Check if we're in a CI environment (like Netlify)
const isCI = process.env.CI === 'true';

// Function to log with timestamp
function log(message, color = colors.white) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log(`${colors.yellow}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
}

// Check environment variables
function checkEnvironmentVariables() {
  log('Checking environment variables...', colors.cyan);
  
  // Keys we need for optimal functionality
  const requiredKeys = [
    'VITE_YOUTUBE_API_KEY',
    'VITE_GEMINI_API_KEY',
  ];
  
  let allPresent = true;
  
  requiredKeys.forEach(key => {
    if (!process.env[key] && !isCI) {
      log(`Warning: ${key} is not set. Some features might not work.`, colors.yellow);
      allPresent = false;
    }
  });
  
  if (allPresent) {
    log('✓ All required environment variables are set.', colors.green);
  } else if (isCI) {
    log('ℹ Running in CI environment. Environment variables should be configured in the deployment platform.', colors.cyan);
  } else {
    log('⚠ Some environment variables are missing. The application will fall back to mock data.', colors.yellow);
  }
  
  log('Environment check complete.', colors.green);
}

// Ensure the build directory exists
function ensureBuildDirectoryExists() {
  const distDir = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distDir)) {
    log('Creating dist directory...', colors.cyan);
    fs.mkdirSync(distDir, { recursive: true });
    log('✓ dist directory created.', colors.green);
  }
}

// Run the main build process
function runBuild() {
  log('Starting production build...', colors.cyan);
  
  try {
    // Execute the Vite build command
    execSync('vite build', { stdio: 'inherit' });
    log('✓ Build completed successfully!', colors.green);
    
    // Copy Netlify config files if needed
    ensureNetlifyConfigFiles();
    
    return true;
  } catch (error) {
    log(`❌ Build failed: ${error.message}`, colors.red);
    return false;
  }
}

// Ensure Netlify configuration files are present in the build output
function ensureNetlifyConfigFiles() {
  const distDir = path.join(__dirname, '..', 'dist');
  
  // Copy _redirects file (although netlify.toml at the root should handle this)
  const redirectsSource = path.join(__dirname, '..', 'public', '_redirects');
  const redirectsDest = path.join(distDir, '_redirects');
  
  if (fs.existsSync(redirectsSource)) {
    log('Copying _redirects file to build output...', colors.cyan);
    fs.copyFileSync(redirectsSource, redirectsDest);
    log('✓ _redirects file copied.', colors.green);
  }
}

// Main execution
function main() {
  try {
    checkEnvironmentVariables();
    ensureBuildDirectoryExists();
    const buildSuccess = runBuild();
    
    if (buildSuccess) {
      log('🎉 Build process completed successfully! Ready for deployment.', colors.green);
    } else {
      log('⚠ Build process completed with warnings or errors.', colors.yellow);
      process.exit(1);
    }
  } catch (error) {
    log(`❌ Fatal error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

main(); 