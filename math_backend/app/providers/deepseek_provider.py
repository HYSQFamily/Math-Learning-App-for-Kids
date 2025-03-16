import os
import json
import logging
import aiohttp
from typing import Dict, Any, Optional

from .base_provider import BaseProvider, TutorRequest, ProblemGenerationRequest

logger = logging.getLogger(__name__)

class DeepSeekProvider(BaseProvider):
    """Provider for DeepSeek AI service"""
    
    def __init__(self):
        self.api_key = os.environ.get("DEEPSEEK_API_KEY", "")
        self.model = "deepseek-ai/DeepSeek-V3"
        self.api_url = "https://api.siliconflow.cn/v1/chat/completions"
        
    async def ask(self, request: TutorRequest) -> str:
        """Ask a question to DeepSeek"""
        try:
            # Prepare the prompt
            if request.hint_type == "quick_hint":
                system_prompt = "你是一位小学数学老师，擅长用简单易懂的方式解释数学概念。请提供简短的提示，帮助学生理解问题，但不要直接给出答案。"
            else:
                system_prompt = "你是一位小学数学老师，擅长用简单易懂的方式解释数学概念。请详细分析这个问题，解释解题思路和步骤，但不要直接给出答案。"
            
            # Prepare the API request
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.question}
                ],
                "temperature": 0.7,
                "max_tokens": 1024
            }
            
            # Make the API request
            async with aiohttp.ClientSession() as session:
                async with session.post(self.api_url, headers=headers, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"DeepSeek API error: {error_text}")
                        return "抱歉，AI助手暂时无法回答，请稍后再试。"
                    
                    result = await response.json()
                    
                    # Extract the response
                    if "choices" in result and len(result["choices"]) > 0:
                        return result["choices"][0]["message"]["content"]
                    else:
                        logger.error(f"Unexpected DeepSeek API response: {result}")
                        return "抱歉，AI助手暂时无法回答，请稍后再试。"
        
        except Exception as e:
            logger.error(f"Error asking DeepSeek: {str(e)}")
            return "抱歉，AI助手暂时无法回答，请稍后再试。"
    
    async def generate_problem(self, request: ProblemGenerationRequest) -> Dict[str, Any]:
        """Generate a math problem using DeepSeek"""
        try:
            # Map grade level to Chinese grade name
            grade_names = {
                1: "一年级", 2: "二年级", 3: "三年级", 
                4: "四年级", 5: "五年级", 6: "六年级"
            }
            grade_name = grade_names.get(request.grade_level, "三年级")
            
            # Map difficulty to description
            difficulty_desc = {
                1: "简单", 2: "中等", 3: "困难"
            }.get(request.difficulty, "中等")
            
            # Prepare topic description
            topic_desc = request.topic if request.topic else "基础数学"
            
            # Prepare the system prompt
            system_prompt = """你是一位小学数学老师，擅长创建适合小学生的数学题目。
请按照以下JSON格式生成一道数学题目：
{
  "question": "题目内容",
  "answer": 数字答案,
  "hints": ["提示1", "提示2"],
  "knowledge_point": "知识点",
  "difficulty": 难度等级(1-3),
  "type": "题目类型"
}
题目类型可以是：arithmetic（算术）, word_problem（应用题）, geometry（几何）等。
请确保答案是一个数字，而不是文本描述。"""
            
            # Prepare the API request
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Create the prompt
            prompt = f"请生成一道{grade_name}的{topic_desc}数学题目，难度为{difficulty_desc}。"
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 1024
            }
            
            # Make the API request
            async with aiohttp.ClientSession() as session:
                async with session.post(self.api_url, headers=headers, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"DeepSeek API error: {error_text}")
                        # Return a fallback problem
                        return {
                            "question": f"{grade_name}数学题: 7 + 8 = ?",
                            "answer": 15,
                            "hints": ["可以先凑成10，再加剩余的数"],
                            "knowledge_point": "加法",
                            "difficulty": 2,
                            "type": "arithmetic"
                        }
                    
                    result = await response.json()
                    
                    # Extract the response
                    if "choices" in result and len(result["choices"]) > 0:
                        content = result["choices"][0]["message"]["content"]
                        
                        # Try to extract JSON from the response
                        try:
                            # Find JSON in the response
                            start_idx = content.find("{")
                            end_idx = content.rfind("}")
                            
                            if start_idx >= 0 and end_idx >= 0:
                                json_str = content[start_idx:end_idx+1]
                                problem_data = json.loads(json_str)
                                
                                # Validate required fields
                                if "question" in problem_data and "answer" in problem_data:
                                    return problem_data
                        
                        except Exception as e:
                            logger.error(f"Error parsing DeepSeek response: {str(e)}")
                        
                        # If JSON parsing failed, return a fallback problem
                        return {
                            "question": f"{grade_name}数学题: 7 + 8 = ?",
                            "answer": 15,
                            "hints": ["可以先凑成10，再加剩余的数"],
                            "knowledge_point": "加法",
                            "difficulty": 2,
                            "type": "arithmetic"
                        }
                    else:
                        logger.error(f"Unexpected DeepSeek API response: {result}")
                        # Return a fallback problem
                        return {
                            "question": f"{grade_name}数学题: 7 + 8 = ?",
                            "answer": 15,
                            "hints": ["可以先凑成10，再加剩余的数"],
                            "knowledge_point": "加法",
                            "difficulty": 2,
                            "type": "arithmetic"
                        }
        
        except Exception as e:
            logger.error(f"Error generating problem with DeepSeek: {str(e)}")
            # Return a fallback problem
            return {
                "question": f"{grade_name}数学题: 7 + 8 = ?",
                "answer": 15,
                "hints": ["可以先凑成10，再加剩余的数"],
                "knowledge_point": "加法",
                "difficulty": 2,
                "type": "arithmetic"
            }
    
    async def evaluate_answer(self, problem_id: str, user_answer: float, correct_answer: float) -> Dict[str, Any]:
        """Evaluate a user's answer using DeepSeek"""
        try:
            # Determine if the answer is correct (with small tolerance for floating point)
            is_correct = abs(user_answer - correct_answer) < 0.001
            
            # Prepare the system prompt
            system_prompt = """你是一位小学数学老师，擅长评估学生的答案并提供有用的反馈。
请根据学生的答案是否正确，提供适当的反馈和解释。
如果答案正确，给予鼓励；如果答案错误，提供温和的指导，但不要直接给出正确答案。
请用简单友好的语言，适合小学生理解。"""
            
            # Prepare the API request
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Create the prompt
            if is_correct:
                prompt = f"学生回答了一道数学题，他的答案是{user_answer}，这是正确的。请给予积极的反馈。"
            else:
                prompt = f"学生回答了一道数学题，他的答案是{user_answer}，但正确答案是{correct_answer}。请给予温和的指导，但不要直接告诉他正确答案是什么。"
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 1024
            }
            
            # Make the API request
            async with aiohttp.ClientSession() as session:
                async with session.post(self.api_url, headers=headers, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"DeepSeek API error: {error_text}")
                        # Return a fallback evaluation
                        return {
                            "is_correct": is_correct,
                            "explanation": "谢谢你的回答！" if is_correct else "再试一次，你可以的！",
                            "need_extra_help": not is_correct
                        }
                    
                    result = await response.json()
                    
                    # Extract the response
                    if "choices" in result and len(result["choices"]) > 0:
                        explanation = result["choices"][0]["message"]["content"]
                        
                        # Return the evaluation
                        return {
                            "is_correct": is_correct,
                            "explanation": explanation,
                            "need_extra_help": not is_correct
                        }
                    else:
                        logger.error(f"Unexpected DeepSeek API response: {result}")
                        # Return a fallback evaluation
                        return {
                            "is_correct": is_correct,
                            "explanation": "谢谢你的回答！" if is_correct else "再试一次，你可以的！",
                            "need_extra_help": not is_correct
                        }
        
        except Exception as e:
            logger.error(f"Error evaluating answer with DeepSeek: {str(e)}")
            # Return a fallback evaluation with the correct answer check
            is_correct = abs(user_answer - correct_answer) < 0.001
            return {
                "is_correct": is_correct,
                "explanation": "谢谢你的回答！" if is_correct else "再试一次，你可以的！",
                "need_extra_help": not is_correct
            }
