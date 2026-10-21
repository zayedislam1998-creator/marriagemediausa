const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const seed = JSON.parse(fs.readFileSync('seed-data/muslimbibah_domain_seed.json', 'utf8'));
const outDir = path.resolve('public', 'uploads', 'avatars');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://muslimbibah.com/'
      }
    }, (res) => {
      if (res.statusCode === 200) {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      } else {
        resolve(null);
      }
    }).on('error', () => resolve(null));
  });
}

async function run() {
  for (const p of seed.real_profiles_seed) {
    if (!p.photo_url) continue;
    const buffer = await downloadBuffer(p.photo_url);
    if (buffer) {
      const filename = `${p.profile_id}.webp`;
      const filePath = path.join(outDir, filename);
      await sharp(buffer)
        .resize({ width: 360, height: 420, fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(filePath);
      console.log(`Saved local avatar for ${p.profile_id} -> ${filename} (${(fs.statSync(filePath).size/1024).toFixed(1)} KB)`);
    } else {
      console.log(`Could not download avatar for ${p.profile_id}`);
    }
  }
}

run().catch(console.error);
