import os
import httpx
from .base_provider import BaseProvider, TutorRequest

class DeepSeekProvider(BaseProvider):
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_TOKEN")
        if not self.api_key:
            raise ValueError("DEEPSEEK_API_TOKEN not found in environment")
        self.base_url = "https://api.deepseek.com"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    async def ask(self, request: TutorRequest) -> str:
        async with httpx.AsyncClient() as client:
            try:
                payload = {
                    "messages": [
                        {"role": "system", "content": self.get_system_prompt()},
                        {"role": "user", "content": request.question}
                    ],
                    "model": "deepseek-chat",
                    "temperature": 0.7,
                    "max_tokens": 500,
                    "stream": False
                }
                
                response = await client.post(
                    f"{self.base_url}/v1/chat/completions",
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    error_msg = f"DeepSeek API error: Non-200 status code {response.status_code}"
                    error_msg += f"\nResponse body: {response.text}"
                    raise httpx.HTTPError(error_msg)
                
                return response.json()["choices"][0]["message"]["content"]
            except httpx.HTTPError as e:
                error_msg = f"DeepSeek API error: {str(e)}"
                if hasattr(e, 'response'):
                    error_msg += f"\nStatus: {e.response.status_code}"
                    error_msg += f"\nHeaders: {dict(e.response.headers)}"
                    error_msg += f"\nBody: {e.response.text}"
                print(error_msg)
                raise
