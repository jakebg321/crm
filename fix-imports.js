const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const fixImports = async (directory) => {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively process subdirectories
      await fixImports(entryPath);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      try {
        // Read the file content
        const content = await readFileAsync(entryPath, 'utf8');
        
        // Check if it has any auth import pattern
        if (content.includes("authOptions") && 
            (content.includes("import") && content.includes("nextauth"))) {
          
          // Replace any import pattern with the new location
          const newContent = content
            .replace(
              /import\s+{\s*authOptions\s*}\s+from\s+['"](.*?)['"];?/g,
              "import { authOptions } from '@/lib/auth';"
            );
          
          // Write the updated content back to the file
          await writeFileAsync(entryPath, newContent, 'utf8');
          console.log(`Updated imports in: ${entryPath}`);
        }
      } catch (error) {
        console.error(`Error processing file ${entryPath}:`, error);
      }
    }
  }
};

// Start from the src directory to catch all files
fixImports(path.join(__dirname, 'src'))
  .then(() => console.log('Done updating imports!'))
  .catch(err => console.error('Error:', err)); 