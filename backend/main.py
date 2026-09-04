import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from fastapi.staticfiles import StaticFiles
from database import engine, Base
from seed import seed_db
from routers import auth, competencies, skill_gaps, quiz, enrollments, recommendations, admin_analytics, notifications, skill_intelligence, profile

# Load .env from backend directory or project root
load_dotenv()
root_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(root_env):
    load_dotenv(root_env)

# Ensure DB tables are initialized
Base.metadata.create_all(bind=engine)
try:
    seed_db()
except Exception as e:
    print("Startup seed notice:", e)

app = FastAPI(
    title="StatSkill AI - MoSPI Competency API",
    description="FastAPI backend for MoSPI officer competency framework & skill-gap assessment.",
    version="1.0.0",
)

# Static files for uploads (resumes & photos)
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Step 7: CORS Middleware Configuration
default_cors = "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
cors_origins_str = os.getenv("CORS_ORIGINS", default_cors)
origins = [o.strip() for o in cors_origins_str.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if origins == ["*"] else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Step 7: Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global Exception on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please check request parameters."},
    )

# Routers
app.include_router(auth.router)
app.include_router(competencies.router)
app.include_router(skill_gaps.router)
app.include_router(quiz.router)
app.include_router(enrollments.router)
app.include_router(recommendations.router)
app.include_router(admin_analytics.router)
app.include_router(notifications.router)
app.include_router(skill_intelligence.router)
app.include_router(profile.router)

# Step 1: Health Check Endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "StatSkill AI FastAPI Backend", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
