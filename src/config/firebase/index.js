// lib/firebase.ts
import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config()

const firebaseConfig = {
  credential: admin.credential.cert({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
}

export const firebase = admin.apps.length
  ? admin.app()
  : admin.initializeApp(firebaseConfig)

export const firebaseDb = firebase.firestore()
