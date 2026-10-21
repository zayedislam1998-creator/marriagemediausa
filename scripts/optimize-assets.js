const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.resolve('public', 'images');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const downloads = [
  // Dividers & UI
  { url: 'https://muslimbibah.com/design/img/w-title-b.png', relPath: 'w-title-b.png' },
  { url: 'https://muslimbibah.com/design/img/address-1.png', relPath: 'address-1.png' },
  // Soul icons
  { url: 'https://muslimbibah.com/design/img/soul-icon/soul-1.png', relPath: 'soul-1.png' },
  { url: 'https://muslimbibah.com/design/img/soul-icon/soul-2.png', relPath: 'soul-2.png' },
  { url: 'https://muslimbibah.com/design/img/soul-icon/soul-3.png', relPath: 'soul-3.png' },
  // Story images
  { url: 'https://muslimbibah.com/design/admin_panel/story_images/2_-_Copy.jpeg', relPath: 'story-pinky.jpg' },
  { url: 'https://muslimbibah.com/design/admin_panel/story_images/Farzana_Faisal.jpg', relPath: 'story-farzana.jpg' },
  { url: 'https://muslimbibah.com/design/admin_panel/story_images/003.jpg', relPath: 'story-nayeem.jpg' },
  { url: 'https://muslimbibah.com/design/admin_panel/logo/demo3.png', relPath: 'demo3.png' },
  { url: 'https://muslimbibah.com/design/admin_panel/logo/demo.png', relPath: 'demo.png' },
  // Banners
  { url: 'https://muslimbibah.com/design/advertisement/everit1.jpg', relPath: 'banner-everit.jpg' },
  { url: 'https://muslimbibah.com/design/advertisement/ads1.jpg', relPath: 'banner-ads1.jpg' },
  { url: 'https://muslimbibah.com/design/advertisement/001.jpg', relPath: 'banner-001.jpg' },
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const parent = path.dirname(destPath);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });

    const file = fs.createWriteStream(destPath);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://muslimbibah.com/'
      }
    }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      resolve(false);
    });
  });
}

async function run() {
  console.log('--- Step 1: Downloading common UI assets locally ---');
  for (const item of downloads) {
    const dest = path.join(targetDir, item.relPath);
    const success = await downloadFile(item.url, dest);
    console.log(`Download ${item.relPath}: ${success ? 'OK' : 'Failed/Skipped'}`);
  }

  console.log('--- Step 2: Optimizing Slider Images with Sharp (WebP @ 82% quality) ---');
  const sliderDir = path.resolve('public', 'images', 'slider');
  const files = fs.readdirSync(sliderDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));

  for (const f of files) {
    const inPath = path.join(sliderDir, f);
    const outName = f.replace(/\.(jpg|jpeg)$/i, '.webp');
    const outPath = path.join(sliderDir, outName);

    await sharp(inPath)
      .resize({ width: 1440, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(outPath);

    const origSize = fs.statSync(inPath).size;
    const newSize = fs.statSync(outPath).size;
    console.log(`Optimized ${f} -> ${outName}: ${(origSize/1024).toFixed(1)}KB -> ${(newSize/1024).toFixed(1)}KB (-${Math.round((1 - newSize/origSize)*100)}%)`);
  }

  console.log('Optimization complete!');
}

run().catch(console.error);
