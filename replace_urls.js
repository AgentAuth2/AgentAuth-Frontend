const fs = require('fs');
const path = require('path');

const dir = process.argv[2];

const searchStr = /const BASE_URL = typeof window !== 'undefined' && window\.location\.hostname !== 'localhost'\s*\?\s*`https:\/\/\$\{window\.location\.host\.replace\('3000',\s*'8000'\)\}`\s*:\s*'http:\/\/localhost:8000';/g;
const replacement = `const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://agentauthbackend.onrender.com/api'
    : 'http://localhost:8000');`;

function walk(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (searchStr.test(content)) {
        console.log(`Updating ${fullPath}`);
        fs.writeFileSync(fullPath, content.replace(searchStr, replacement));
      }
    }
  }
}

walk(dir);
