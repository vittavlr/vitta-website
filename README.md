# VITTA — Website + Admin/Owner Dashboards

VITTA site (real estate, finance, insurance, mutual funds, legal counsel, college
admissions advisory) with a React + Framer Motion frontend and a FastAPI + MongoDB backend.

## Stack

- **Frontend:** React (Vite), React Router, Framer Motion, Tailwind CSS — deploys to GitHub Pages
- **Backend:** FastAPI, MongoDB (Motor async driver), JWT auth (python-jose), bcrypt password hashing
- **Auth:** Email + password login at the hidden route `/vitta-private`. Owner and Admin roles.
- **Credential changes:** password / email / phone changes require a 6-digit code emailed to the
  account's current address (SMTP) before the change is applied.

## Repo layout
  
```
vitta/
  backend/     FastAPI app (MongoDB, JWT auth, leads, services, properties)
  frontend/    React + Vite site (public pages + private dashboards)
  .github/workflows/deploy.yml   GitHub Action: builds frontend and pushes to gh-pages
```

## 1. Backend setup

### 1.1 Get a free MongoDB database

1. Create a free cluster at https://www.mongodb.com/cloud/atlas/register (the M0 free tier is enough).
2. Create a database user and grab your connection string (`mongodb+srv://...`).
3. In Atlas → Network Access, allow access from anywhere (`0.0.0.0/0`) or your host's IP.

### 1.2 Configure environment

```bash
cd backend
cp .env.example .env
```
Edit `.env`:
- `MONGO_URI` — your Atlas connection string
- `JWT_SECRET` — any long random string
- `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` — the Owner account created automatically on first run
  (this is your initial login — **change the password after first login** using the Settings tab)
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` — for sending OTP codes. For Gmail:
  1. Turn on 2-Step Verification on the Gmail account
  2. Create an "App Password" at https://myaccount.google.com/apppasswords
  3. Use that 16-character password as `SMTP_PASSWORD` (not your normal Gmail password)
  - If you leave SMTP unset, OTP codes are printed to the server console and also returned in the
    API response (`dev_otp`) so you can still test the flow locally.
- `CORS_ORIGINS` — the URL(s) your frontend will be served from
 
### 1.3 Run locally

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000`. On first run it seeds:
- the Owner account (from `.env`)
- 6 default services (Real Estate, Finance, Insurance, Mutual Funds, Legal Counsel, College Admissions)

### 1.4 Deploying the backend for free

MongoDB Atlas + FastAPI need a host that can run a long-lived Python process. Good free options:
- **Render.com** (free web service tier — spins down when idle, spins back up on request)
- **Railway.app** (free trial credits, then usage-based)
- **Fly.io** (free allowance for small apps)

Whichever you pick: set the same environment variables from `.env` in that platform's dashboard,
point the start command at `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, and update
`CORS_ORIGINS` to include your deployed frontend URL.

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env
```

Set `VITE_API_URL` to your backend's URL (e.g. `http://localhost:8000` while developing, or your
Render/Railway URL in production).

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`. The private dashboards are at `/vitta-private` (not linked from the
public navigation, per the original plan).

### Deploying to GitHub Pages

1. Push this repo to GitHub.
2. In the repo's Settings → Secrets and variables → Actions, add a secret `VITE_API_URL` pointing
   to your deployed backend.
3. In Settings → Pages, set the source to the `gh-pages` branch.
4. Push to `main` — the included GitHub Action (`.github/workflows/deploy.yml`) builds the frontend
   and publishes it automatically.

The app uses `HashRouter` (URLs look like `/#/vitta-private`) specifically so it works correctly on
GitHub Pages' static hosting without extra rewrite rules.

## 3. Roles & permissions

| Action | Owner | Admin |
|---|:---:|:---:|
| View/manage leads | ✅ | ✅ |
| Edit service descriptions | ✅ | ✅ |
| Add/edit/remove property listings | ✅ | ✅ |
| Change own password/email/phone (via OTP) | ✅ | ✅ |
| View lead/traffic metrics | ✅ | ❌ |
| Create/remove Admin accounts | ✅ | ❌ |

Only one Owner account exists (seeded from `.env`). The Owner creates Admin accounts from the
Team tab in their dashboard; Admins log in at the same `/vitta-private` URL and land on the
Admin dashboard.

## 4. Property listings

There are no listings yet, matching the current site. The **Listings** page shows a "coming soon"
state until the Owner or an Admin adds properties from their dashboard's **Properties** tab —
title, location, price, type, bedrooms/bathrooms, area, image URLs, and status (available / sold /
coming soon). New listings appear on the public Listings page immediately.

## 5. The "Inquire" / Contact flow

The public Contact page posts to `POST /api/leads` (no auth required). Every submission:
- is stored in MongoDB (visible to Owner/Admin under the **Leads** tab, with status tracking:
  new → contacted → in progress → closed)
- triggers a notification email (if SMTP is configured)

## 6. On WhatsApp/SMS verification

The task asked for email, phone, or WhatsApp verification for credential changes. Free WhatsApp/SMS
delivery isn't realistically available without a paid provider (Twilio, Meta Cloud API, etc.), so
this build wires up **email OTP** (free via Gmail SMTP) end-to-end. A `phone` field exists on the
user model and a `phone_change` OTP flow is already implemented (code still goes to their email for
verification) — if you later add a paid SMS/WhatsApp provider, swap the `send_email` call in
`app/routers/auth.py`'s `request_otp` for that provider's send function.

## 7. Design notes

Matches the original plan's beige/linen visual identity:
- Backgrounds: `#F5F3ED` (linen) / `#EAE5D5` (fawn)
- Text: `#4A4433` (bronze brown), gold accent `#A9822F`
- Headers in Playfair Display (serif), body in Lato
- Framer Motion used throughout: hero fade-ins, staggered value cards, hover-lift service cards,
  page transitions, and animated dashboard panels
