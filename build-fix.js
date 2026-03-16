import fs from "fs";
import path from "path";

// Move dist/src/popup/index.html to dist/popup/index.html
const srcHtml = path.join(import.meta.dirname, "dist/src/popup/index.html");
const destHtml = path.join(import.meta.dirname, "dist/popup/index.html");

if (fs.existsSync(srcHtml)) {
  fs.copyFileSync(srcHtml, destHtml);
  console.log("✓ Copied HTML to dist/popup/index.html");
}

// Clean up dist/src
try {
  fs.rmSync(path.join(import.meta.dirname, "dist/src"), { recursive: true });
  console.log("✓ Cleaned up dist/src");
} catch {
  // Ignore
}
