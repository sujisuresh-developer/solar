# ☀️ SolarLeads — Lead Management System

A full-stack MERN application for managing solar installation leads, built for **Flarize Technologies / Golden Ray Renewable Energy LLP**.

---

## Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React 18, React Router v6     |
| Styling    | Custom CSS (no framework dep) |
| Charts     | Recharts                      |
| Backend    | Node.js + Express             |
| Database   | MongoDB + Mongoose ODM        |
| Validation | express-validator             |

---

## Features

- ✅ Add new leads with full validation (name, 10-digit phone, email, location, property type, system size, source)
- ✅ Lead pipeline: New Lead → Contacted → Site Visit Scheduled → Proposal Sent → Won / Lost
- ✅ Dashboard analytics: total leads, conversion rate, status breakdown chart & progress bars, 5 recent leads
- ✅ Filter by status, location, date range; search by name/email/phone
- ✅ View, Edit, Update Status, Delete actions on every lead
- ✅ Toast notifications for all actions
- ✅ Responsive, dark-navy sidebar layout

---

## Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18 or above — `node --version`
- [MongoDB Community Edition](https://www.mongodb.com/try/download/community) running locally
- npm v9+ — `npm --version`

---

## 🚀 Setup & Run Instructions

### Step 1 — Clone or download the project

```bash
# If using git:
git clone <your-repo-url>
cd solar-leads

# Or just cd into the extracted folder:
cd solar-leads
```

---

### Step 2 — Install all dependencies

```bash
# From root folder, install root + backend + frontend dependencies:
npm run install:all
```

Or manually:
```bash
# Root
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### Step 3 — Configure environment variables

The backend `.env` file is already created at `backend/.env` with:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/solar_leads
NODE_ENV=development
```

> ✅ No changes needed if MongoDB is running locally on the default port.

---

### Step 4 — Start MongoDB

Make sure MongoDB is running on your machine:

**Windows:**
```bash
net start MongoDB
# or open MongoDB Compass and connect
```

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

---

### Step 5 — Seed sample data (optional but recommended)

```bash
npm run seed
```

This will insert 7 sample leads including Rajesh Kumar, Priya Menon, and others.

---

### Step 6 — Run the application

**Run both frontend and backend together (recommended):**
```bash
npm run dev
```

**Or run separately in two terminals:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

---

### Step 7 — Open in browser

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health

---

## API Endpoints

| Method | Endpoint                    | Description                |
|--------|-----------------------------|----------------------------|
| GET    | /api/leads                  | Get all leads (with filters)|
| GET    | /api/leads/dashboard        | Dashboard analytics        |
| GET    | /api/leads/locations        | Distinct locations list    |
| GET    | /api/leads/:id              | Get single lead            |
| POST   | /api/leads                  | Create new lead            |
| PUT    | /api/leads/:id              | Update full lead           |
| PATCH  | /api/leads/:id/status       | Update status only         |
| DELETE | /api/leads/:id              | Delete lead                |

### Query Parameters for GET /api/leads

| Param      | Example             | Description               |
|------------|---------------------|---------------------------|
| status     | ?status=Won         | Filter by status          |
| location   | ?location=Kochi     | Filter by city            |
| startDate  | ?startDate=2025-01-01 | Filter from date        |
| endDate    | ?endDate=2025-12-31 | Filter to date            |
| search     | ?search=rajesh      | Search name/email/phone   |

---

## Database Schema

```javascript
Lead {
  fullName:     String  (required, max 100 chars)
  phone:        String  (required, 10-digit regex validated, unique)
  email:        String  (required, email format, unique)
  location:     String  (required)
  propertyType: String  (enum: Residential | Commercial | Industrial)
  systemSize:   Number  (required, 1–100 kW)
  source:       String  (enum: Website | Referral | Walk-in | Social Media)
  status:       String  (enum: New Lead | Contacted | Site Visit Scheduled | Proposal Sent | Won | Lost)
  notes:        String  (optional, max 500 chars)
  createdAt:    Date    (auto)
  updatedAt:    Date    (auto)
}

Indexes:
  - status (ascending)
  - createdAt (descending)
  - location (ascending)
  - email (unique)
```

---

## Project Structure

```
solar-leads/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   └── Lead.js            # Mongoose schema + indexes
│   ├── routes/
│   │   └── leads.js           # All CRUD + analytics routes
│   ├── .env                   # Environment config
│   ├── server.js              # Express entry point
│   ├── seed.js                # Sample data seeder
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx     # Sidebar navigation
│   │   │   ├── LeadForm.jsx   # Add/Edit form with validation
│   │   │   └── StatusBadge.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # Analytics & charts
│   │   │   ├── LeadsList.jsx  # Table with filters & modals
│   │   │   └── AddLead.jsx    # New lead page
│   │   ├── utils/
│   │   │   ├── api.js         # Axios API helpers
│   │   │   └── constants.js   # Enums, colors
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── package.json               # Root with concurrently scripts
└── README.md
```

---

## Troubleshooting

**MongoDB not connecting?**
- Ensure MongoDB service is running: `mongod --version`
- Check your `MONGO_URI` in `backend/.env`

**Port 3000 already in use?**
- React will ask to use another port — press `Y`

**Port 5000 already in use?**
- Change `PORT=5001` in `backend/.env` and update `frontend/package.json` proxy to `http://localhost:5001`

---

*Built for Flarize Technologies Private Limited — Golden Ray Renewable Energy LLP Technical Assessment*
