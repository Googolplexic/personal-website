import { readFileSync, readdirSync } from 'fs';

const jsDir = 'dist/assets/js';
const miscFile = readdirSync(jsDir).find(f => f.startsWith('vendor-misc'));
const content = readFileSync(`${jsDir}/${miscFile}`, 'utf8');
console.log(content);
