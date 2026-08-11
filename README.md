# SplitS — the exchange counter

A simple, ad-free trip expense splitter. Add an expense in any of 30+ currencies and it is
always totalled in Israeli shekels (ILS). Create trips, add the people on each, mark who paid
and how each expense is split, and get a clear "who owes whom" settle-up — all in shekels.

The interface is in Hebrew (right-to-left).

## Use it

Open the hosted page on your phone or computer:

**https://ran968.github.io/shekel-split/**

Your data is stored locally in your browser. Nothing is uploaded to a server.

### Install it as an app

- **Android / Chrome / Edge:** open the link, then tap the install icon in the address bar (or the in-app "install" button) → **Install**.
- **iPhone / iPad (Safari):** open the link, tap the **Share** button, then **Add to Home Screen**.

It launches full-screen with its own icon, and the app shell works offline once installed.

## Features

- Convert any currency to ILS using live daily rates (Frankfurter API), with an offline fallback
- Multiple trips, each with its own members and expenses
- Per-expense "paid by" and "split between"
- Split a single payment across several payers (e.g. each pays half), with editable amounts
- Per-person summary: how much each spent, their share, and the net they owe or get back
- Minimal-transaction settle-up in shekels
- Share a trip by link or code; importing merges expenses, so two people can keep in sync
- Optional Google sign-in: once configured (see below), trips sync automatically across devices in real time — no manual re-sharing needed

## Enabling Google sign-in + auto-sync (optional)

The app works fully without this — it just falls back to the manual share-link flow above. To turn on
automatic sync, set up a free Firebase project (no credit card, well within the free tier for personal use):

1. Go to the [Firebase console](https://console.firebase.google.com) → **Add project** → give it a name → you can disable Google Analytics → **Create**.
2. In the project, click the **Web** icon (`</>`) → nickname it → **Register app**. Copy the `firebaseConfig` object shown (six values: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).
3. **Build → Authentication → Get started → Sign-in method** → enable **Google** → set a support email → **Save**.
4. Still in Authentication → **Settings → Authorized domains** → **Add domain** → add `ran968.github.io`.
5. **Build → Firestore Database → Create database** → **Start in production mode** → pick a region → **Enable**.
6. In Firestore's **Rules** tab, replace the contents with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /trips/{tripId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   **Publish**. (Anyone signed in with Google who knows a trip's link can read/write that trip — the same "anyone with the link" trust model the manual share links already use, not a member allow-list.)
7. Paste the six config values from step 2 into `firebase-config.js`, replacing the `REPLACE_ME` placeholders. Bump the `CACHE` version string in `sw.js` so installed devices pick up the change, then commit and push.

Once configured, opening the app for the first time shows a sign-in prompt (skippable). Signing in turns every
existing and future trip into a cloud trip that updates live on every device signed into the same Google account,
or that opens a share link and signs in.
- Category tags, per-currency breakdown, light and dark themes

## Tech

A single self-contained `index.html` — no build step, no dependencies, no accounts.
