const { spawnSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const nativeAdminDir = path.join(root, "native-admin");

function run(label, args) {
  const command = process.platform === "win32" ? "cmd.exe" : args[0];
  const commandArgs = process.platform === "win32" ? ["/d", "/s", "/c", label] : args.slice(1);
  const result = spawnSync(command, commandArgs, {
    cwd: nativeAdminDir,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Checking Better Self Aroma native-admin app...\n");
run("npm run typecheck", ["npm", "run", "typecheck"]);
run("npx expo-doctor", ["npx", "expo-doctor"]);
console.log("\nnative-admin check passed.");
