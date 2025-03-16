import os
import json
import logging
import aiohttp
from typing import Dict, Any, Optional, List
from . import Provider, TutorRequest, ProblemGenerationRequest

logger = logging.getLogger(__name__)

class OpenAIProvider(Provider):
    """Provider for OpenAI API"""
    
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_TOKEN", "")
        self.model = "gpt-4o"
        self.api_url = "https://api.openai.com/v1/chat/completions"
        
    async def ask(self, request: TutorRequest) -> str:
        """Ask a question to OpenAI"""
        try:
            logger.info(f"Asking OpenAI: {request.question}")
            
            system_prompt = """你是一位小学数学老师，专门帮助学生解答数学问题。
            请用简单、友好的语言回答问题，适合小学生理解。
            如果学生的问题不清楚，请礼貌地要求他们提供更多信息。
            """
            
            if request.hint_type == "quick_hint":
                system_prompt += "请提供简短的提示，不要直接给出完整答案。"
            else:
                system_prompt += "请提供详细的解答步骤，帮助学生理解解题过程。"
            
            # If no API key, return a mock response
            if not self.api_key:
                if request.hint_type == "quick_hint":
                    return "尝试把问题分解成更小的步骤，一步一步解决。"
                else:
                    return "首先理解题目要求，然后列出已知条件，最后一步一步解答。如果遇到困难，可以画图帮助理解。"
            
            # Call OpenAI API
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.api_key}"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": request.question}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1000
                    }
                ) as response:
                    if response.status != 200:
                        raise Exception(f"OpenAI API returned status code {response.status}")
                    
                    data = await response.json()
                    return data["choices"][0]["message"]["content"]
            
        except Exception as e:
            logger.error(f"Error asking OpenAI: {str(e)}")
            return "抱歉，AI助手暂时无法回答，请稍后再试。"
    
    async def generate_problem(self, request: ProblemGenerationRequest) -> Dict[str, Any]:
        """Generate a math problem using OpenAI"""
        # This method will be implemented in the Replicate provider
        # Here we just provide a simple problem
        return {
            "question": f"{request.grade_level}年级数学题: 8 + 9 = ?",
            "answer": 17,
            "knowledge_point": "加法",
            "hints": ["可以先凑整10，再加剩余的数"],
            "difficulty": request.difficulty or 2,
            "type": "arithmetic"
        }
    
    async def evaluate_answer(self, problem_id: str, user_answer: float, correct_answer: float) -> Dict[str, Any]:
        """Evaluate a user's answer using OpenAI"""
        # This method will be implemented in the DeepSeek provider
        # Here we just provide a simple evaluation
        is_correct = abs(user_answer - correct_answer) < 0.001
        
        return {
            "is_correct": is_correct,
            "explanation": "答案正确！" if is_correct else f"正确答案是 {correct_answer}",
            "need_extra_help": not is_correct
        }
