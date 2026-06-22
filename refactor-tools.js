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
    
    if (content.includes('if (showPreview) {') && content.includes('setShowPreview')) {
      
      // 1. Keep useState to appease TS
      // 2. Fix the buttons inside previewContent: disable setShowPreview
      // We will replace `setShowPreview(false)` and `setShowPreview(true)` with `void 0`
      content = content.replace(/setShowPreview\(false\)/g, 'void 0');
      content = content.replace(/setShowPreview\(true\)/g, 'void 0');
      content = content.replace(/setShowPreview\(!showPreview\)/g, 'void 0');

      // 3. Replace the Show Preview button with Download PDF
      let newOnClick = 'onClick={handleDownloadPDF} disabled={isGenerating}';
      if (!content.includes('isGenerating')) {
         newOnClick = 'onClick={handlePrint}';
      }
      content = content.replace(/onClick=\{\(\) => void 0\}/g, newOnClick);
      content = content.replace(/<Eye className="h-4 w-4" \/>\s*Show Preview/g, '<Download className="h-4 w-4" /> Download PDF');
      
      // 4. Bracket matching to find the end of `if (showPreview) {`
      let startIndex = content.indexOf('if (showPreview) {');
      if (startIndex !== -1) {
        let bracketCount = 0;
        let inBlock = false;
        let endIndex = -1;
        for (let i = startIndex; i < content.length; i++) {
          if (content[i] === '{') {
            bracketCount++;
            inBlock = true;
          } else if (content[i] === '}') {
            bracketCount--;
            if (inBlock && bracketCount === 0) {
              endIndex = i;
              break;
            }
          }
        }

        if (endIndex !== -1) {
          // Replace `if (showPreview) {\n  return (` with `const previewContent = (`
          // Note: we can just replace the literal string.
          let beforeEnd = content.substring(0, endIndex);
          let afterEnd = content.substring(endIndex + 1); // remove the `}`
          
          let modifiedBeforeEnd = beforeEnd.replace(/if\s*\(showPreview\)\s*\{\s*return\s*\(/, 'const previewContent = (');
          
          content = modifiedBeforeEnd + afterEnd;
          
          let mainReturnMatch = afterEnd.match(/\n\s*return\s*\(/);
          if (mainReturnMatch) {
             let returnStr = mainReturnMatch[0];
             let returnIndex = afterEnd.indexOf(returnStr);
             
             let part1 = afterEnd.substring(0, returnIndex + returnStr.length);
             let part2 = afterEnd.substring(returnIndex + returnStr.length);
             
             part2 = '\n    <>\n      <div className="absolute -left-[9999px] -top-[9999px]">{previewContent}</div>\n' + part2;
             
             afterEnd = part1 + part2;
             content = modifiedBeforeEnd + afterEnd;
             
             // Now wrap the end of the file in </>. The last closing parenthesis is right before the last closing brace.
             let lastBraceIndex = content.lastIndexOf('}');
             let lastParenIndex = content.lastIndexOf(')', lastBraceIndex);
             if (lastParenIndex !== -1) {
               content = content.substring(0, lastParenIndex) + '</>\n  )' + content.substring(lastParenIndex + 1);
             }
          }
        }
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Refactored ${filePath}`);
    }
  }
});

console.log("Refactoring complete.");
