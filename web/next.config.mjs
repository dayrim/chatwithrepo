/** @type {import('next').NextConfig} */

// import * as dotenv from "dotenv";
// import { join } from "path";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config({ path: join(__dirname, "../.env") });

const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN:
      process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
