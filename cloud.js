// Bridge module: talks to Firebase (ESM, CDN) and exposes a plain callback API on
// window.ShkCloud so the main app script (a classic non-module IIFE) can use it
// without being rewritten as a module itself.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithRedirect, signInWithPopup,
  getRedirectResult, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

var cfg = window.__FIREBASE_CONFIG__ || {};
var configured = !!(cfg.apiKey && cfg.apiKey !== "REPLACE_ME" && cfg.projectId && cfg.projectId !== "REPLACE_ME");

var app = null, auth = null, db = null;
if (configured) {
  try {
    app = initializeApp(cfg);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    configured = false;
  }
}

var authListeners = [];
var currentUser = null;

function notifyAuth(user) {
  currentUser = user;
  authListeners.forEach(function (fn) { try { fn(user); } catch (e) {} });
}

if (configured) {
  setPersistence(auth, browserLocalPersistence).catch(function () {});
  getRedirectResult(auth).catch(function () {});
  onAuthStateChanged(auth, function (user) { notifyAuth(user); });
}

window.ShkCloud = {
  configured: configured,

  onAuth: function (fn) {
    authListeners.push(fn);
    if (currentUser !== null || !configured) fn(currentUser);
  },

  currentUser: function () { return currentUser; },

  signIn: function () {
    if (!configured) return Promise.reject(new Error("not-configured"));
    var provider = new GoogleAuthProvider();
    // Popup avoids the cross-origin (firebaseapp.com) redirect round-trip, which some mobile
    // browsers (notably Safari with tracking protection) fail to persist — causing a sign-in loop.
    // Only fall back to redirect if the platform truly can't open a popup.
    return signInWithPopup(auth, provider).catch(function (err) {
      var code = err && err.code;
      if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request" || code === "auth/operation-not-supported-in-this-environment") {
        return signInWithRedirect(auth, provider);
      }
      throw err;
    });
  },

  signOut: function () {
    if (!configured) return Promise.resolve();
    return signOut(auth);
  },

  // Push a full trip object up as the source of truth for that id.
  pushTrip: function (trip) {
    if (!configured || !auth.currentUser) return Promise.reject(new Error("not-signed-in"));
    var data = JSON.parse(JSON.stringify(trip));
    data.updatedAt = serverTimestamp();
    data.updatedBy = auth.currentUser.uid;
    return setDoc(doc(db, "trips", trip.id), data, { merge: false });
  },

  // One-time fetch (used when joining a trip via a share link).
  getTrip: function (tripId) {
    if (!configured) return Promise.reject(new Error("not-configured"));
    return getDoc(doc(db, "trips", tripId)).then(function (snap) {
      return snap.exists() ? snap.data() : null;
    });
  },

  // Live subscription; returns an unsubscribe function.
  subscribeTrip: function (tripId, onChange) {
    if (!configured) return function () {};
    return onSnapshot(doc(db, "trips", tripId), function (snap) {
      if (snap.exists()) onChange(snap.data());
    }, function () { /* permission or network error — ignore, local copy stays usable */ });
  }
};

window.dispatchEvent(new CustomEvent("shkcloud-ready"));
