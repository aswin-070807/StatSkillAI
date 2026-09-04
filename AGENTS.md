# StatSkill AI — Agent Guidelines

Welcome to the **StatSkill AI** platform repository. This system is an AI-powered competency intelligence and personalized learning platform developed for India's Official Statistical System (Ministry of Statistics & Programme Implementation - MoSPI).

---

## Architecture Overview

1. **Frontend (`/src`)**:
   - **Framework**: React 19 + TypeScript + Vite
   - **Styling**: Tailwind CSS v4 + Radix UI components
   - **Routing**: React Router v7 (`react-router-dom`)
   - **State / Context**: `AuthContext.tsx` handles authentication state, JWT storage, role-based protection, and email verification.

2. **Backend (`/backend`)**:
   - **Framework**: Python FastAPI
   - **ORM / DB**: SQLAlchemy with SQLite (`statskill.db`)
   - **Authentication**: JWT Bearer authentication with PBKDF2 hashing, email verification tokens, and role-based access control (`backend/routers/auth.py`).
   - **Email Service**: Transactional email dispatch via Brevo, Resend, or SMTP (`backend/services/email_service.py`).

---

## Codebase Conventions

- **Authentication**: All API endpoints requiring user context depend on `get_current_user` from `backend/auth.py`.
- **Error Handling**: API errors raise standard `fastapi.HTTPException` with meaningful, user-facing error details.
- **Port Standards**:
  - Vite Frontend: `http://localhost:8080`
  - FastAPI Backend: `http://localhost:8000`
