# CareerConnect – MERN Stack Job Portal

**CareerConnect** is a production‑ready job portal built with the **MERN** stack (MongoDB, Express, React, Node). It supports:
- Job Seekers and Recruiters with role‑based authentication (JWT + refresh tokens)
- Recruiter dashboard to post, edit and manage jobs
- Applicant dashboard to browse, filter, save, and apply to jobs
- Real‑time notifications & chat via Socket.io
- Admin panel for user & content moderation
- Responsive, modern UI built with React, Vite, Tailwind CSS, Redux Toolkit and Framer Motion
- Deployment scripts for Vercel (frontend) and Render (backend)

## Project Structure
```
careerconnect/
├─ backend/               # Express API
│   ├─ src/
│   │   ├─ config/        # env, database, cloudinary
│   │   ├─ models/        # Mongoose schemas
│   │   ├─ routes/         # Express routers
│   │   ├─ controllers/    # Business logic
│   │   ├─ middleware/    # auth, error handling, validation
│   │   ├─ services/      # email, notifications, utils
│   │   └─ server.js
│   ├─ .env.example
│   └─ package.json
├─ frontend/              # React Vite app
│   ├─ src/
│   │   ├─ assets/        # images, icons
│   │   ├─ components/    # reusable UI components
│   │   ├─ pages/         # route‑level pages (public, seeker, recruiter, admin)
│   │   ├─ features/      # redux slices & hooks
│   │   ├─ App.jsx
│   │   └─ main.jsx
│   ├─ public/
│   ├─ .env.example
│   └─ package.json
├─ docs/                  # API documentation, deployment guide
├─ .gitignore
└─ README.md (this file)
```

## Getting Started
1. **Clone the repo** (or copy the generated files into a new folder).
2. **Backend**
   ```bash
   cd backend
   cp .env.example .env   # fill in your secrets
   npm install
   npm run dev   # starts on http://localhost:5000
   ```
3. **Frontend**
   ```bash
   cd ../frontend
   cp .env.example .env   # set REACT_APP_API_URL=http://localhost:5000/api
   npm install
   npm run dev   # Vite dev server on http://localhost:5173
   ```
4. **Production** – see `docs/DEPLOYMENT.md` for Vercel/Render steps.

---
*The rest of the repository contains the full implementation as described in the original specification.*