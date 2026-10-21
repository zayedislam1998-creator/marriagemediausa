const fs = require('fs');
const path = require('path');

function copyDirRecursiveSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('--- Step 1: Cleaning out/ directory ---');
const outDir = path.resolve('out');
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

console.log('--- Step 2: Copying public/ -> out/ ---');
const publicDir = path.resolve('public');
if (fs.existsSync(publicDir)) {
  copyDirRecursiveSync(publicDir, outDir);
}

console.log('--- Step 3: Copying .next/static/ -> out/_next/static/ ---');
const nextStaticDir = path.resolve('.next', 'static');
const outNextStaticDir = path.resolve(outDir, '_next', 'static');
if (fs.existsSync(nextStaticDir)) {
  copyDirRecursiveSync(nextStaticDir, outNextStaticDir);
} else {
  console.error('Error: .next/static does not exist! Did you run `next build`?');
  process.exit(1);
}

console.log('--- Step 4: Copying .next/server/app/ -> out/ ---');
const serverAppDir = path.resolve('.next', 'server', 'app');
if (fs.existsSync(serverAppDir)) {
  copyDirRecursiveSync(serverAppDir, outDir);
}

// Clean up any dynamic template HTML that shouldn't be served statically
const dynamicProfile = path.join(outDir, 'profile', '[id].html');
if (fs.existsSync(dynamicProfile)) {
  fs.unlinkSync(dynamicProfile);
}

console.log('--- Step 4b: Validating critical HTML pages (index.html, search.html) ---');
const indexHtmlPath = path.join(outDir, 'index.html');
if (!fs.existsSync(indexHtmlPath) || fs.statSync(indexHtmlPath).size === 0) {
  console.error('FATAL: out/index.html is missing or 0 bytes! Static generation failed.');
  process.exit(1);
}
console.log(`Verified out/index.html (${fs.statSync(indexHtmlPath).size} bytes).`);

const searchHtmlPath = path.join(outDir, 'search.html');
if (fs.existsSync(searchHtmlPath)) {
  console.log(`Verified out/search.html (${fs.statSync(searchHtmlPath).size} bytes).`);
}

console.log('--- Step 5: Auditing all HTML files in out/ for broken CSS/JS references ---');
let totalChecked = 0;
let missingFiles = [];

function checkHtmlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const cssMatches = [...content.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map(m => m[1]);
  const jsMatches = [...content.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map(m => m[1]);

  for (const assetPath of [...cssMatches, ...jsMatches]) {
    totalChecked++;
    const diskPath = path.join(outDir, assetPath.replace(/^\//, '').replace(/\//g, path.sep));
    if (!fs.existsSync(diskPath)) {
      missingFiles.push({ html: path.relative(outDir, filePath), asset: assetPath, diskPath });
    }
  }
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '_next') {
        scanDir(fullPath);
      }
    } else if (entry.name.endsWith('.html')) {
      checkHtmlFile(fullPath);
    }
  }
}

scanDir(outDir);

console.log(`Audited ${totalChecked} asset references across HTML pages.`);
if (missingFiles.length > 0) {
  console.error('FAILED: Found missing assets!');
  for (const m of missingFiles) {
    console.error(`- In ${m.html}: missing ${m.asset} (expected at ${m.diskPath})`);
  }
  process.exit(1);
}

console.log('SUCCESS: 100% of CSS and JS assets are physically verified in out/!');
