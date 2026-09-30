import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDQRVXCxHZfy3cLUJg2jG3kUTuBABHMbc",
  authDomain: "cma-mcq-portal-cf33f.firebaseapp.com",
  projectId: "cma-mcq-portal-cf33f",
  storageBucket: "cma-mcq-portal-cf33f.firebasestorage.app",
  messagingSenderId: "208738737302",
  appId: "1:208738737302:web:3754a55033f67a8ffef6b7",
  measurementId: "G-TXD74QQE8F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

window.CMAZoneFirebase = {
  app, auth, db, provider,
  signInGoogle: () => signInWithPopup(auth, provider),
  signOutUser: () => signOut(auth),
  onAuthStateChanged
};

async function syncUser(user) {
  if (!user) return;
  const userData = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, "portalUsers", user.uid), userData, { merge: true });
  await setDoc(doc(db, "users", user.uid), userData, { merge: true });
  await addDoc(collection(db, "loginEvents"), {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    loginAt: serverTimestamp()
  });
}

window.CMAZoneFirebase.syncUser = syncUser;

onAuthStateChanged(auth, user => {
  window.dispatchEvent(new CustomEvent("cma-auth-changed", { detail: user }));
  if (user) syncUser(user).catch(err => console.error("CMA Zone user sync failed:", err));
});
