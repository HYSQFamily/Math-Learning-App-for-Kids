"""Replicate API provider for problem generation"""
import os
import json
import logging
import replicate
from typing import Dict, Any, Optional, List

from app.providers.base_provider import BaseProvider
from app.config.prompt_templates import BEIJING_BILINGUAL_PROMPT

logger = logging.getLogger(__name__)

class ReplicateProvider(BaseProvider):
    """Provider that uses Replicate API for problem generation"""
    
    def __init__(self):
        """Initialize the Replicate provider"""
        self.api_token = os.environ.get("REPLICATE_API_TOKEN", "")
        if not self.api_token:
            logger.warning("Replicate API token not found in environment variables")
        
        # Set the API token for the replicate library
        os.environ["REPLICATE_API_TOKEN"] = self.api_token
        
        # Default model
        self.model = "anthropic/claude-3.7-sonnet"
        
        # Use the Beijing bilingual prompt template
        self.prompt_template = BEIJING_BILINGUAL_PROMPT
    
    def is_available(self) -> bool:
        """Check if the provider is available"""
        return bool(self.api_token)
    
    async def generate_problem(self, grade_level: int = 3, language: str = "zh+sv") -> Dict[str, Any]:
        """Generate a math problem using Replicate API"""
        if not self.is_available():
            logger.error("Replicate API token not available")
            return self._generate_fallback_problem(language)
        
        try:
            # Use the prompt template
            prompt = self.prompt_template
            
            # Call the Replicate API
            output = replicate.run(
                self.model,
                input={
                    "prompt": prompt,
                    "temperature": 0.7,
                    "max_tokens": 1024
                }
            )
            
            # Parse the response
            if isinstance(output, str):
                # Extract JSON from the response
                try:
                    # Find JSON in the response
                    json_start = output.find("{")
                    json_end = output.rfind("}") + 1
                    if json_start >= 0 and json_end > json_start:
                        json_str = output[json_start:json_end]
                        problem_data = json.loads(json_str)
                    else:
                        # If no JSON found, use the whole output
                        problem_data = json.loads(output)
                    
                    # Ensure the problem has the required fields
                    if not self._validate_problem(problem_data):
                        logger.warning("Invalid problem format from Replicate API")
                        return self._generate_fallback_problem(language)
                    
                    return problem_data
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON from Replicate response: {e}")
                    logger.debug(f"Raw response: {output}")
                    return self._generate_fallback_problem(language)
            else:
                logger.error(f"Unexpected response type from Replicate API: {type(output)}")
                return self._generate_fallback_problem(language)
                
        except Exception as e:
            logger.error(f"API call failed: {type(e).__name__} Details: {str(e)}")
            return self._generate_fallback_problem(language)
    
    async def ask(self, user_id: str, question: str, hint_type: str = "quick_hint") -> Dict[str, Any]:
        """Ask a question to the AI tutor"""
        if not self.is_available():
            logger.error("Replicate API token not available")
            return {"answer": "AI助手服务未配置", "model": None}
        
        try:
            # Prepare the prompt
            prompt = f"""你是一位小学数学老师，正在辅导一位学生解决数学问题。
学生的问题是：{question}

请提供一个{"简短的提示" if hint_type == "quick_hint" else "详细的分析"}，帮助学生理解并解决这个问题。
回答应该是鼓励性的，适合小学生理解的语言。"""
            
            # Call the Replicate API
            output = replicate.run(
                self.model,
                input={
                    "prompt": prompt,
                    "temperature": 0.7,
                    "max_tokens": 1024
                }
            )
            
            # Return the response
            if isinstance(output, str):
                return {"answer": output, "model": self.model}
            elif isinstance(output, list):
                return {"answer": "".join(output), "model": self.model}
            else:
                logger.error(f"Unexpected response type from Replicate API: {type(output)}")
                return {"answer": "对不起，我现在无法回答你的问题。请稍后再试。", "model": None}
                
        except Exception as e:
            logger.error(f"API call failed: {type(e).__name__} Details: {str(e)}")
            return {"answer": "对不起，我现在无法回答你的问题。请稍后再试。", "model": None}
    
    def _validate_problem(self, problem: Dict[str, Any]) -> bool:
        """Validate that the problem has the required fields"""
        required_fields = ["question", "answer"]
        for field in required_fields:
            if field not in problem:
                return False
        
        # Check if question is a dictionary with language keys for bilingual problems
        if isinstance(problem["question"], dict):
            if "zh" not in problem["question"] or "sv" not in problem["question"]:
                return False
        
        # Ensure answer is a number
        if not isinstance(problem["answer"], (int, float)):
            try:
                problem["answer"] = float(problem["answer"])
            except (ValueError, TypeError):
                return False
        
        return True
    
    def _generate_fallback_problem(self, language: str) -> Dict[str, Any]:
        """Generate a fallback problem when API fails"""
        logger.info("Generating fallback problem")
        
        if language == "zh+sv" or language == "sv+zh":
            # Bilingual problem
            return {
                "question": {
                    "zh": "黄小星有5个苹果，李小毛给了他3个苹果。黄小星现在有多少个苹果？",
                    "sv": "Huang Xiaoxing har 5 äpplen. Li Xiaomao ger honom 3 äpplen till. Hur många äpplen har Huang Xiaoxing nu?"
                },
                "answer": 8,
                "difficulty": 1,
                "hints": ["可以用加法来解决这个问题"],
                "knowledge_point": "加法",
                "type": "word_problem"
            }
        else:
            # Chinese-only problem
            return {
                "question": "黄小星有5个苹果，李小毛给了他3个苹果。黄小星现在有多少个苹果？",
                "answer": 8,
                "difficulty": 1,
                "hints": ["可以用加法来解决这个问题"],
                "knowledge_point": "加法",
                "type": "word_problem"
            }
