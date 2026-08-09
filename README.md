# Shékel — the exchange counter

A simple, ad-free trip expense splitter. Add an expense in any of 30+ currencies and it is
always totalled in Israeli shekels (ILS). Create trips, add the people on each, mark who paid
and how each expense is split, and get a clear "who owes whom" settle-up — all in shekels.

The interface is in Hebrew (right-to-left).

## Use it

Open the hosted page on your phone or computer:

**https://ran968.github.io/shekel-split/**

Your data is stored locally in your browser. Nothing is uploaded to a server.

## Features

- Convert any currency to ILS using live daily rates (Frankfurter API), with an offline fallback
- Multiple trips, each with its own members and expenses
- Per-expense "paid by" and "split between"
- Minimal-transaction settle-up in shekels
- Category tags, per-currency breakdown, light and dark themes

## Tech

A single self-contained `index.html` — no build step, no dependencies, no accounts.
