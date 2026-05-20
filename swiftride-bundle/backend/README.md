# SwiftRide — MERN Backend

Express + MongoDB (Mongoose) + JWT + Socket.IO. Mirrors the Flutter taxi-booking
customer app feature set: phone/OTP auth, profile, ride booking flow, ride
history, wallet, and support tickets.

> This backend is **separate** from the Lovable frontend project. Deploy it to
> Render / Railway / Fly / a VPS, and point the React app's `VITE_API_URL` at it.

## Stack
- **M**ongoDB (Atlas recommended)
- **E**xpress 4
- **R**eact (in the parent Lovable project — uses this API)
- **N**ode 18+

Plus: Mongoose, JWT, bcrypt, Zod validation, Socket.IO for live driver tracking,
Helmet + rate limiting for hardening.

## Quick start

```bash
cd server
cp .env.example .env       # fill in MONGO_URI + JWT_SECRET
npm install
npm run seed               # optional: sample drivers + fare config
npm run dev                # http://localhost:4000
```

Health check: `GET /api/health`

## Deploy (Render example)

1. Push `/server` to its own GitHub repo (or use a monorepo + root dir setting).
2. Create a **Web Service** on Render → Node → build `npm install`, start `npm start`.
3. Add env vars from `.env.example`. Use **MongoDB Atlas** for `MONGO_URI`.
4. Set `CLIENT_ORIGIN` to your deployed frontend URL.

## API surface

| Method | Path                       | Auth   | Purpose                          |
|--------|----------------------------|--------|----------------------------------|
| POST   | /api/auth/request-otp      | —      | Send OTP to phone                |
| POST   | /api/auth/verify-otp       | —      | Verify OTP → returns JWT         |
| GET    | /api/auth/me               | Bearer | Current user                     |
| GET    | /api/profile               | Bearer | Get profile                      |
| PATCH  | /api/profile               | Bearer | Update name / email / avatar     |
| POST   | /api/rides/estimate        | Bearer | Fare + distance estimate         |
| POST   | /api/rides                 | Bearer | Create ride request              |
| GET    | /api/rides                 | Bearer | Ride history                     |
| GET    | /api/rides/:id             | Bearer | Ride detail                      |
| PATCH  | /api/rides/:id/cancel      | Bearer | Cancel ride                      |
| GET    | /api/drivers/nearby        | Bearer | Nearby drivers (geo query)       |
| GET    | /api/wallet                | Bearer | Wallet balance + transactions    |
| POST   | /api/wallet/topup          | Bearer | Add funds (mock)                 |
| GET    | /api/support/tickets       | Bearer | List user's tickets              |
| POST   | /api/support/tickets       | Bearer | Open a support ticket            |

Socket.IO: connect with `auth: { token }` and listen on `ride:<id>` for live
driver location pings (`{ lat, lng, heading, ts }`).

## Project layout
```
server/
├── src/
│   ├── index.js              # Express + Socket.IO bootstrap
│   ├── db.js                 # Mongo connection
│   ├── env.js                # Env validation
│   ├── middleware/
│   │   ├── auth.js           # JWT verify
│   │   ├── error.js          # Central error handler
│   │   └── validate.js       # Zod request validator
│   ├── models/
│   │   ├── User.js
│   │   ├── Driver.js
│   │   ├── Ride.js
│   │   ├── Wallet.js
│   │   └── SupportTicket.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── rides.js
│   │   ├── drivers.js
│   │   ├── wallet.js
│   │   └── support.js
│   ├── lib/
│   │   ├── geo.js            # haversine + fare calc
│   │   └── otp.js            # OTP generation / send
│   └── scripts/seed.js
└── package.json
```
