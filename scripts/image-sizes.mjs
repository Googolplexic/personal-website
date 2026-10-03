import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const out = {};

async function walk(dir) {
    for (const name of readdirSync(dir)) {
        const filePath = join(dir, name);
        if (statSync(filePath).isDirectory()) {
            await walk(filePath);
            continue;
        }
        if (!/\.(webp|png|jpe?g)$/i.test(name)) continue;
        if (!/[\\/]web([\\/]|$)/.test(filePath)) continue;
        const meta = await sharp(filePath).metadata();
        if (!meta.width || !meta.height) continue;
        const parts = filePath.split(/[\\/]/);
        const file = parts.pop();
        let folder = parts.pop();
        while (folder === 'web' || folder === 'images') folder = parts.pop();
        const stem = file.replace(/\.webp$/i, '');
        out[`${folder}/${stem}`] = { width: meta.width, height: meta.height };
    }
}

await walk('src/assets');
writeFileSync('src/utils/imageSizes.json', JSON.stringify(out));
console.log(`sizes ${Object.keys(out).length}`);
