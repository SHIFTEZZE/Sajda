/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const config = {
  appId: 'com.sajda.companion',
  appName: 'سجدة - Sajda',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
