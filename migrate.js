const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
const appDir = path.join(__dirname, 'src', 'app');

if (fs.existsSync(toolsDir)) {
  const tools = fs.readdirSync(toolsDir);
  
  for (const tool of tools) {
    const toolPath = path.join(toolsDir, tool);
    if (fs.statSync(toolPath).isDirectory()) {
      const destPath = path.join(appDir, tool);
      if (!fs.existsSync(destPath)) {
        console.log(`Moving ${tool} to ${destPath}`);
        fs.renameSync(toolPath, destPath);
      } else {
        console.log(`Destination ${destPath} already exists, skipping...`);
      }
    }
  }
} else {
  console.log("Tools directory not found.");
}
