import type { Config } from 'tailwindcss';

const config: Config = {
  // Only apply Tailwind to sandbox routes to avoid conflicts with main app CSS modules
  content: [
    './src/app/sandbox/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Add any custom theme extensions here
    },
  },
  plugins: [],
};

export default config;
