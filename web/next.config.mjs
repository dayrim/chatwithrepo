/** @type {import('next').NextConfig} */

import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const nextConfig = {
  reactStrictMode: false,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN:
      process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN,
    APP_ENV: process.env.APP_ENV,
    APP_NAME: process.env.APP_NAME,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    API_URL: process.env.API_URL,
  },
};

export default nextConfig;
