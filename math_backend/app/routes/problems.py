from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional
import random
import uuid
from datetime import datetime
from app.models import Problem
from app.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

def generate_numbers(operation: str, difficulty: int) -> tuple[int, int]:
    max_num = 10 ** difficulty
    if operation == "addition":
        return (random.randint(1, max_num), random.randint(1, max_num))
    elif operation == "subtraction":
        num1 = random.randint(1, max_num)
        num2 = random.randint(1, num1)  # Ensure positive result
        return (num1, num2)
    elif operation == "multiplication":
        return (random.randint(1, max_num // 2), random.randint(1, max_num // 2))
    elif operation == "division":
        num2 = random.randint(1, max_num // 2)
        num1 = num2 * random.randint(1, max_num // num2)  # Ensure whole number result
        return (num1, num2)
    raise HTTPException(status_code=400, detail="Invalid operation")

def get_operator(operation: str) -> str:
    operators = {
        "addition": "+",
        "subtraction": "-",
        "multiplication": "×",
        "division": "÷"
    }
    return operators.get(operation, "+")

def calculate_answer(operation: str, num1: int, num2: int) -> float:
    if operation == "addition":
        return num1 + num2
    elif operation == "subtraction":
        return num1 - num2
    elif operation == "multiplication":
        return num1 * num2
    elif operation == "division":
        return num1 / num2
    raise HTTPException(status_code=400, detail="Invalid operation")

@router.post("/arithmetic")
async def generate_arithmetic_problem(
    operation: str = Query(..., regex="^(addition|subtraction|multiplication|division)$"),
    difficulty: int = Query(1, ge=1, le=5),
    language: str = Query("en", regex="^(en|zh)$"),
    db: Session = Depends(get_db)
):
    num1, num2 = generate_numbers(operation, difficulty)
    answer = calculate_answer(operation, num1, num2)
    operator = get_operator(operation)
    
    question_en = f"What is {num1} {operator} {num2}?"
    question_zh = f"{num1} {operator} {num2} 等于多少？"
    
    hints_en = f"Think about the {operation} operation step by step."
    hints_zh = f"一步一步思考{operation}运算。"
    
    explanation_en = f"To solve {num1} {operator} {num2}, we can calculate directly: {answer}"
    explanation_zh = f"解决 {num1} {operator} {num2}，我们可以直接计算得到：{answer}"
    
    problem = Problem(
        id=str(uuid.uuid4()),
        type="arithmetic",
        question_en=question_en,
        question_zh=question_zh,
        correct_answer=answer,
        difficulty=difficulty,
        hints_en=hints_en,
        hints_zh=hints_zh,
        explanation_en=explanation_en,
        explanation_zh=explanation_zh,
        knowledge_point=operation,
        related_points=operation
    )
    
    db.add(problem)
    db.commit()
    db.refresh(problem)
    
    return problem
