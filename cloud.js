// Bridge module: talks to Firebase (ESM, CDN) and exposes a plain callback API on
// window.ShkCloud so the main app script (a classic non-module IIFE) can use it
// without being rewritten as a module itself.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithRedirect, signInWithPopup,
  getRedirectResult, onAuthStateChanged, signOut
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
  getRedirectResult(auth).catch(function () {});
  onAuthStateChanged(auth, function (user) { notifyAuth(user); });
}

function isStandalonePWA() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function isMobileBrowser() {
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
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
    // Popups are unreliable on mobile browsers in general (not just installed PWAs) — redirect there.
    if (isStandalonePWA() || isMobileBrowser()) return signInWithRedirect(auth, provider);
    return signInWithPopup(auth, provider).catch(function (err) {
      if (err && (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request")) {
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
