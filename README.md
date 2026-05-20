# SwiftRide — Full Stack Bundle

Two independent apps:

```
swiftride-bundle/
├── frontend/   # React + TanStack Start (the M·E·R·N "R")
└── backend/    # Express + MongoDB + JWT + Socket.IO (the M·E·N)
```

## Run locally

### 1. Backend
```bash
cd backend
cp .env.example .env        # fill MONGO_URI (Atlas) + JWT_SECRET
npm install
npm run seed                # optional demo drivers
npm run dev                 # http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
bun install                 # or: npm install
bun run dev                 # http://localhost:5173
```

Point the frontend at the backend by adding to `frontend/.env`:
```
VITE_API_URL=http://localhost:4000
```

## Deploy
- **Backend** → Render / Railway / Fly + MongoDB Atlas
- **Frontend** → Vercel / Netlify / Cloudflare Pages

See `backend/README.md` for the full API reference.
