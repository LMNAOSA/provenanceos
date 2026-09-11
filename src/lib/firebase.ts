import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "neat-cider-4ghtt",
  appId: "1:572536214331:web:4f3d722afc02d0a2b69d1e",
  apiKey: "AIzaSyCJcEG-y6DPbG5-r41k2_ZNTmLI2nnzxNE",
  authDomain: "neat-cider-4ghtt.firebaseapp.com",
  storageBucket: "neat-cider-4ghtt.firebasestorage.app",
  messagingSenderId: "572536214331",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-provenanceos-a45d4124-22d1-497f-b091-510f21fbbaec");
