// Builds src/index.html (the desktop app page) from the shared Keygrid template.
// Run with:  node scripts/build-page.js
const fs = require('fs');
const path = require('path');

const here = __dirname;
const root = path.join(here, '..');
let page = fs.readFileSync(path.join(here, 'page.template.html'), 'utf8');
const engine = fs.readFileSync(path.join(here, 'analysis.js'), 'utf8');
const example = fs.readFileSync(path.join(here, 'example.json'), 'utf8');

page = page.replace('__ENGINE__', () => engine).replace('__EXAMPLE__', () => example);

// Fonts ship inside the app so it works offline: swap the Google Fonts links for local @font-face rules.
page = page.replace(/<link rel="preconnect"[^>]*>\s*/g, '').replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\s*/, '');
const faces = [
  ['Outfit', 300, 'outfit-latin-300-normal'], ['Outfit', 400, 'outfit-latin-400-normal'],
  ['Outfit', 500, 'outfit-latin-500-normal'], ['Outfit', 600, 'outfit-latin-600-normal'],
  ['Figtree', 400, 'figtree-latin-400-normal'], ['Figtree', 500, 'figtree-latin-500-normal'],
  ['Figtree', 600, 'figtree-latin-600-normal'],
  ['IBM Plex Mono', 400, 'ibm-plex-mono-latin-400-normal'], ['IBM Plex Mono', 500, 'ibm-plex-mono-latin-500-normal'],
].map(([family, weight, file]) => `@font-face { font-family: "${family}"; font-style: normal; font-weight: ${weight}; font-display: swap; src: url("fonts/${file}.woff2") format("woff2"); }`).join('\n');
page = page.replace('<style>', '<style>\n' + faces + '\n');

// Desktop bridge: history lives in ~/Library/Application Support/<app id>/history.json, plus keep-on-top.
const bridge = `<script>
(function () {
  var T = window.__TAURI__;
  if (!T || !T.core) return;
  var invoke = T.core.invoke;
  window.keygridDesktop = {
    loadHistory: function () { return invoke('load_history').then(function (s) { try { var a = JSON.parse(s || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }); },
    saveHistory: function (arr) { return invoke('save_history', { data: JSON.stringify(arr) }); },
    setOnTop: function (on) { return invoke('set_on_top', { on: !!on }); }
  };
})();
</script>`;

// Reset the web skeleton normally adds when Keygrid is published as a page.
const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>:root{color-scheme:light}body{margin:0;font:14px system-ui,-apple-system,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${bridge}
`;
fs.writeFileSync(path.join(root, 'src', 'index.html'), head + page + '\n</body>\n</html>\n');
console.log('Wrote src/index.html');
