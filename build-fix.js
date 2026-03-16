import fs from "fs";
import path from "path";

const baseDir = import.meta.dirname;

copyIfExists(
  path.join(baseDir, "dist/src/popup/index.html"),
  path.join(baseDir, "dist/popup/index.html"),
  "Copied HTML to dist/popup/index.html",
);
copyIfExists(
  path.join(baseDir, "manifest.json"),
  path.join(baseDir, "dist/manifest.json"),
  "Copied manifest.json to dist/",
);

removeIfExists(path.join(baseDir, "dist/src"), "Cleaned up dist/src");
removeIfExists(path.join(baseDir, "dist/public"), "Removed stale dist/public");

function copyIfExists(source, destination, message) {
  if (!fs.existsSync(source)) {
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  console.log(message);
}

function removeIfExists(target, message) {
  if (!fs.existsSync(target)) {
    return;
  }

  fs.rmSync(target, { recursive: true, force: true });
  console.log(message);
}
