from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from .aitutor import router as tutor_router
from .problems import router as problems_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://math-learning-app-frontend-devin-2024.fly.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "x-client-id"],
)

app.include_router(problems_router, prefix="/problems", tags=["problems"])
app.include_router(tutor_router, prefix="/tutor", tags=["tutor"])

@app.get("/")
async def root():
    return {"status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
