# SeatKeeper — Flash Sale Seat Reservation (Concert X)

A tiny, correctness-first system for a single flash-sale event: **Concert X — 30 seats total.**
Users can place a temporary hold on a seat and confirm it before the hold expires.

- **Live frontend:** https://seatkeeper.vercel.app
- **Live backend:** https://seatkeeper.onrender.com

## Stack
Node.js + Express + MongoDB (Mongoose) backend, React (Vite + Tailwind) frontend, Axios for API calls.

## The core problem this project solves

The naive approach — "count how many seats are taken, and if it's under 30, allow one more" —
breaks under concurrent load. It's a **read-then-write race condition**: two requests can both
read "29 taken" at almost the same instant, both decide there's room, and both write, exceeding
30 seats. The entire point of this assessment is to avoid that, even under 100 simultaneous
requests.

## Design: one document per seat, atomic claim

Instead of a single counter, MongoDB holds **30 seat documents** (`seatNumber: 1..30`), each with
a `status` of `available`, `held`, or `confirmed`.

MongoDB guarantees that operations on a *single document* are atomic — no two concurrent writers
can both "win" the same document. Claiming a seat is therefore one atomic operation that combines
the check and the write into a single step, so there is no gap for a second request to sneak
into:

```js
Seat.findOneAndUpdate(
  {
    $or: [
      { status: 'available' },
      { status: 'held', expiresAt: { $lte: now } }, 
    ],
  },
  { $set: { status: 'held', email, holdId, expiresAt } },
  { returnDocument: 'after' }
);
```

Each of the 100 simultaneous requests runs this same query independently. MongoDB serializes
writes at the document level, so as soon as one request claims a seat, that seat's `status`
flips immediately — the next request's query no longer matches that document and moves on to the
next available one. Once all 30 seats are taken, the query matches nothing and any further
request correctly receives a "no seats available" response. There is no in-memory counter to
race on and no application-level lock required.

## Expiry approach: TTL + on-read reconciliation

Each hold stores an `expiresAt` timestamp, set to `now + 2 minutes` when a seat is claimed.
**No background job or cron runs to clean up expired holds.** Instead, every read or write that
touches seat data checks `expiresAt` against the current time and treats an expired hold as
reclaimable right at that moment:

- **`reserveSeat`** treats a seat as claimable if it's `available`, *or* if it's `held` but its
  `expiresAt` has already passed — reclaimed atomically as part of the same `findOneAndUpdate`
  used to place a new hold. This is what keeps the "seat must free up correctly even if it
  expires while other users are reserving" requirement satisfied: the check happens inline,
  atomically, at the exact moment of the conflicting request, not on a delayed timer.
- **`confirmSeat`** only converts a hold to `confirmed` if `status: 'held'` **and**
  `expiresAt > now`. An already-expired hold fails confirmation with a clear error.
- **`getSeatStatus`** never needs to "clean up" stale documents to report correct numbers. It
  computes `available` as `totalSeats - (confirmed + held)`, where `held` itself is only counted
  if `expiresAt > now`. A seat whose hold has technically expired but whose `status` field still
  says `held` in the database is therefore automatically excluded from the `held` count and
  implicitly counted as available — without ever needing to write back to the database on read.

This was chosen over a background job deliberately: it avoids an extra moving part (a scheduler
that could drift or fail silently), and every place that decides "is this seat available" applies
the exact same expiry check, so there's a single source of truth rather than two systems that
need to stay in sync.

## Idempotency

- **Reserve retry:** before claiming a new seat, `reserveSeat` checks whether the given email
  already has an active (non-expired) hold, and if so, returns that *same* `holdId` and
  `expiresAt` instead of creating a second one. It also rejects a new reservation if the email
  already holds a **confirmed** seat, so one user cannot occupy multiple seats.
- **Double confirm:** `confirmSeat` first checks if the given `holdId` is already `confirmed`;
  if so, it returns a success message again instead of erroring or creating a duplicate seat.
  Confirming an expired or unknown `holdId` returns a clear error instead.
- **Why a separate `holdId` instead of reusing the seat's `_id`/`seatNumber`:** a seat gets
  recycled across many different holders over time (one hold expires, someone else later claims
  the same seat). `holdId` is a fresh UUID generated on every claim, so a stale confirm request
  from a previous holder can never accidentally confirm a seat that has since moved on to
  someone else — it simply won't match any current hold.

## API Endpoints

| Method | Path | Body / Query | Response |
|---|---|---|---|
| `POST` | `/api/reserve` | `{ "email": "user@example.com" }` | `{ holdId, expiresAt, message }` |
| `POST` | `/api/confirm` | `{ "holdId": "..." }` | `{ message, status, email }` |
| `GET` | `/api/status` | — | `{ totalSeats, confirmed, held, available }` |
| `GET` | `/api/reservations` | `?email=user@example.com` | `{ status, seatNumber, holdId? }` |

`/api/reservations` is an additional convenience endpoint (not required by the original spec)
that lets a user look up their own current hold/confirmation status by email.

## Project structure

```
backend/
  config/db.js               MongoDB connection
  models/Seat.js               one document per seat (status, email, holdId, expiresAt)
  controllers/
    reserveController.js       reserve logic + idempotency
    confirmController.js       confirm logic + idempotency
    statusControllers.js       live seat counts
    reservationController.js   look up a reservation by email
  routes/                     one router file per resource
  middleware/error.js          centralized error handling (CastError, duplicate key, validation)
  utils/ErrorHandler.js        custom Error subclass carrying a statusCode
  utils/seedSeats.js           idempotent seeding of 30 seats on startup
  server.js                    connect DB -> seed seats -> mount routes -> listen

frontend/
  src/services/api.js          Axios client, one function per endpoint
  src/components/
    ReserveSeat.jsx             reserve form + success/error states
    ConfirmSeat.jsx              confirm form + success/error states
    GetStatus.jsx                 live available/held/confirmed counter
    ReservationStatus.jsx         look up a reservation by email
  src/App.jsx                  tab navigation + live countdown timer for the active hold
```

## Countdown behavior (frontend)

After a successful reserve, the countdown is computed from the server's `expiresAt` timestamp
(`Math.round((expiresAt - now) / 1000)`) rather than assumed to always be a fresh 120 seconds —
this keeps the timer accurate even on an idempotent retry, where the returned hold may already
have less than 2 minutes remaining. Confirming a seat clears the countdown banner immediately,
so a confirmed (permanent) seat is never shown with a misleading "expiring soon" timer.

## Running locally

**Backend**
```bash
cd backend
npm install
# .env: MONGO_URI, PORT, CLIENT_URL=http://localhost:5173
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
# .env: VITE_API_URL=http://localhost:5000/api
npm run dev
```