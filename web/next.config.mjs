/** @type {import('next').NextConfig} */

import * as dotenv from "dotenv";
dotenv.config({path: '../.env'})

const nextConfig = {
  reactStrictMode: false,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    MIXPANEL_PROJECT_TOKEN: process.env.MIXPANEL_PROJECT_TOKEN,
    APP_ENV: process.env.APP_ENV,
    APP_NAME: process.env.APP_NAME,
  },
};

export default nextConfig;
