export interface GridCodeNode { tag: string; attributes: Record<string,string>; children: GridCodeNode[]; text?: string; }
export interface GridCodeDocument { root: GridCodeNode; source: string; diagnostics: string[]; }

const tokenize = (source: string) => source.match(/<\/?[A-Za-z][A-Za-z0-9-]*(?:\s+[A-Za-z][A-Za-z0-9-]*="[^"]*")*\s*\/?>|[^<]+/g) ?? [];

export function parseGridCode(source: string): GridCodeDocument {
  const root: GridCodeNode = { tag: 'Grid', attributes: {}, children: [] };
  const stack: GridCodeNode[] = [root];
  const diagnostics: string[] = [];
  for (const token of tokenize(source)) {
    if (!token.trim()) continue;
    if (!token.startsWith('<')) {
      stack[stack.length - 1].text = (stack[stack.length - 1].text ?? '') + token.trim();
      continue;
    }
    const close = /^<\//.test(token);
    const self = /\/>$/.test(token);
    const match = token.match(/^<\/?([A-Za-z][A-Za-z0-9-]*)([^>]*)\/? >?$/) ?? token.match(/^<\/?([A-Za-z][A-Za-z0-9-]*)([^>]*)\/? >$/);
    const nameMatch = token.match(/^<\/?([A-Za-z][A-Za-z0-9-]*)/);
    if (!nameMatch) { diagnostics.push('Invalid tag: ' + token); continue; }
    const tag = nameMatch[1];
    if (close) {
      const open = stack.pop();
      if (!open || open.tag !== tag) diagnostics.push(`Closing tag </${tag}> does not match.`);
      continue;
    }
    const attributes: Record<string,string> = {};
    for (const attr of token.matchAll(/([A-Za-z][A-Za-z0-9-]*)="([^"]*)"/g)) attributes[attr[1]] = attr[2];
    const node: GridCodeNode = { tag, attributes, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!self) stack.push(node);
  }
  if (stack.length > 1) diagnostics.push('Unclosed tag: <' + stack[stack.length - 1].tag + '>');
  return { root, source, diagnostics };
}

export function gridCodeToHtml(source: string): string {
  return source;
}