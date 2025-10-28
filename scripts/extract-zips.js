// Node script to extract ZIP archives before starting the app.
// Requires: adm-zip (installed via npm/yarn)
// Usage: node scripts/extract-zips.js

const path = require('path');
const fs = require('fs');

function extractZip(zipRelativePath, destRelativeDir) {
  const root = path.resolve(__dirname, '..');
  const zipPath = path.join(root, zipRelativePath);
  const destDir = path.join(root, destRelativeDir);

  if (!fs.existsSync(zipPath)) {
    console.log(`[WARN] ZIP not found: ${zipRelativePath}`);
    return;
  }

  // Lazy-load to avoid require error if dependency not yet installed
  let AdmZip;
  try {
    AdmZip = require('adm-zip');
  } catch (e) {
    console.error('[ERROR] Dependency "adm-zip" not installed. Run: npm install adm-zip');
    process.exit(1);
  }

  try {
    fs.mkdirSync(destDir, { recursive: true });
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries().map(e => e.entryName);

    console.log(`[INFO] Extracting ${zipRelativePath} -> ${destRelativeDir}`);
    zip.extractAllTo(destDir, true);
    console.log(`[INFO] Extracted ${entries.length} entries`);
    console.log(`[CONTENTS] ${zipRelativePath}:`);
    entries.forEach(name => console.log(` - ${name}`));
  } catch (err) {
    console.error(`[ERROR] Failed to extract ${zipRelativePath}:`, err.message);
    process.exitCode = 1;
  }
}

function main() {
  const targets = [
    ['app/young_pos_system.zip', 'app/young_pos_system'],
    ['constants/young_pos_system.zip', 'constants/young_pos_system'],
  ];

  targets.forEach(([zipPath, destDir]) => extractZip(zipPath, destDir));
  console.log('[DONE] ZIP extraction complete.');
}

if (require.main === module) {
  main();
}