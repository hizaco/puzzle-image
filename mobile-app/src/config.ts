import Constants from 'expo-constants';

// Supporte tes clés dans extra.expoPublic.* (app.json)
const extra = (Constants.expoConfig?.extra ?? {}) as any;
const expoPublic = extra.expoPublic ?? extra;

export const FirebaseConfig = {
  apiKey: expoPublic.EXPO_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: expoPublic.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: expoPublic.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
  appId: expoPublic.EXPO_PUBLIC_FIREBASE_APP_ID as string,
};
