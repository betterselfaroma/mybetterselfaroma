const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const failures = [];
const warnings = [];

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function npmCmd() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function addFailure(message) {
  failures.push(message);
  console.error(`[fail] ${message}`);
}

function addPass(message) {
  console.log(`[pass] ${message}`);
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function stripComments(line) {
  return line.replace(/\s+#.*$/, "").trim();
}

function loadIgnoreLines(relativePath) {
  return readText(relativePath)
    .split(/\r?\n/)
    .map(stripComments)
    .filter(Boolean);
}

function hasAnyPattern(lines, patterns) {
  return patterns.some((pattern) => lines.includes(pattern));
}

function listFilesFromGit() {
  const result = spawnSync("git", ["ls-files", "-co", "--exclude-standard"], {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    warnings.push("git ls-files failed; falling back to filesystem scan.");
    return null;
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => path.join(root, line));
}

function listFilesFromFs(dir, output = []) {
  const ignoredDirs = new Set([
    ".git",
    ".next",
    ".vercel",
    "node_modules",
    "out",
    "build",
    "dist",
    "tmp",
  ]);

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relative = rel(fullPath);

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      if (relative === "mobile-admin/android/.gradle") continue;
      if (relative === "mobile-admin/android/build") continue;
      if (relative === "mobile-admin/android/app/build") continue;
      if (relative === "mobile-admin/node_modules") continue;
      if (relative === "mobile-admin/dist") continue;
      if (relative === "native-admin/android/.gradle") continue;
      if (relative === "native-admin/android/build") continue;
      if (relative === "native-admin/android/app/build") continue;
      if (relative === "native-admin/node_modules") continue;
      if (relative === "native-admin/.expo") continue;
      listFilesFromFs(fullPath, output);
    } else {
      output.push(fullPath);
    }
  }

  return output;
}

function getCandidateFiles() {
  return listFilesFromGit() ?? listFilesFromFs(root);
}

function isTextFile(filePath) {
  const textExtensions = new Set([
    ".cjs",
    ".css",
    ".env",
    ".example",
    ".gradle",
    ".html",
    ".js",
    ".json",
    ".jsx",
    ".md",
    ".mjs",
    ".properties",
    ".sql",
    ".ts",
    ".tsx",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
  ]);

  const base = path.basename(filePath);
  if (base.startsWith(".env")) return true;
  return textExtensions.has(path.extname(filePath).toLowerCase());
}

function readIfText(filePath) {
  if (!isTextFile(filePath)) return null;
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function base64UrlDecode(input) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function containsServiceRoleJwt(text) {
  const jwtPattern = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
  const matches = text.match(jwtPattern) ?? [];

  for (const token of matches) {
    const [, payload] = token.split(".");
    try {
      const parsed = JSON.parse(base64UrlDecode(payload));
      if (parsed.role === "service_role") return true;
    } catch {
      // Ignore non-Supabase JWT-like text.
    }
  }

  return false;
}

function hasNonEmptyServiceRoleEnv(text) {
  const envPattern = /^SUPABASE_SERVICE_ROLE_KEY[ \t]*=[ \t]*(.*)$/gm;
  let match;

  while ((match = envPattern.exec(text))) {
    const value = match[1].trim().replace(/^['"]|['"]$/g, "");
    if (value && !/^<.*>$/.test(value) && !/^TODO/i.test(value) && value !== "server-only") {
      return true;
    }
  }

  return false;
}

function isSourceOrEnvFile(relativePath) {
  return (
    relativePath.startsWith("app/") ||
    relativePath.startsWith("components/") ||
    relativePath.startsWith("lib/") ||
    relativePath.startsWith("mobile-admin/src/") ||
    relativePath.startsWith("native-admin/src/") ||
    relativePath === ".env.example" ||
    relativePath === "mobile-admin/.env.example" ||
    relativePath === "native-admin/.env.example" ||
    relativePath.endsWith(".env") ||
    relativePath.endsWith(".env.local")
  );
}

function checkRequiredFiles() {
  const required = [
    "public/manifest.webmanifest",
    "public/service-worker.js",
    "public/icons/icon-192.png",
    "public/icons/icon-512.png",
  ];

  for (const file of required) {
    if (exists(file)) addPass(`${file} exists`);
    else addFailure(`${file} is missing`);
  }
}

function checkVercelIgnore() {
  const lines = loadIgnoreLines(".vercelignore");
  if (hasAnyPattern(lines, ["mobile-admin", "mobile-admin/"])) addPass(".vercelignore ignores mobile-admin");
  else addFailure(".vercelignore must include mobile-admin");

  if (hasAnyPattern(lines, ["mobile-admin/**", "mobile-admin/**/*"])) addPass(".vercelignore ignores mobile-admin contents");
  else addFailure(".vercelignore must include mobile-admin/**");

  if (hasAnyPattern(lines, ["native-admin", "native-admin/"])) addPass(".vercelignore ignores native-admin");
  else addFailure(".vercelignore must include native-admin");

  if (hasAnyPattern(lines, ["native-admin/**", "native-admin/**/*"])) addPass(".vercelignore ignores native-admin contents");
  else addFailure(".vercelignore must include native-admin/**");
}

function checkGitIgnore() {
  const lines = loadIgnoreLines(".gitignore");
  const checks = [
    {
      label: ".env.local files",
      patterns: [".env.local", ".env*.local", "**/.env.local", "mobile-admin/.env.local", "native-admin/.env.local"],
    },
    {
      label: "node_modules",
      patterns: ["node_modules", "node_modules/", "/node_modules", "mobile-admin/node_modules/", "native-admin/node_modules/"],
    },
    {
      label: "dist output",
      patterns: ["dist/", "/dist", "/dist/", "mobile-admin/dist/", "native-admin/dist/"],
    },
    {
      label: "Android Gradle cache",
      patterns: [".gradle/", "mobile-admin/android/.gradle/", "native-admin/android/.gradle/", "android/.gradle/"],
    },
    {
      label: "Android build outputs",
      patterns: [
        "mobile-admin/android/build/",
        "mobile-admin/android/app/build/",
        "native-admin/android/build/",
        "native-admin/android/app/build/",
        "android/build/",
        "android/app/build/",
      ],
    },
    {
      label: "Android keystores",
      patterns: [
        "*.keystore",
        "**/*.keystore",
        "mobile-admin/**/*.keystore",
        "native-admin/**/*.keystore",
        "*.jks",
        "**/*.jks",
        "mobile-admin/**/*.jks",
        "native-admin/**/*.jks",
      ],
    },
  ];

  for (const check of checks) {
    if (hasAnyPattern(lines, check.patterns)) addPass(`.gitignore ignores ${check.label}`);
    else addFailure(`.gitignore must ignore ${check.label}`);
  }
}

function checkMobileAdminExcludedFromWebsiteBuild() {
  const packageJson = JSON.parse(readText("package.json"));
  const buildScript = packageJson.scripts?.build ?? "";
  if (/next\s+build/.test(buildScript) && !/mobile-admin|capacitor|vite/.test(buildScript)) {
    addPass("root build script only builds the Next.js website");
  } else {
    addFailure("root package.json build script must not build mobile-admin");
  }

  const tsconfig = JSON.parse(readText("tsconfig.json"));
  const excluded = new Set(tsconfig.exclude ?? []);
  if (excluded.has("mobile-admin") && excluded.has("mobile-admin/**/*")) {
    addPass("root tsconfig excludes mobile-admin");
  } else {
    addFailure("root tsconfig must exclude mobile-admin and mobile-admin/**/*");
  }

  if (excluded.has("native-admin") && excluded.has("native-admin/**/*")) {
    addPass("root tsconfig excludes native-admin");
  } else {
    addFailure("root tsconfig must exclude native-admin and native-admin/**/*");
  }
}

function checkForbiddenBookingReferences(files) {
  const sourceFiles = files.filter((filePath) => {
    const relativePath = rel(filePath);
    return (
      relativePath.startsWith("app/") ||
      relativePath.startsWith("components/") ||
      relativePath.startsWith("lib/") ||
      relativePath.startsWith("mobile-admin/src/") ||
      relativePath.startsWith("native-admin/src/")
    );
  });

  for (const filePath of sourceFiles) {
    const text = readIfText(filePath);
    if (!text) continue;
    const relativePath = rel(filePath);

    if (/\bbookings\s*\.\s*start_time\b/.test(text)) {
      addFailure(`${relativePath} references bookings.start_time`);
    }

    if (/\bbookings\s*\.\s*end_time\b/.test(text)) {
      addFailure(`${relativePath} references bookings.end_time`);
    }

    if (/\.select\s*\(\s*([`'"])[\s\S]*?customer_name[\s\S]*?\1\s*\)/.test(text)) {
      addFailure(`${relativePath} selects customer_name from Supabase`);
    }
  }
}

function checkServiceRoleSafety(files) {
  for (const filePath of files) {
    const text = readIfText(filePath);
    if (!text) continue;
    const relativePath = rel(filePath);

    if (containsServiceRoleJwt(text)) {
      addFailure(`${relativePath} contains a Supabase service_role JWT`);
    }

    if (isSourceOrEnvFile(relativePath) && /(?:NEXT_PUBLIC|VITE)_SUPABASE_SERVICE_ROLE_KEY/.test(text)) {
      addFailure(`${relativePath} exposes SUPABASE_SERVICE_ROLE_KEY to the frontend/APK`);
    }

    if (isSourceOrEnvFile(relativePath) && hasNonEmptyServiceRoleEnv(text)) {
      addFailure(`${relativePath} contains a non-empty SUPABASE_SERVICE_ROLE_KEY assignment`);
    }
  }

  if (!failures.some((message) => message.includes("SUPABASE_SERVICE_ROLE_KEY") || message.includes("service_role JWT"))) {
    addPass("no committed Supabase service-role secret detected");
  }
}

function runBuild() {
  console.log("\nRunning root production build...");
  const command = process.platform === "win32" ? "cmd.exe" : npmCmd();
  const args = process.platform === "win32" ? ["/d", "/s", "/c", "npm run build"] : ["run", "build"];
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
  });

  if (result.status === 0) addPass("npm run build passed");
  else addFailure("npm run build failed");
}

function main() {
  console.log("Checking Better Self Aroma production readiness...\n");

  const files = getCandidateFiles();

  checkRequiredFiles();
  checkVercelIgnore();
  checkGitIgnore();
  checkMobileAdminExcludedFromWebsiteBuild();
  checkForbiddenBookingReferences(files);
  checkServiceRoleSafety(files);

  if (warnings.length) {
    console.warn("\nWarnings:");
    for (const warning of warnings) console.warn(`- ${warning}`);
  }

  if (failures.length) {
    console.error(`\nProduction readiness failed with ${failures.length} issue(s).`);
    process.exit(1);
  }

  runBuild();

  if (failures.length) {
    console.error(`\nProduction readiness failed with ${failures.length} issue(s).`);
    process.exit(1);
  }

  console.log("\nProduction readiness check passed.");
}

main();
