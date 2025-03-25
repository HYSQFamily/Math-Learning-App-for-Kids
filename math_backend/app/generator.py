from fastapi import APIRouter, Query
from typing import Optional
import random
import math

router = APIRouter()

# Sample knowledge points for different topics
KNOWLEDGE_POINTS = {
    "addition": ["整数加法", "小数加法", "分数加法", "多位数加法"],
    "subtraction": ["整数减法", "小数减法", "分数减法", "多位数减法"],
    "multiplication": ["整数乘法", "小数乘法", "分数乘法", "多位数乘法"],
    "division": ["整数除法", "小数除法", "分数除法", "长除法"]
}

# Sample related points
RELATED_POINTS = {
    "addition": ["进位加法", "估算", "心算技巧"],
    "subtraction": ["退位减法", "估算", "心算技巧"],
    "multiplication": ["乘法口诀", "估算", "分配律"],
    "division": ["除法口诀", "估算", "余数"]
}

@router.get("/generate")
async def generate_problem(
    grade_level: int = Query(3, ge=1, le=6),
    topic: str = Query(..., regex="^(addition|subtraction|multiplication|division)$"),
    language: str = Query("zh", description="Language code(s) separated by '+', e.g. 'en+zh'")
):
    """
    Generate a math problem based on grade level and topic.
    """
    # Generate problem based on topic and grade level
    if topic == "addition":
        return generate_addition_problem(grade_level, language)
    elif topic == "subtraction":
        return generate_subtraction_problem(grade_level, language)
    elif topic == "multiplication":
        return generate_multiplication_problem(grade_level, language)
    elif topic == "division":
        return generate_division_problem(grade_level, language)
    else:
        # Default to addition if topic is not recognized
        return generate_addition_problem(grade_level, language)

def generate_addition_problem(grade_level: int, language: str):
    # Adjust difficulty based on grade level
    max_num = 10 * grade_level
    num1 = random.randint(1, max_num)
    num2 = random.randint(1, max_num)
    
    # Generate problem text based on language
    question = f"{num1} + {num2} = ?"
    if "zh" in language:
        question = f"计算: {num1} + {num2} = ?"
    
    # Select knowledge point
    knowledge_point = random.choice(KNOWLEDGE_POINTS["addition"])
    
    return {
        "id": f"add_{num1}_{num2}_{random.randint(1000, 9999)}",
        "type": "addition",
        "question": question,
        "correct_answer": num1 + num2,
        "difficulty": grade_level,
        "hints": [
            f"试着把 {num1} 分解成更容易计算的数字",
            f"可以先计算 {num1} + {num2 // 10 * 10} 然后再加上 {num2 % 10}",
            f"答案是两个数字的和: {num1} + {num2} = {num1 + num2}"
        ],
        "explanation": f"{num1} + {num2} = {num1 + num2}，这是一个简单的加法运算。",
        "knowledge_point": knowledge_point,
        "related_points": RELATED_POINTS["addition"]
    }

def generate_subtraction_problem(grade_level: int, language: str):
    # Adjust difficulty based on grade level
    max_num = 10 * grade_level
    num1 = random.randint(max_num // 2, max_num)
    num2 = random.randint(1, num1)  # Ensure positive result
    
    # Generate problem text based on language
    question = f"{num1} - {num2} = ?"
    if "zh" in language:
        question = f"计算: {num1} - {num2} = ?"
    
    # Select knowledge point
    knowledge_point = random.choice(KNOWLEDGE_POINTS["subtraction"])
    
    return {
        "id": f"sub_{num1}_{num2}_{random.randint(1000, 9999)}",
        "type": "subtraction",
        "question": question,
        "correct_answer": num1 - num2,
        "difficulty": grade_level,
        "hints": [
            f"想象你有 {num1} 个物品，然后拿走 {num2} 个",
            f"可以先从 {num1} 中减去 {num2 // 10 * 10}，然后再减去 {num2 % 10}",
            f"答案是两个数字的差: {num1} - {num2} = {num1 - num2}"
        ],
        "explanation": f"{num1} - {num2} = {num1 - num2}，这是一个简单的减法运算。",
        "knowledge_point": knowledge_point,
        "related_points": RELATED_POINTS["subtraction"]
    }

def generate_multiplication_problem(grade_level: int, language: str):
    # Adjust difficulty based on grade level
    max_num = min(10, 3 + grade_level)
    num1 = random.randint(2, max_num)
    num2 = random.randint(2, max_num)
    
    # Generate problem text based on language
    question = f"{num1} × {num2} = ?"
    if "zh" in language:
        question = f"计算: {num1} × {num2} = ?"
    
    # Select knowledge point
    knowledge_point = random.choice(KNOWLEDGE_POINTS["multiplication"])
    
    return {
        "id": f"mul_{num1}_{num2}_{random.randint(1000, 9999)}",
        "type": "multiplication",
        "question": question,
        "correct_answer": num1 * num2,
        "difficulty": grade_level,
        "hints": [
            f"想象有 {num1} 组，每组有 {num2} 个物品",
            f"可以使用乘法口诀表: {num1} × {num2}",
            f"答案是两个数字的乘积: {num1} × {num2} = {num1 * num2}"
        ],
        "explanation": f"{num1} × {num2} = {num1 * num2}，这是一个简单的乘法运算。",
        "knowledge_point": knowledge_point,
        "related_points": RELATED_POINTS["multiplication"]
    }

def generate_division_problem(grade_level: int, language: str):
    # Adjust difficulty based on grade level
    max_num = min(10, 3 + grade_level)
    num2 = random.randint(2, max_num)
    # Generate a multiple of num2 to ensure clean division
    multiple = random.randint(1, max_num)
    num1 = num2 * multiple
    
    # Generate problem text based on language
    question = f"{num1} ÷ {num2} = ?"
    if "zh" in language:
        question = f"计算: {num1} ÷ {num2} = ?"
    
    # Select knowledge point
    knowledge_point = random.choice(KNOWLEDGE_POINTS["division"])
    
    return {
        "id": f"div_{num1}_{num2}_{random.randint(1000, 9999)}",
        "type": "division",
        "question": question,
        "correct_answer": num1 // num2,
        "difficulty": grade_level,
        "hints": [
            f"想象你有 {num1} 个物品，需要平均分成 {num2} 组",
            f"可以使用除法口诀表: {num1} ÷ {num2}",
            f"答案是两个数字的商: {num1} ÷ {num2} = {num1 // num2}"
        ],
        "explanation": f"{num1} ÷ {num2} = {num1 // num2}，这是一个简单的除法运算。",
        "knowledge_point": knowledge_point,
        "related_points": RELATED_POINTS["division"]
    }
