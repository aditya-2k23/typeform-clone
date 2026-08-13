"""
FastAPI application entry point.

On startup the application:
  1. Creates all database tables (if they don't already exist).
  2. Registers all feature routers.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base

# Import models so Base.metadata knows about every table
import models  # noqa: F401

# Routers
from routers import forms, questions, public, responses


# Lifespan — runs once on startup / shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (no-op if they already exist)
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown logic (if any) goes here


# App instance
app = FastAPI(
    title="Typeform Clone API",
    description="Backend API for the Typeform clone project.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — configure allowed origins from environment variable & Vercel domains
raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,https://typeform-clone-adi.vercel.app",
)
allowed_origins = [
    origin.strip().rstrip("/")
    for origin in raw_origins.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Routers
app.include_router(forms.router)
app.include_router(questions.router)
app.include_router(public.router)
app.include_router(responses.router)


# Root routes
@app.get("/health")
def health_check():
    """Simple liveness probe."""
    return {"status": "ok"}
