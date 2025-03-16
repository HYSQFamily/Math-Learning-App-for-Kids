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
        self.api_token = os.environ.get("REPLICATE_API_TOKEN", "")
        self.model = "anthropic/claude-3.7-sonnet"
        
    async def ask(self, request: TutorRequest) -> str:
        """Ask a question to Claude 3.7"""
        try:
            logger.info(f"Asking Claude 3.7: {request.question}")
            
            # If no API token, return a mock response
            if not self.api_token:
                if request.hint_type == "quick_hint":
                    return "尝试把问题分解成更小的步骤，一步一步解决。"
                else:
                    return "首先理解题目要求，然后列出已知条件，最后一步一步解答。如果遇到困难，可以画图帮助理解。"
            
            system_prompt = """你是一位小学数学老师，专门帮助学生解答数学问题。
            请用简单、友好的语言回答问题，适合小学生理解。
            如果学生的问题不清楚，请礼貌地要求他们提供更多信息。
            """
            
            if request.hint_type == "quick_hint":
                system_prompt += "请提供简短的提示，不要直接给出完整答案。"
            else:
                system_prompt += "请提供详细的解答步骤，帮助学生理解解题过程。"
            
            # Set API token
            os.environ["REPLICATE_API_TOKEN"] = self.api_token
            
            # Call Replicate API
            output = ""
            for event in replicate.stream(
                self.model,
                input={
                    "system": system_prompt,
                    "prompt": request.question,
                    "temperature": 0.7,
                    "max_tokens": 1024
                }
            ):
                output += str(event)
            
            return output
            
        except Exception as e:
            logger.error(f"Error asking Claude 3.7: {str(e)}")
            return "抱歉，AI助手暂时无法回答，请稍后再试。"
    
    async def evaluate_answer(self, problem_id: str, user_answer: float, correct_answer: float) -> Dict[str, Any]:
        """Evaluate a user's answer using Claude 3.7"""
        try:
            logger.info(f"Evaluating answer with Claude 3.7: Problem {problem_id}, User answer: {user_answer}, Correct answer: {correct_answer}")
            
            is_correct = abs(user_answer - correct_answer) < 0.001
            
            # If no API token, return a simple evaluation
            if not self.api_token:
                return {
                    "is_correct": is_correct,
                    "explanation": "答案正确！" if is_correct else f"正确答案是 {correct_answer}",
                    "need_extra_help": not is_correct
                }
            
            # Set API token
            os.environ["REPLICATE_API_TOKEN"] = self.api_token
            
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
            
            # Call Replicate API
            output = ""
            for event in replicate.stream(
                self.model,
                input={
                    "system": system_prompt,
                    "prompt": f"问题ID: {problem_id}, 学生答案: {user_answer}, 正确答案: {correct_answer}",
                    "temperature": 0.3,
                    "max_tokens": 1024
                }
            ):
                output += str(event)
            
            # Extract JSON from response
            try:
                # Find JSON in the response
                start_idx = output.find('{')
                end_idx = output.rfind('}') + 1
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = output[start_idx:end_idx]
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
            logger.error(f"Error evaluating answer with Claude 3.7: {str(e)}")
            return {
                "is_correct": is_correct,
                "explanation": "答案正确！" if is_correct else f"正确答案是 {correct_answer}",
                "need_extra_help": not is_correct
            }
    
    async def generate_problem(self, request: ProblemGenerationRequest) -> Dict[str, Any]:
        """Generate a math problem using Claude 3.7"""
        try:
            # Set difficulty description
            difficulty_desc = "简单"
            if request.difficulty == 2:
                difficulty_desc = "中等"
            elif request.difficulty == 3:
                difficulty_desc = "困难"
            
            # Set topic description
            topic_desc = ""
            if request.topic:
                topic_desc = request.topic
            
            logger.info(f"Generating {difficulty_desc} {topic_desc} problem for grade {request.grade_level}")
            
            # If no API token, return a simple problem
            if not self.api_token:
                return {
                    "question": f"{request.grade_level}年级数学题: 7 + 8 = ?",
                    "answer": 15,
                    "knowledge_point": "加法",
                    "hints": ["可以先凑成10，再加剩余的数"],
                    "difficulty": request.difficulty or 2,
                    "type": "arithmetic"
                }
            
            # Set API token
            os.environ["REPLICATE_API_TOKEN"] = self.api_token
            
            system_prompt = """你是一位小学数学老师，需要生成适合小学生的数学题目。
            请生成一道数学题目，并按照以下JSON格式返回:
            {
                "question": "题目内容",
                "answer": 数字答案,
                "knowledge_point": "知识点",
                "hints": ["提示1", "提示2"],
                "difficulty": 难度等级(1-3),
                "type": "题目类型"
            }
            
            只返回JSON格式，不要有其他文字。确保answer是一个数字，不是字符串。
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
            try:
                # Find JSON in the response
                start_idx = output.find('{')
                end_idx = output.rfind('}') + 1
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = output[start_idx:end_idx]
                    problem = json.loads(json_str)
                    
                    # Validate problem data
                    if "question" not in problem or "answer" not in problem:
                        raise ValueError("Invalid problem data: missing required fields")
                    
                    # Ensure answer is a number
                    try:
                        problem["answer"] = float(problem["answer"])
                    except (ValueError, TypeError):
                        problem["answer"] = 0
                    
                    # Ensure other fields exist
                    problem.setdefault("knowledge_point", "基础数学")
                    problem.setdefault("hints", ["思考一下基本的计算方法"])
                    problem.setdefault("difficulty", request.difficulty or 2)
                    problem.setdefault("type", "arithmetic")
                    
                    return problem
                else:
                    raise ValueError("Could not find JSON in response")
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON in response")
            
        except Exception as e:
            logger.error(f"Error generating problem with Claude 3.7: {str(e)}")
            # Return a fallback problem
            return {
                "question": f"{request.grade_level}年级数学题: 7 + 8 = ?",
                "answer": 15,
                "knowledge_point": "加法",
                "hints": ["可以先凑成10，再加剩余的数"],
                "difficulty": request.difficulty or 2,
                "type": "arithmetic"
            }
