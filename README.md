# 📊 StatSkill AI — Competency Intelligence Platform

**AI-enabled skill intelligence and personalized learning platform for India's Official Statistical System (OSS), integrated with the iGOT Karmayogi ecosystem.**

🔗 **Live App:** [https://statskillaicom.vercel.app/](https://statskillaicom.vercel.app/)
## 🧾 Overview

India's Official Statistical System (OSS) — MoSPI, NSO, CSO, NSSO, and state DES units — is rapidly adopting AI, ML, GIS, Big Data, and cloud technologies. Officials producing India's core statistics (GDP, CPI/WPI, IIP, employment surveys, SDG indicators) need continuous, targeted upskilling. While the **iGOT Karmayogi** platform hosts a large course catalogue, it has no mechanism to assess an individual official's existing competencies, identify precise skill gaps, or recommend the most relevant learning path.

**StatSkill AI** solves this by acting as an intelligence layer on top of iGOT Karmayogi (and NSSTA's TPAC training programmes) — profiling each official, scoring their competencies, identifying gaps, and recommending personalized learning, backed by an AI-powered assessment engine that turns any uploaded training material into instant quizzes.

## ❗ The Problem

- No structured way to assess an official's *current* competency against what their role actually requires.
- Officials must manually browse a large, generic iGOT course catalogue with no personalization.
- Traditional training is static, one-size-fits-all, and lacks continuous assessment or real-time feedback.
- No mechanism to generate assessments automatically from existing training content.
- No unified dashboard for individuals or administrators to track competency growth and organizational skill readiness.

## ✅ What This Platform Does

1. Builds a **competency profile** for every official from designation, department, role, qualifications, experience, and training history.
2. Benchmarks that profile against a structured **competency framework** across Statistical, Technical, Digital Governance, and Behavioural domains.
3. Identifies and quantifies **skill gaps**.
4. Recommends **personalized learning pathways** from iGOT Karmayogi courses *and* NSSTA TPAC-recommended programmes.
5. Generates **MCQs and quizzes automatically** from uploaded learning material (documents/PPTs/videos) using AI.
6. Evaluates instantly, explains answers, and gives **personalized feedback**.
7. Surfaces everything through **learner and administrator dashboards**.

## 🌟 Key Features

| Feature | Description |
|---|---|
| 🔐 Secure Authentication | Sign-up / Sign-in flow for officials to access their personal learning space |
| 👤 Competency Profile | Structured profile capturing role, department, experience, qualifications, and training history |
| 🧠 AI-Generated Quiz Engine | Automatically generates MCQs/quizzes from learning content using LLMs/NLP |
| 📝 Instant Assessment & Feedback | Auto-evaluated tests with explanations for correct answers |
| 📄 Downloadable Test Reports | Learners can export their quiz performance and results |
| 🎯 Skill-Gap Analysis *(planned)* | Quantifies the gap between current and required competency per domain |
| 🔁 Personalized Recommendations *(planned)* | Suggests iGOT + TPAC courses based on identified gaps |
| 📊 Learner Dashboard *(planned)* | Visualizes competency levels, gaps, progress, and learning hours |
| 🏢 Admin Dashboard *(planned)* | Organization-wide competency heatmap, training effectiveness, predictive analytics |
| 🔗 iGOT Karmayogi Integration *(planned)* | Syncs course catalogue, enrolment, and completion status via API |


## 📌 Feature Status

| Component | Status |
|---|---|
| Sign-up / Sign-in (Auth) | ✅ Implemented |
| Profile Section | ✅ Implemented (basic) |
| AI-Generated Quiz / Question Test Section | ✅ Implemented |
| Test Report Downloads | ✅ Implemented |
| Structured 4-Domain Competency Model | 🔜 In Progress |
| Skill-Gap Analysis Engine | 🔜 Planned |
| Recommendation Engine (iGOT + TPAC) | 🔜 Planned |
| Learner Dashboard (competency view) | 🔜 Planned |
| Admin Dashboard | 🔜 Planned |
| iGOT Karmayogi API Integration | 🔜 Planned |
| AI Virtual Assistant | 🔜 Roadmap |
| Multilingual Support | 🔜 Roadmap |
| SSO / RBAC | 🔜 Roadmap |


## 🛠️ Tech Stack

**Frontend**
- React.js / Next.js
- Tailwind CSS
- Deployed on **Vercel**

**Backend / API**
- Node.js (Express) or Next.js API routes
- REST-based API layer

**AI / NLP / LLM Layer**
- Large Language Model API for MCQ/quiz generation from uploaded content
- NLP preprocessing (text extraction from PDF/PPT/video)
- Embedding-based semantic search (planned, for the recommendation engine)

**Database & Storage**
- (confirm) PostgreSQL / MongoDB / Firebase / Supabase for user profiles, quiz data, and results
- Vector store (planned) for semantic course matching — e.g. FAISS / Pinecone / PGVector

**Authentication**
- (confirm) e.g. NextAuth.js / Firebase Auth / custom JWT-based auth

**Deployment / Infra**
- Vercel (hosting & CI/CD)
- Environment-based configuration via `.env`

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│   Sign-in/Sign-up · Profile · Quiz · Reports · Dashboards│
└───────────────────────┬───────────────────────────────────┘
                         │
┌───────────────────────▼───────────────────────────────────┐
│                Application / API Layer                     │
│  Auth Service · Profile Service · Quiz Service · Reports   │
└───────────────────────┬───────────────────────────────────┘
                         │
┌───────────────────────▼───────────────────────────────────┐
│                 AI / Intelligence Layer                     │
│  LLM-based MCQ Generation · (Planned) Competency Scoring   │
│  (Planned) Semantic Recommendation Engine                  │
└───────────────────────┬───────────────────────────────────┘
                         │
┌───────────────────────▼───────────────────────────────────┐
│                     Data Layer                              │
│   User Profiles · Quiz Results · Uploaded Content Store     │
└───────────────────────┬───────────────────────────────────┘
                         │
┌───────────────────────▼───────────────────────────────────┐
│              Integration Layer (Planned)                    │
│      iGOT Karmayogi API · NSSTA/TPAC Data Feed              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Competency Framework

The platform's competency model is organized into four domains, aligned with the actual skill requirements of officials in India's Official Statistical System:

| Domain | Example Competencies |
|---|---|
| **Statistical** | Survey Design, Sampling, National Accounts, Price Statistics, Labour Statistics, Agricultural & Industrial Statistics, SDG Indicators, Metadata Standards, Data Quality |
| **Technical** | Python, R, SQL, Stata, SPSS, SAS, GIS, Data Visualization, AI/ML, Cloud Computing, APIs, Open Data |
| **Digital Governance** | Cybersecurity, Data Privacy, Digital Signatures, Government Cloud, Digital Public Infrastructure |
| **Behavioural & Managerial** | Leadership, Communication, Project Management, Ethics, Decision Making, Change Management |


## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm / yarn / pnpm
- A `.env` file with the required environment variables (see below)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/statskill-ai.git
cd statskill-ai

# Install dependencies
npm install

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000` *(confirm port)*.

### Build for production

```bash
npm run build
npm start
```

### Deployment

This project is deployed on **Vercel**. Any push to the main branch triggers an automatic deployment *(confirm branch/workflow)*.

---

## 🔑 Environment Variables

> *(confirm and replace with your actual `.env` keys)*

```env
# App
NEXT_PUBLIC_APP_URL=https://statskillaicom.vercel.app

# Auth
AUTH_SECRET=
NEXTAUTH_URL=

# Database
DATABASE_URL=

# AI / LLM Provider
AI_API_KEY=
AI_MODEL=

# iGOT Karmayogi Integration (planned)
IGOT_API_BASE_URL=
IGOT_API_KEY=
```

---

## 📁 Project Structure

> *(confirm — replace with your actual folder layout)*

```
statskill-ai/
├── app/ or pages/          # Routes: sign-in, sign-up, profile, quiz, reports
├── components/             # Reusable UI components
├── lib/                    # API clients, auth helpers, AI/LLM integration
├── models/ or schema/      # Database models / schema
├── public/                 # Static assets
├── styles/                 # Global styles / Tailwind config
├── .env.example
├── package.json
└── README.md
```

---

## 🗺️ Roadmap

- [ ] Structured 4-domain competency profile fields
- [ ] Rule-based skill-gap scoring engine
- [ ] Semantic recommendation engine (iGOT + NSSTA TPAC course matching)
- [ ] Learner dashboard (competency radar, gap view, progress tracker)
- [ ] Administrator dashboard (org-wide heatmap, predictive analytics)
- [ ] iGOT Karmayogi API integration (catalogue sync, enrolment/completion tracking)
- [ ] Personalized feedback linking wrong answers back to specific competency gaps
- [ ] AI virtual assistant for learner support
- [ ] Multilingual content and assessment support
- [ ] SSO and Role-Based Access Control (RBAC)
- [ ] Adaptive assessment difficulty

## Acknowledgements

- **Ministry of Statistics and Programme Implementation (MoSPI)** and the **National Statistical Systems Training Academy (NSSTA)**, for the domain context this platform is built around.
- **iGOT Karmayogi**, the Government of India's civil services learning ecosystem this platform integrates with.
- Built to strengthen capacity building for officials of India's Official Statistical System.

---

<p align="center">Made with 📊 for a future-ready statistical workforce</p>
