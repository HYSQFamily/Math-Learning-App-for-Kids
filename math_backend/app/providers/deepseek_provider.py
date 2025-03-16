import os
import json
import logging
import aiohttp
from typing import Dict, Any, Optional, List
from . import Provider, TutorRequest, ProblemGenerationRequest

logger = logging.getLogger(__name__)

class DeepSeekProvider(Provider):
    """Provider for DeepSeek API"""
    
    def __init__(self):
        self.api_key = os.environ.get("DEEPSEEK_API_KEY", "")
        self.model = "deepseek-ai/DeepSeek-V3"
        self.api_url = "https://api.siliconflow.cn/v1/chat/completions"
        
    async def ask(self, request: TutorRequest) -> str:
        """Ask a question to DeepSeek"""
        try:
            logger.info(f"Asking DeepSeek: {request.question}")
            
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
            
            # Call DeepSeek API
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
                        raise Exception(f"DeepSeek API returned status code {response.status}")
                    
                    data = await response.json()
                    return data["choices"][0]["message"]["content"]
            
        except Exception as e:
            logger.error(f"Error asking DeepSeek: {str(e)}")
            return "抱歉，AI助手暂时无法回答，请稍后再试。"
    
    async def generate_problem(self, request: ProblemGenerationRequest) -> Dict[str, Any]:
        """Generate a math problem using DeepSeek"""
        # This method will be implemented in the Replicate provider
        # Here we just provide a simple problem
        return {
            "question": f"{request.grade_level}年级数学题: 12 - 5 = ?",
            "answer": 7,
            "knowledge_point": "减法",
            "hints": ["可以想象从12个物品中拿走5个"],
            "difficulty": request.difficulty or 2,
            "type": "arithmetic"
        }
    
    async def evaluate_answer(self, problem_id: str, user_answer: float, correct_answer: float) -> Dict[str, Any]:
        """Evaluate a user's answer using DeepSeek V3"""
        try:
            logger.info(f"Evaluating answer with DeepSeek: Problem {problem_id}, User answer: {user_answer}, Correct answer: {correct_answer}")
            
            is_correct = abs(user_answer - correct_answer) < 0.001
            
            # If no API key, return a simple evaluation
            if not self.api_key:
                return {
                    "is_correct": is_correct,
                    "explanation": "答案正确！" if is_correct else f"正确答案是 {correct_answer}",
                    "need_extra_help": not is_correct
                }
            
            system_prompt = """你是一位小学数学老师，正在评估学生的答案。
            请根据学生的答案和正确答案，提供友好的反馈。
            如果答案正确，给予鼓励；如果答案错误，提供简短的解释和正确答案。
            
            请按照以下JSON格式返回评估结果:
            {
                "is_correct": true/false,
                "explanation": "评价和解释",
                "need_extra_help": true/false
            }
            
            只返回JSON格式，不要有其他文字。
            """
            
            # Call DeepSeek API
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
                            {"role": "user", "content": f"问题ID: {problem_id}, 学生答案: {user_answer}, 正确答案: {correct_answer}"}
                        ],
                        "temperature": 0.3,
                        "max_tokens": 500
                    }
                ) as response:
                    if response.status != 200:
                        raise Exception(f"DeepSeek API returned status code {response.status}")
                    
                    data = await response.json()
                    content = data["choices"][0]["message"]["content"]
                    
                    # Extract JSON from response
                    try:
                        # Find JSON in the response
                        start_idx = content.find('{')
                        end_idx = content.rfind('}') + 1
                        if start_idx >= 0 and end_idx > start_idx:
                            json_str = content[start_idx:end_idx]
                            evaluation = json.loads(json_str)
                            
                            # Ensure required fields exist
                            evaluation.setdefault("is_correct", is_correct)
                            evaluation.setdefault("explanation", "答案正确！" if is_correct else f"正确答案是 {correct_answer}")
                            evaluation.setdefault("need_extra_help", not is_correct)
                            
                            return evaluation
                        else:
                            raise ValueError("Could not find JSON in response")
                    except json.JSONDecodeError:
                        raise ValueError("Invalid JSON in response")
            
        except Exception as e:
            logger.error(f"Error evaluating answer with DeepSeek: {str(e)}")
            return {
                "is_correct": is_correct,
                "explanation": "答案正确！" if is_correct else f"正确答案是 {correct_answer}",
                "need_extra_help": not is_correct
            }
