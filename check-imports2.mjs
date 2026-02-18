import { readFileSync } from 'fs';
import { readdirSync } from 'fs';

const jsDir = 'dist/assets/js';
const files = readdirSync(jsDir).filter(f => f.startsWith('vendor-'));

for (const file of files) {
  const content = readFileSync(`${jsDir}/${file}`, 'utf8');
  // Get all import statements (at start of file)
  const importSection = content.substring(0, 1000);
  const imports = [...importSection.matchAll(/import\{([^}]+)\}from"([^"]+)"/g)];
  console.log(`\n=== ${file} ===`);
  for (const m of imports) {
    console.log(`  from "${m[2]}": ${m[1].substring(0, 200)}`);
  }
  // Also show exports
  const exportCount = (content.match(/export\{/g) || []).length;
  console.log(`  exports: ${exportCount} export statements`);
  console.log(`  size: ${(content.length / 1024).toFixed(1)} kB`);
}
