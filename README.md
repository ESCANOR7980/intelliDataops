# IntelliDataOps
### Government Data Interoperability Platform
**Infosys Hackathon 2024 | SDG 16**

---

## 🚀 Quick Start (Do This Exactly)

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`)

---

## STEP 1 — Backend Setup

```bash
cd backend
npm install
```

**Seed the database (run ONCE):**
```bash
npm run seed
```

**Start the backend:**
```bash
npm run dev
```
> Backend runs on http://localhost:5000

---

## STEP 2 — Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
> Frontend runs on http://localhost:5173

---

## STEP 3 — Login

Open http://localhost:5173

| Role    | Email                          | Password   |
|---------|--------------------------------|------------|
| Admin   | admin@intellidataops.gov       | admin123   |
| Analyst | analyst@intellidataops.gov     | analyst123 |

---

## Features

| Page | Feature |
|------|---------|
| Dashboard | Real-time stats, blockchain trail, charts |
| Departments | 6 pre-seeded govt departments, interop scores |
| Data Sources | REST/DB/CSV/JSON connectors, test connections |
| Pipelines | Create, execute, pause pipelines with blockchain logging |
| Audit Chain | Immutable blockchain with chain verification |
| Analytics | Interop scores, data flow network |
| Policies | GDPR/PDPB compliance policies |
| Integrations | Open API endpoint docs |
| Users | Role-based user management |

---

## Tech Stack

- **Backend**: Node.js + Express + MongoDB/Mongoose + JWT
- **Frontend**: React 18 + Vite + React Router + Recharts
- **Security**: Helmet, rate limiting, bcrypt, JWT auth
- **Blockchain**: SHA-256 linked blocks, chain verification

---

## Architecture

```
Frontend (React/Vite :5173)
    ↕ REST API (JWT Auth)
Backend (Express :5000)
    ↕ Mongoose ODM
MongoDB (:27017)
```

## Hackathon Talking Points

1. **Open Interoperability** — REST/GraphQL/CSV/JSON adapters for any legacy system
2. **Privacy by Design** — PII anonymization, field masking, data minimization policies  
3. **Blockchain Audit Trail** — Every data transfer immutably logged with SHA-256 hashing
4. **Compliance-Ready** — GDPR, PDPB, RTI Act policy framework built-in
5. **SDG 16 Impact** — Transparent, accountable government data sharing