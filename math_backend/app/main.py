from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Set up API tokens from environment variables
replicate_token = os.environ.get("REPLICATE_API_TOKEN", os.environ.get("Replicate_API_TOKEN"))
if replicate_token:
    os.environ["REPLICATE_API_TOKEN"] = replicate_token
    logger.info("Replicate API token configured")

deepseek_token = os.environ.get("DEEPSEEK_API_KEY", "sk-gnocejrrpjhfwpubniyokhgobfqcaqgxkeoixnrooweddurx")
if deepseek_token:
    os.environ["DEEPSEEK_API_KEY"] = deepseek_token
    logger.info("DeepSeek API token configured")

# Import routers
from .aitutor import router as tutor_router
from .problems import router as problems_router
from .users import router as users_router
from .problem_generator import router as generator_router
from .evaluation import router as evaluation_router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(problems_router, prefix="/problems", tags=["problems"])
app.include_router(tutor_router, prefix="/tutor", tags=["tutor"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(generator_router, prefix="/generator", tags=["generator"])
app.include_router(evaluation_router, prefix="/evaluation", tags=["evaluation"])

@app.get("/")
async def root():
    return {"status": "ok", "ai_services": {
        "replicate": replicate_token is not None,
        "deepseek": deepseek_token is not None
    }}
