const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

// 1. Fix <script> tags
walk(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('<script') && !content.includes('export const JsonLd')) {
      // It's a page or layout with <script>
      let newContent = content.replace(/<script/g, '<Script');
      newContent = newContent.replace(/<\/script>/g, '</Script>');
      
      // Add import if not present
      if (!newContent.includes('import Script from "next/script"')) {
        newContent = 'import Script from "next/script"\n' + newContent;
      }

      // If missing an ID (Next Script requires an ID for inline scripts)
      if (newContent.includes('<Script type="application/ld+json"')) {
        let idCounter = 1;
        newContent = newContent.replace(/<Script type="application\/ld\+json"/g, () => {
          return `<Script id="json-ld-${idCounter++}" type="application/ld+json"`;
        });
      }
      if (newContent.includes('<Script\n          type="application/ld+json"')) {
        newContent = newContent.replace('<Script\n          type="application/ld+json"', '<Script id="json-ld-layout"\n          type="application/ld+json"');
      }

      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed script tag in ${filePath}`);
    }
  }
});

// 2. Fix hydration by adding mounted check
walk(srcDir, (filePath) => {
  if (filePath.endsWith('-client.tsx') || filePath.endsWith('quotation-generator.tsx') || filePath.endsWith('invoice-generator.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it has hydration issue candidates
    if (content.includes('useState(new Date()') || content.includes('useState(() => new Date()') || content.includes('useState(() => String(Math.floor') || content.includes('useState(String(Math.floor')) {
      
      // If not already mounted
      if (!content.includes('const [mounted, setMounted] = useState(false)')) {
        
        // Find the return statement that starts the JSX
        // We will insert the mounted check before the first `return (` or `if (showPreview) {` or similar
        // A safer way is to find the function declaration, then find the last useState or standard hook, and insert it.
        // Let's just insert it before `if (showPreview)` or before the last `return (`.
        
        let match = content.match(/const handleDownloadPDF = async/);
        if (!match) {
          match = content.match(/const addItem = \(\) =>/);
        }
        if (!match) {
          match = content.match(/if \(showPreview\)/);
        }
        if (!match) {
          match = content.match(/return \(/);
        }

        if (match) {
          const insertIndex = match.index;
          const before = content.slice(0, insertIndex);
          const after = content.slice(insertIndex);

          // We also need to import useEffect if not present
          let newBefore = before;
          if (!newBefore.includes('useEffect')) {
            newBefore = newBefore.replace('import React, { useState', 'import React, { useState, useEffect');
            newBefore = newBefore.replace('import { useState', 'import { useState, useEffect');
          }

          const mountedCode = `
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null; // Prevent hydration mismatch
  
`;
          const finalContent = newBefore + mountedCode + after;
          fs.writeFileSync(filePath, finalContent, 'utf8');
          console.log(`Fixed hydration in ${filePath}`);
        }
      }
    }
  }
});

console.log("Fixes applied successfully.");
