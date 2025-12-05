// Simple downloader to fetch palm/garden maintenance demo images into assets/maintenance
// Run: node scripts/fetch-maintenance-images.js
const fs = require('fs');
const path = require('path');
const https = require('https');

const outDir = path.resolve(__dirname, '..', 'assets', 'maintenance');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Pruned_date_palm_in_Dubai.jpg',
    out: 'palm_1.jpg',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Date_palm_farming.jpg',
    out: 'palm_2.jpg',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Date_Palm_Tree_in_Dubai.jpg',
    out: 'palm_3.jpg',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Phoenix_dactylifera%2C_India%2C_2020.jpg',
    out: 'palm_4.jpg',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Date_Palm_fruit.jpg',
    out: 'palm_5.jpg',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Date_palm_pruning.jpg',
    out: 'palm_6.jpg',
  },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(dest, () => {});
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

(async () => {
  for (const f of files) {
    const dest = path.join(outDir, f.out);
    try {
      await download(f.url, dest);
      console.log(`Saved ${dest}`);
    } catch (e) {
      console.warn(`Failed ${f.url}: ${e.message}`);
    }
  }
})();





