import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'lol.chesski.app',
  appName: 'Chesski',
  webDir: 'out',
  plugins: {
    GoogleAuth: {
      androidClientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
      scopes: ["email", "profile"]
    },
  }
};

export default config;
