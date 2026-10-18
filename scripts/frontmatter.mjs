/**
 * Minimal frontmatter parser for the content markdown files: flat `key: value`
 * pairs and `- item` lists, which is all the content uses. Keeps js-yaml out of
 * the build. Shared by vite.config.ts (`*.md?parsed` imports) and generate-rss.js.
 */

/** The admin API writes values as JSON strings ("..."); hand-written files use bare or 'single-quoted' values. */
function unquote(value) {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1);
    }
  }
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  return value;
}

/** @returns {{ attributes: Record<string, string | string[]>, body: string }} */
export function parseFrontmatter(raw) {
  const attributes = {};
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---[^\n]*(?:\n|$)/);
  if (!match) return { attributes, body: raw };

  let currentKey = '';
  for (const rawLine of match[1].split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    const keyValue = line.match(/^(\w[\w\s]*?):\s*(.*)$/);
    if (keyValue) {
      currentKey = keyValue[1].trim();
      const value = keyValue[2].trim();
      attributes[currentKey] = value === '' ? [] : unquote(value);
    } else if (currentKey && /^\s*-\s+/.test(line)) {
      if (!Array.isArray(attributes[currentKey])) attributes[currentKey] = [];
      attributes[currentKey].push(unquote(line.replace(/^\s*-\s+/, '').trim()));
    }
  }
  return { attributes, body: raw.slice(match[0].length).replace(/^\r?\n/, '') };
}
