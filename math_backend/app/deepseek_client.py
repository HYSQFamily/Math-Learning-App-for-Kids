from pydantic import BaseModel
import httpx
import os
from typing import Optional, Dict

class DeepSeekRequest(BaseModel):
    user_id: str
    question: str
    language: str = "en"

class DeepSeekClient:
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_TOKEN")
        if not self.api_key:
            raise ValueError("DEEPSEEK_API_TOKEN not found in environment")
        self.base_url = "https://api.siliconflow.cn/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def ask(self, request: DeepSeekRequest) -> str:
        system_prompt = {
            "en": """You are a friendly elementary school math teacher helping 3rd-grade students.
Please use simple language and encourage thinking. When answering:
1. Use vivid and interesting examples
2. Explain step by step
3. Give hints instead of direct answers
4. Use an encouraging tone
5. Praise student's thinking at appropriate times""",
            "zh": """你是一位友善的小学数学老师，正在辅导三年级的学生。
请用简单易懂的语言回答问题，并鼓励学生思考。在回答时：
1. 使用生动有趣的例子
2. 分步骤解释
3. 给出提示而不是直接答案
4. 用积极鼓励的语气
5. 适时表扬学生的思考"""
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": "deepseek-ai/DeepSeek-V3",
                        "messages": [
                            {"role": "system", "content": system_prompt[request.language]},
                            {"role": "user", "content": request.question}
                        ],
                        "stream": False,
                        "max_tokens": 512,
                        "stop": ["null"],
                        "temperature": 0.7,
                        "top_p": 0.7,
                        "top_k": 50,
                        "frequency_penalty": 0.5,
                        "n": 1,
                        "response_format": {"type": "text"}
                    }
                )
                response.raise_for_status()
                return response.json()["choices"][0]["message"]["content"]
            except httpx.HTTPError as e:
                print(f"Deepseek API error: {str(e)}")
                raise

    async def generate_word_problem(self, grade_level: int, language: str = "en") -> Dict[str, str]:
        prompts = {
            "en": "Generate a 3rd grade math word problem about addition or subtraction. Include the problem, its solution, and a step-by-step explanation. Format the response as JSON with fields: problem, answer (number), explanation.",
            "zh": "生成一道三年级的加法或减法应用题。包括题目、答案和详细的解题步骤。请以JSON格式返回，包含字段：problem（题目）, answer（数字答案）, explanation（解释）。"
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": "deepseek-ai/DeepSeek-V3",
                        "messages": [
                            {"role": "system", "content": prompts[language]},
                            {"role": "user", "content": "Generate a word problem"}
                        ],
                        "stream": False,
                        "max_tokens": 512,
                        "stop": ["null"],
                        "temperature": 0.7,
                        "top_p": 0.7,
                        "top_k": 50,
                        "frequency_penalty": 0.5,
                        "n": 1,
                        "response_format": {"type": "json_object"}
                    }
                )
                response.raise_for_status()
                result = response.json()["choices"][0]["message"]["content"]
                return result
            except httpx.HTTPError as e:
                print(f"Deepseek API error: {str(e)}")
                raise
