# Clara's Birth Companion

A labor support app for Jillian & Noah, built around their birth plans and
Christian hypnobirthing material.

It is offline-first: every screen works with no signal at all, and syncs
between both phones in real time whenever there is a connection.

## What's in it

| Screen | What it does |
| --- | --- |
| **Home** | Countdown, live labor status, one-tap call buttons, a card of the moment |
| **Surge timer** | Big tap target, rolling averages, 4-1-1 / 5-1-1 reading, keeps the screen awake |
| **Affirmations** | All 35 cards (18 Scripture, 17 affirmations) — swipe, shuffle, favorite, read aloud, auto-advance |
| **Birth plan** | Birth center + hospital backup, with a "short version" to show staff and a big-text mode |
| **Noah's playbook** | Stage-by-stage: do this / don't, what to say, comfort measures, transition script |
| **Breathe** | Paced breathing (surge, box, down-breathing, rest) plus the fear→tension→pain and trust→relaxation→oxytocin diagrams |
| **Prayer** | Prayers for each stage, the "we need a moment to pray" card, worship playlist link |
| **Labor log** | One-tap timestamps that export as Clara's birth story |
| **Checklists** | "Is this it?", all four bags, transfer list, golden hour advocacy list, pre-labor prep |
| **Postpartum** | Feeds, diapers, Jillian's recovery notes, and the call-someone-now warning signs |

## Running it locally

```bash
npm install
npm start
```

Then open <http://localhost:3000>.

To reach it from a phone on the same wifi, use your computer's LAN address —
e.g. `http://192.168.1.42:3000`. Note that "Add to home screen" and the
screen-wake-lock only work over HTTPS or on `localhost`, so for real use,
deploy it.

## Deploying to Railway

1. **New Project → Deploy from GitHub repo →** `noah-austin/birthapp`.
2. Railway detects Node and runs `npm start`. No build step, no database.
3. **Settings → Networking → Generate Domain.** That URL is the app.
4. **(Recommended) Add a volume** so the server keeps its copy across
   redeploys: Railway → your service → **Variables/Volumes → Add Volume**,
   mount path `/data`, then set the variable `DATA_DIR=/data`.
   Without a volume the app still works — each phone holds the full data
   locally and re-uploads on connect — but the server's copy resets on deploy.
5. **(Optional) Set `APP_PASSCODE`** to something you both know. The app will
   then ask for it once per phone before it syncs.

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Set automatically by Railway |
| `DATA_DIR` | `./.data` | Where the sync store is written. Point at a mounted volume. |
| `APP_PASSCODE` | *(none)* | If set, phones must enter it before syncing |

## Installing on your phones

Open the Railway URL on each phone, then:

- **iPhone (Safari):** Share → Add to Home Screen
- **Android (Chrome):** ⋮ → Add to Home screen / Install app

Installed, it opens full-screen and works with no signal.

**Do this before labor**, not during it. Open every screen once so the
service worker caches them, then put the phone in airplane mode and check it
still opens.

## How sync works

Every change is written to the phone first and queued for the server, so the
app never waits on a network. The server merges with last-write-wins per
record and broadcasts to the other phone over a WebSocket. If WebSockets are
blocked (some hospital networks do this) it falls back to plain HTTP POSTs.

Both phones must use the same **room name** — set in Settings, `clara` by
default. Different room, different data.

## Notes on the content

Everything in `public/js/data/` is transcribed from the source material, with
two corrections to the printed affirmation deck:

- One card was labelled **Psalm 55:22** but carried the text of James 4:8,
  which already had its own card. The real Psalm 55:22 text is used here.
- **Matthew 19:26** appeared on two cards; it is included once.

Names, contacts, playlist link and due date are all editable in Settings.

## Layout

```
server/          Node HTTP + WebSocket sync server (no framework, one dependency)
  index.js       Static files, REST fallback, WebSocket hub
  store.js       Last-write-wins record store, JSON-file persistence
public/          The app itself — plain ES modules, no build step
  js/data/       Birth plans, affirmations, playbook, checklists
  js/views/      One module per screen
  sw.js          Service worker (offline)
scripts/         Icon generator (dependency-free PNG encoder)
```

There is no build step and no framework, on purpose: fewer things to break on
the one night it has to work.
