/**
 * .env File Format Fixer
 * 
 * This script will fix common issues with .env files:
 * - Removes quotes around values
 * - Ensures no spaces around equals signs
 * - Creates a backup before making changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to .env file
const envPath = path.resolve(__dirname, '../.env');
const backupPath = path.resolve(__dirname, '../.env.backup');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found');
  process.exit(1);
}

// Read the .env file content
const envContent = fs.readFileSync(envPath, 'utf8');

// Create a backup
fs.writeFileSync(backupPath, envContent);
console.log(`Backup created at ${backupPath}`);

// Fix the content: Remove quotes, fix spaces around equals
const fixedContent = envContent
  .split('\n')
  .map(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || line.trim() === '') {
      return line;
    }
    
    // Extract key and value, removing quotes and fixing spaces
    const match = line.match(/^\s*([\w.-]+)\s*=\s*['"]?([^'"]*?)['"]?\s*$/);
    if (match) {
      const [, key, value] = match;
      return `${key}=${value}`;
    }
    
    // If no match, return the original line
    return line;
  })
  .join('\n');

// Write the fixed content back to the .env file
fs.writeFileSync(envPath, fixedContent);
console.log('Fixed .env file format');

// Print the fixed content for verification
console.log('\nUpdated .env file content:');
console.log('-------------------------');
console.log(fixedContent);
console.log('-------------------------');
console.log('Your .env file is now properly formatted for Vite.'); 