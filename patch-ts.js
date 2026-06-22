const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/app');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('setShowPreview(') || content.includes('showPreview')) {
      if (!content.includes('const setShowPreview =')) {
        // Add dummy definitions
        // Find isGenerating or mounted or useState
        content = content.replace(/(const \[isGenerating.*?)\n/g, '$1\n  const showPreview = true;\n  const setShowPreview = (v: any) => {};\n');
        // If not found, try something else
        if (!content.includes('setShowPreview =')) {
          content = content.replace(/(const \[.*?\] = useState.*?)\n/g, '$1\n  const showPreview = true;\n  const setShowPreview = (v: any) => {};\n');
        }
        
        // Also fix rent-receipt/page.tsx which doesn't have isGenerating but has other useStates
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Patched ${filePath}`);
      }
    }
  }
});
console.log("Done.");
