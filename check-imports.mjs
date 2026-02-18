import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

function getImports(dir) {
  const files = readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const f of files) {
    const full = join(dir, f.name);
    if (f.isDirectory()) {
      results.push(...getImports(full));
    } else if (f.name.endsWith('.js')) {
      const content = readFileSync(full, 'utf8');
      // Match only ES module imports at the start of the file or after semicolons
      const imports = [...content.matchAll(/\bfrom\s*"(\.[^"]+)"/g)].map(m => m[1]);
      if (imports.length > 0) {
        const name = full.replace(/\\/g, '/').replace(/^dist\/assets\/js\//, '');
        results.push({ file: name, imports });
      }
    }
  }
  return results;
}

const chunks = getImports('dist/assets/js');
const vendorChunks = chunks.filter(c => c.file.includes('vendor-'));

console.log('=== Vendor chunk dependencies ===');
for (const { file, imports } of vendorChunks) {
  const vendorImports = imports.filter(i => i.includes('vendor-'));
  console.log(`${file} -> [${vendorImports.join(', ')}]`);
}

// Check for cycles
console.log('\n=== Checking for circular dependencies ===');
for (const a of vendorChunks) {
  for (const b of vendorChunks) {
    if (a.file === b.file) continue;
    const aImportsB = a.imports.some(i => i.includes(b.file.split('/').pop().replace('.js', '')));
    const bImportsA = b.imports.some(i => i.includes(a.file.split('/').pop().replace('.js', '')));
    if (aImportsB && bImportsA) {
      console.log(`CIRCULAR: ${a.file} <-> ${b.file}`);
    }
  }
}
console.log('Done.');
