from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from .providers.provider_factory import ProviderFactory
from fastapi import APIRouter, Header
from typing import Optional
import random

tutor_router = APIRouter()
problems_router = APIRouter()

@tutor_router.post("/ask")
async def ask_tutor(question: str, service: str = "deepseek"):
    provider = ProviderFactory.get_provider(service)
    response = await provider.generate_response(question)
    return {"answer": response}

@problems_router.get("/next")
async def get_next_problem(x_client_id: Optional[str] = Header(None)):
    # Simple arithmetic problem generation for testing
    operations = ['+', '-', '*', '/']
    operation = random.choice(operations)
    num1 = random.randint(1, 20)
    num2 = random.randint(1, 10)
    
    if operation == '/':
        num1 = num2 * random.randint(1, 10)  # Ensure division results in whole number
        
    operation_text = {
        '+': '加',
        '-': '减',
        '*': '乘',
        '/': '除以'
    }
    
    problem = {
        "id": f"prob_{random.randint(1000, 9999)}",
        "type": "arithmetic",
        "operation": operation,
        "num1": num1,
        "num2": num2,
        "question": f"{num1} {operation} {num2} = ?",
        "question_en": f"What is {num1} {operation} {num2}?",
        "question_zh": f"{num1} {operation_text[operation]} {num2} 等于多少?",
        "hints_en": ["Try breaking down the problem", "Think about the basic arithmetic rules"],
        "hints_zh": ["试着把问题分解一下", "想一想基本的运算法则"],
        "knowledge_point": "basic_arithmetic",
        "difficulty": 1,
        "explanation_en": f"Let's solve {num1} {operation} {num2} step by step",
        "explanation_zh": f"让我们一步一步解决 {num1} {operation_text[operation]} {num2}"
    }
    return problem

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://math-learning-app-frontend-devin.fly.dev"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*", "x-client-id"],
    expose_headers=["*"],
)

app.include_router(problems_router, prefix="/problems", tags=["problems"])
app.include_router(tutor_router, prefix="/tutor", tags=["tutor"])

@app.get("/")
async def root():
    return {"status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
