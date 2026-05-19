import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const env = import.meta.env;

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[firebase] Missing required environment variable: ${name}. ` +
        `Copy .env.example to .env.local and fill it in (see SETUP.md).`,
    );
  }
  return value;
}

const firebaseConfig = {
  apiKey: required('VITE_FIREBASE_API_KEY', env.VITE_FIREBASE_API_KEY),
  projectId: required('VITE_FIREBASE_PROJECT_ID', env.VITE_FIREBASE_PROJECT_ID),
  appId: required('VITE_FIREBASE_APP_ID', env.VITE_FIREBASE_APP_ID),
  messagingSenderId: required(
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  ),
  authDomain: required('VITE_FIREBASE_AUTH_DOMAIN', env.VITE_FIREBASE_AUTH_DOMAIN),
  storageBucket: required('VITE_FIREBASE_STORAGE_BUCKET', env.VITE_FIREBASE_STORAGE_BUCKET),
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

const firestoreDatabaseId = required('VITE_FIREBASE_DATABASE_ID', env.VITE_FIREBASE_DATABASE_ID);

const resolvedConfig = {
  ...firebaseConfig,
  authDomain: typeof window !== 'undefined' ? window.location.host : firebaseConfig.authDomain,
};

export const app = getApps().length === 0 ? initializeApp(resolvedConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app, firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('Firestore Error:', { error: errorMessage, operationType, path });
  if (errorMessage.includes('permission-denied') || errorMessage.includes('Missing or insufficient')) {
    console.warn('Check Firestore security rules or authentication state');
  }
}
