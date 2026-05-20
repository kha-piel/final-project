import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const envFiles = [".env", ".env.local"];

function loadEnvFile(fileName) {
  const filePath = path.join(projectRoot, fileName);
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

const loadedEnv = Object.assign({}, ...envFiles.map(loadEnvFile), process.env);

const supabaseUrl = loadedEnv.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = loadedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

await build({
  entryPoints: ["src/main/resources/auth/auth-app.jsx"],
  bundle: true,
  format: "iife",
  target: "chrome90",
  outfile: "src/main/resources/auth/auth-app.js",
  define: {
    "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(supabaseUrl),
    "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey)
  }
});

console.log("Built auth bundle.");
console.log(
  `Injected NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl ? "[set]" : "[missing]"}`
);
console.log(
  `Injected NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey ? "[set]" : "[missing]"}`
);
