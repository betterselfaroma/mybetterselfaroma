const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const mobileRoot = path.join(root, "mobile-admin");
const androidRoot = path.join(mobileRoot, "android");

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function npmCmd() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function npxCmd() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

function gradleCmd() {
  return process.platform === "win32" ? "gradlew.bat" : "./gradlew";
}

function commandExists(command) {
  const checker = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(checker, [command], {
    stdio: "ignore",
  });
  return result.status === 0;
}

function ensureJavaAvailable() {
  if (process.env.JAVA_HOME || commandExists("java")) return;

  console.error("\nJava/JDK was not found.");
  console.error("Install Android Studio or a JDK, then set JAVA_HOME or add java to PATH.");
  console.error("After that, rerun: npm run apk:debug");
  process.exit(1);
}

function run(label, command, args, cwd) {
  console.log(`\n${label}`);
  const commandLine = [command, ...args].join(" ");
  const actualCommand = process.platform === "win32" ? "cmd.exe" : command;
  const actualArgs = process.platform === "win32" ? ["/d", "/s", "/c", commandLine] : args;
  const result = spawnSync(actualCommand, actualArgs, {
    cwd,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    console.error(`\nDebug APK build failed during: ${label}`);
    process.exit(result.status || 1);
  }
}

function findApks(dir, output = []) {
  if (!fs.existsSync(dir)) return output;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) findApks(fullPath, output);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".apk")) output.push(fullPath);
  }

  return output;
}

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function main() {
  if (!fs.existsSync(mobileRoot)) {
    console.error("mobile-admin directory was not found.");
    process.exit(1);
  }

  if (!fs.existsSync(androidRoot)) {
    console.error("mobile-admin/android directory was not found.");
    process.exit(1);
  }

  console.log("Building Better Self Aroma mobile-admin Debug APK.");
  console.log("Release/AAB build is not run by this script.");

  run("1/3 mobile-admin npm run build", npmCmd(), ["run", "build"], mobileRoot);
  run("2/3 npx cap sync android", npxCmd(), ["cap", "sync", "android"], mobileRoot);
  ensureJavaAvailable();
  run("3/3 gradlew assembleDebug", gradleCmd(), ["assembleDebug"], androidRoot);

  const apkDir = path.join(androidRoot, "app", "build", "outputs", "apk", "debug");
  const apks = findApks(apkDir).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  if (!apks.length) {
    console.error("\nDebug build finished, but no APK was found under mobile-admin/android/app/build/outputs/apk/debug.");
    process.exit(1);
  }

  const apkPath = apks[0];
  const size = fs.statSync(apkPath).size;

  console.log("\nDebug APK build succeeded.");
  console.log(`APK path: ${rel(apkPath)}`);
  console.log(`APK size: ${formatBytes(size)}`);
}

main();
