import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { FirebaseConfig } from '../config';

const app = getApps().length ? getApps()[0] : initializeApp(FirebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function loginWithGoogle() {
  if (Platform.OS !== 'web') {
    throw new Error('Google Sign-In natif non configuré. Utiliser le web ou intégrer expo-auth-session.');
  }
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  await ensureUserProfile(res.user);
  return res.user;
}

export async function logout() {
  await signOut(auth);
}

export function onAuthChanged(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

async function ensureUserProfile(user: User) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: Date.now(),
      hints: 0,
      totalScore: 0,
    });
  }
}
