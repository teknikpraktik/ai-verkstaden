// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Statisk sajt. Publiceras på Vercel från roten (/). Sätt BASE_PATH om sajten
// någon gång ska ligga under en undersökväg, t.ex. BASE_PATH=/ai-verkstaden.
export default defineConfig({
  output: 'static',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [react()],
});
