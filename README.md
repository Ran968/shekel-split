# Shékel — the exchange counter

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
- Category tags, per-currency breakdown, light and dark themes

## Tech

A single self-contained `index.html` — no build step, no dependencies, no accounts.
