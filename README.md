# MedLink

[Live app](https://med-link-puce.vercel.app/) — healthcare platform for discovering doctors, booking appointments, AI symptom checks, and a doctor insights feed.

## Features

**Patients**
- Find verified doctors by speciality and city (geo default + autocomplete)
- Book slots; unpaid holds expire in 10 minutes
- Pay via Razorpay (test mode supported)
- AI symptom checker → specialist + matching doctors
- Feed: like, comment, share doctor posts

**Doctors**
- Register with MCI details; publish posts (images via Cloudinary)
- Dashboard: slots, appointments, profile
- Role-based access (patient / doctor / admin)

## Backend highlights

- Zod validation + centralized error handling
- Rate limits on auth, payments, and AI
- JWT access + **refresh token rotation** (reuse detection; tokens stored hashed)
- Transactional booking + unique index on active doctor+slot
- Payments: one order per booking, no double-charge on retry, Razorpay confirms success (including via webhook)
- Likes: same user can’t like twice; busy posts batch updates so the feed stays fast
- Indexed queries for doctors / appointments

## Tech

| Layer | Stack |
|-------|--------|
| Frontend | React (Vite), Tailwind, Axios, Context |
| Backend | Node, Express, MongoDB, Mongoose, JWT |
| Services | Cloudinary, Groq AI, Razorpay |

## Setup

**Needs:** Node 18+, MongoDB Atlas, Cloudinary, Groq, Razorpay

```bash
git clone https://github.com/rahulop17/MED-LINK.git
cd MED-LINK
```

**Backend** (`backend/.env`):
```env
PORT=8000
MONGODB_URI=...
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GROQ_API_KEY=...
GROQ_MODEL=openai/gpt-oss-20b
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

```bash
cd backend && npm install && npm run dev
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8000/api
VITE_RAZORPAY_KEY_ID=...
```

```bash
cd frontend && npm install && npm run dev
```

Optional seed (metros × specialities): `node backend/scripts/seedDoctors.js`  
Seed login password: `Doctor@123`

## Deploy

Frontend → Vercel · Backend → Render · DB → Atlas · Media → Cloudinary

## License

MIT
