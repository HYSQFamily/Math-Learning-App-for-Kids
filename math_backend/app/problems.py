from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import random
from typing import List, Optional

router = APIRouter()

# Sample problems for testing
PROBLEMS = [
    {
        "id": "p1",
        "question": "小明有5个苹果，他给了小红2个，还剩下几个苹果？",
        "answer": 3,
        "knowledge_point": "减法运算",
        "hints": ["想象一下苹果被拿走的过程", "可以用手指数一数"]
    },
    {
        "id": "p2",
        "question": "一个班级有24名学生，其中男生比女生多6人，女生有几人？",
        "answer": 9,
        "knowledge_point": "应用题",
        "hints": ["先找出已知条件", "男生比女生多6人意味着什么？"]
    },
    {
        "id": "p3",
        "question": "8 + 7 = ?",
        "answer": 15,
        "knowledge_point": "加法运算",
        "hints": ["可以先凑成10", "8+2=10, 然后再加5"]
    }
]

class SubmitAnswer(BaseModel):
    problem_id: str
    answer: float

class AttemptResult(BaseModel):
    is_correct: bool
    need_extra_help: Optional[bool] = False
    mastery_level: Optional[float] = None

@router.get("/problems/next")
async def get_next_problem():
    return random.choice(PROBLEMS)

@router.post("/problems/submit", response_model=AttemptResult)
async def submit_answer(submission: SubmitAnswer):
    problem = next((p for p in PROBLEMS if p["id"] == submission.problem_id), None)
    if not problem:
        raise HTTPException(status_code=404, detail="题目不存在")
    
    is_correct = abs(submission.answer - problem["answer"]) < 0.001
    return AttemptResult(
        is_correct=is_correct,
        need_extra_help=not is_correct,
        mastery_level=1.0 if is_correct else 0.0
    )
