import os
import json
import logging
import replicate
from typing import Dict, Any, Optional, List
from . import Provider, TutorRequest, ProblemGenerationRequest

logger = logging.getLogger(__name__)

class ReplicateProvider(Provider):
    """Provider for Replicate API (Claude 3.7)"""
    
    def __init__(self):
        self.api_token = os.environ.get("REPLICATE_API_TOKEN", "r8_eGzwxuZM1YLmu2YoPPVQKizCZ4KwLi00Obptf")
        self.model = "anthropic/claude-3.7-sonnet"
        os.environ["REPLICATE_API_TOKEN"] = self.api_token
        
    async def ask(self, request: TutorRequest) -> str:
        """Ask a question to Claude via Replicate"""
        try:
            logger.info(f"Asking Claude via Replicate: {request.question}")
            
            system_prompt = """你是一位小学数学老师，专门帮助学生解答数学问题。
            请用简单、友好的语言回答问题，适合小学生理解。
            如果学生的问题不清楚，请礼貌地要求他们提供更多信息。
            """
            
            if request.hint_type == "quick_hint":
                system_prompt += "请提供简短的提示，不要直接给出完整答案。"
            else:
                system_prompt += "请提供详细的解答步骤，帮助学生理解解题过程。"
            
            prompt = f"学生问题: {request.question}\n\n请提供帮助:"
            
            # Call Replicate API
            output = ""
            for event in replicate.stream(
                self.model,
                input={
                    "prompt": prompt,
                    "system": system_prompt,
                    "temperature": 0.7,
                    "max_tokens": 1024
                }
            ):
                output += str(event)
            
            return output.strip()
            
        except Exception as e:
            logger.error(f"Error asking Claude via Replicate: {str(e)}")
            return "抱歉，AI助手暂时无法回答，请稍后再试。"
    
    async def generate_problem(self, request: ProblemGenerationRequest) -> Dict[str, Any]:
        """Generate a math problem using Claude 3.7"""
        try:
            logger.info(f"Generating problem with Claude 3.7: Grade {request.grade_level}, Topic: {request.topic}")
            
            # Determine difficulty level description
            difficulty_desc = "中等难度"
            if request.difficulty == 1:
                difficulty_desc = "简单"
            elif request.difficulty == 3:
                difficulty_desc = "较难"
                
            # Determine topic description
            topic_desc = request.topic or "任意数学知识点"
            
            # Create system prompt
            system_prompt = f"""你是一位专业的小学数学教师，擅长创建适合{request.grade_level}年级学生的数学题目。
            请创建一道{difficulty_desc}的{topic_desc}题目。
            
            请按照以下JSON格式返回题目:
            {{
                "question": "题目内容",
                "answer": 数字答案,
                "knowledge_point": "知识点",
                "hints": ["提示1", "提示2"],
                "difficulty": 难度等级(1-3)
            }}
            
            只返回JSON格式，不要有其他文字。确保answer是一个数字。
            """
            
            # Call Replicate API
            output = ""
            for event in replicate.stream(
                self.model,
                input={
                    "system": system_prompt,
                    "prompt": f"请生成一道{request.grade_level}年级的{topic_desc}数学题目，难度为{difficulty_desc}。",
                    "temperature": 0.7,
                    "max_tokens": 1024
                }
            ):
                output += str(event)
            
            # Extract JSON from response
            output = output.strip()
            try:
                # Find JSON in the response
                start_idx = output.find('{')
                end_idx = output.rfind('}') + 1
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = output[start_idx:end_idx]
                    problem_data = json.loads(json_str)
                    
                    # Ensure required fields exist
                    if "question" not in problem_data or "answer" not in problem_data:
                        raise ValueError("Missing required fields in problem data")
                    
                    # Ensure answer is a number
                    try:
                        problem_data["answer"] = float(problem_data["answer"])
                    except (ValueError, TypeError):
                        problem_data["answer"] = 0
                        
                    # Add default values for missing fields
                    problem_data.setdefault("knowledge_point", topic_desc or "基础数学")
                    problem_data.setdefault("hints", ["仔细读题", "尝试画图理解"])
                    problem_data.setdefault("difficulty", request.difficulty or 2)
                    
                    # Add type field
                    problem_data["type"] = "arithmetic"
                    
                    return problem_data
                else:
                    raise ValueError("Could not find JSON in response")
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON in response")
            
        except Exception as e:
            logger.error(f"Error generating problem with Claude: {str(e)}")
            # Return a fallback problem
            return {
                "question": f"{request.grade_level}年级数学题: 7 + 8 = ?",
                "answer": 15,
                "knowledge_point": "加法",
                "hints": ["可以先凑整10，再加剩余的数"],
                "difficulty": request.difficulty or 2,
                "type": "arithmetic"
            }
    
    async def evaluate_answer(self, problem_id: str, user_answer: float, correct_answer: float) -> Dict[str, Any]:
        """Evaluate a user's answer using DeepSeek V3"""
        # This method will be implemented in the DeepSeek provider
        # Here we just provide a simple evaluation
        is_correct = abs(user_answer - correct_answer) < 0.001
        
        return {
            "is_correct": is_correct,
            "explanation": "答案正确！" if is_correct else f"正确答案是 {correct_answer}",
            "need_extra_help": not is_correct
        }
