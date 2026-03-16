import fs from "fs";
import path from "path";

const baseDir = import.meta.dirname;

// Move dist/src/popup/index.html to dist/popup/index.html
const srcHtml = path.join(baseDir, "dist/src/popup/index.html");
const destHtml = path.join(baseDir, "dist/popup/index.html");

if (fs.existsSync(srcHtml)) {
  fs.copyFileSync(srcHtml, destHtml);
  console.log("✓ Copied HTML to dist/popup/index.html");
}

// Copy manifest.json to dist/
const srcManifest = path.join(baseDir, "manifest.json");
const destManifest = path.join(baseDir, "dist/manifest.json");

if (fs.existsSync(srcManifest)) {
  fs.copyFileSync(srcManifest, destManifest);
  console.log("✓ Copied manifest.json to dist/");
}

// Copy icons to dist/
const iconSrcDir = path.join(baseDir, "public/icons");
const iconDestDir = path.join(baseDir, "dist/public/icons");

if (fs.existsSync(iconSrcDir)) {
  fs.mkdirSync(iconDestDir, { recursive: true });
  const icons = fs.readdirSync(iconSrcDir);
  icons.forEach(icon => {
    fs.copyFileSync(
      path.join(iconSrcDir, icon),
      path.join(iconDestDir, icon)
    );
  });
  console.log(`✓ Copied ${icons.length} icons to dist/public/icons/`);
}

// Clean up dist/src
try {
  fs.rmSync(path.join(baseDir, "dist/src"), { recursive: true });
  console.log("✓ Cleaned up dist/src");
} catch {
  // Ignore
}
