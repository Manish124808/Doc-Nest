# DocNest v2 — Doctor Appointment Platform

Full-stack MERN app with **role-based login** (Patient / Doctor / Admin) — all in one frontend.

---

## 📁 Structure

```
DocNest/
├── backend/     → Express + Socket.io API (deploy as Render Web Service)
└── frontend/    → React (Vite) — Patient + Admin + Doctor all-in-one (deploy as Render Static Site)
```

---

## 🚀 Local Setup

```bash
# Terminal 1 — Backend
cd backend
npm install
npm start           # → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev         # → http://localhost:5173

# Seed dummy doctors + patients (run once)
cd backend
npm run seed
```

---

## 🔑 Login Credentials (after seeding)

### Admin
| Email | Password |
|-------|----------|
| admin@gmail.com | qwerty |

### Doctors (seeded)
| Name | Email | Password |
|------|-------|----------|
| Dr. Priya Sharma | priya.sharma@docnest.com | Doctor@123 |
| Dr. Rahul Mehta | rahul.mehta@docnest.com | Doctor@123 |
| Dr. Anjali Verma | anjali.verma@docnest.com | Doctor@123 |
| Dr. Vikram Singh | vikram.singh@docnest.com | Doctor@123 |
| Dr. Sunita Patel | sunita.patel@docnest.com | Doctor@123 |
| Dr. Arjun Nair | arjun.nair@docnest.com | Doctor@123 |

### Patients (seeded)
| Name | Email | Password |
|------|-------|----------|
| Manish Kushwaha | manish.test@gmail.com | Patient@123 |
| Riya Sharma | riya.sharma@gmail.com | Patient@123 |
| Aakash Gupta | aakash.gupta@gmail.com | Patient@123 |
| Pooja Mishra | pooja.mishra@gmail.com | Patient@123 |

---

## 🌐 Render Deployment

### Backend (Web Service)
| Field | Value |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

**Environment Variables:**
```
PORT=5000
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_secret>
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=qwerty
CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
CLOUDINARY_API_KEY=<your_cloudinary_key>
CLOUDINARY_API_SECRET=<your_cloudinary_secret>
RAZORPAY_KEY_ID=<your_razorpay_key>
RAZORPAY_KEY_SECRET=<your_razorpay_secret>
CURRENCY=INR
GROQ_API_KEY=<your_groq_key>
ALLOWED_ORIGINS=https://your-frontend.onrender.com
```

### Frontend (Static Site)
| Field | Value |
|-------|-------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

**Environment Variables:**
```
VITE_BACKEND_URL=https://your-backend.onrender.com
VITE_RAZORPAY_KEY_ID=<your_razorpay_key>
```

**Redirects/Rewrites** (add in Render dashboard):
| Source | Destination | Action |
|--------|-------------|--------|
| `/*` | `/index.html` | Rewrite |

---

## ✅ All Bugs Fixed (v2)

1. Duplicate `/appointment/:id` route removed
2. Login crash on unknown email fixed
3. Cancel appointment ObjectId type mismatch fixed
4. `reviewModel` name case mismatch fixed (`review` → `Review`)
5. `reviewModel` appointment ref casing fixed (`Appointment` → `appointment`)
6. `callModel` appointment ref casing fixed (`Appointment` → `appointment`)
7. `messageModel` forced re-registration on every request fixed
8. `userModel` massive embedded base64 image removed
9. Chat history 401 fixed (auth headers added in ChatWindow + DoctorChat)
10. Multer missing `destination` fixed (files now go to `os.tmpdir()`)
11. `incomingicon.svg` case-sensitivity fixed for Linux/Render
12. `react-toastify` + `simple-peer` removed from backend deps
13. All `console.log` debug leaks removed from contexts
14. Admin panel merged into frontend (single deployment)
15. Unified role-based Login page (Patient / Doctor / Admin tabs)

---

## 🔌 Features
- Patient registration, login, profile
- Doctor browsing, slot booking, appointments
- Razorpay payments (test mode)
- Real-time doctor ↔ patient chat (Socket.io) with image sharing
- Audio & video calls (WebRTC / simple-peer)
- AI medical chatbot (Groq / Llama-3.3-70b)
- Star ratings & reviews
- Admin dashboard (analytics, add doctors, manage appointments)
- Doctor dashboard (revenue charts, visit stats, patient list)
- Contact: manish.kushwaha.codes@gmail.com | +91 63862 95382
