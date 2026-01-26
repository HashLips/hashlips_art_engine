const fs = require('fs');
const file = '.open-next/server-functions/default/handler.mjs.meta.json';
const rep = './resvg-stub.js';
let out = fs.readFileSync(file, 'utf8');
const regex = [
  /[A-Za-z]:[^\"\n]*resvg(?:-stub)?\.js/gi,
  /[A-Za-z]:[^\"\n]*resvg\.wasm\?module/gi,
  /[A-Za-z]:[^\"\n]*yoga\.wasm\?module/gi,
  /"path"\s*:\s*"[^"]*resvg[^"]*"/gi,
  /"path"\s*:\s*"[^"]*yoga\.wasm\?module[^"]*"/gi,
];
let changed = false;
for (const re of regex) {
  const next = out.replace(re, rep);
  if (next !== out) {
    changed = true;
    out = next;
  }
}
console.log('changed', changed);
console.log('still C paths', /C:\\/.test(out));
