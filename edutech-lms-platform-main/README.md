# Learn Hub — EduTech LMS Platform

A full-stack Learning Management System with AI-powered study tools, course management, and an admin dashboard.

---
### Step 1 — Clone the Repository

```bash
git clone https://github.com/SuchinthaHettiarachchi/Learn-Hub.git
cd Learn-Hub/edutech-lms-platform-main
```

---

### Step 2 — Configure Environment Variables

Inside the `server/` folder, create a `.env` file:

```bash
cd server
touch .env
```

Add the following to `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN=admin@example.com
CLIENT_URL=http://localhost:5173
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

> **MongoDB**: Create a free cluster at [mongodb.com](https://www.mongodb.com), set Network Access to `0.0.0.0/0`, and paste your connection string as `MONGO_URI`.

---

### Step 3 — Install Server Dependencies

```bash
# Inside the server/ folder
npm install
```

---

### Step 4 — Install Client Dependencies

```bash
cd ../client
npm install
```

---

### Step 5 — Run the Project

Open **two separate terminals**:

**Terminal 1 — Backend (port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd client
npm run dev
```

Open your browser at **http://localhost:5173**

---

## Admin Access

Log in with the email set as `ADMIN` in your `.env` file. The admin dashboard is available at `/admin`.

---

