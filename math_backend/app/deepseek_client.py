from pydantic import BaseModel
import httpx
import os
from typing import Optional

class DeepSeekRequest(BaseModel):
    user_id: str
    question: str

class DeepSeekClient:
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_TOKEN")
        if not self.api_key:
            raise ValueError("DEEPSEEK_API_TOKEN not found in environment")
        self.base_url = "https://api.deepseek.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def ask(self, request: DeepSeekRequest) -> str:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "messages": [
                            {"role": "system", "content": """你是一位友善的小学数学老师，正在辅导三年级的学生。
请用简单易懂的语言回答问题，并鼓励学生思考。在回答时：
1. 使用生动有趣的例子
2. 分步骤解释
3. 给出提示而不是直接答案
4. 用积极鼓励的语气
5. 适时表扬学生的思考"""},
                            {"role": "user", "content": request.question}
                        ],
                        "model": "deepseek-chat",
                        "temperature": 0.7,
                        "max_tokens": 500
                    }
                )
                response.raise_for_status()
                return response.json()["choices"][0]["message"]["content"]
            except httpx.HTTPError as e:
                print(f"Deepseek API error: {str(e)}")
                raise
