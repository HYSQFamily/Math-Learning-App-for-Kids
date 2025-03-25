from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.aitutor import router as tutor_router
from app.generator import router as generator_router
from app.database import Base, engine

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(tutor_router, prefix="/tutor", tags=["tutor"])
app.include_router(generator_router, prefix="/problems", tags=["problems"])

@app.get("/")
async def root():
    return {"message": "Math Learning App API"}
