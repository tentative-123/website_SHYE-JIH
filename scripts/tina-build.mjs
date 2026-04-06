import { spawnSync } from "node:child_process";

const required = ["TINA_PUBLIC_CLIENT_ID", "TINA_TOKEN"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.log(`[build] Skip Tina build. Missing env vars: ${missing.join(", ")}`);
  process.exit(0);
}

console.log("[build] Tina env found. Running Tina build...");

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["--yes", "@tinacms/cli", "build"], {
  stdio: "inherit"
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
