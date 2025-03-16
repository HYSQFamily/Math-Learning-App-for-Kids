import os
import httpx
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class OpenAIProvider:
    def __init__(self):
        self.model = "gpt-3.5-turbo"
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.api_url = "https://api.openai.com/v1/chat/completions"
        
    async def ask(self, request):
        """Send a question to OpenAI API and get a response"""
        try:
            # Fallback response in case of errors
            fallback_response = "我现在无法连接到AI服务，请稍后再试。这道题目你可以尝试先分解问题，一步一步解决。"
            
            if not self.api_key:
                logger.warning("OpenAI API key not found, using fallback response")
                return fallback_response
                
            # Create the prompt for the AI
            system_prompt = """你是一位小学数学老师，名叫"智能数学助教"。你的任务是帮助小学生理解和解决数学问题。
            请用简单、友好的语言回答问题，避免使用复杂术语。
            对于简单问题，给出简短的提示和引导，而不是直接告诉答案。
            对于复杂问题，可以分步骤解释思路。
            始终保持耐心和鼓励的态度。"""
            
            # Prepare the API request
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.question}
                ],
                "temperature": 0.7,
                "max_tokens": 800
            }
            
            # Make the API request with timeout
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    self.api_url,
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
                else:
                    logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
                    return fallback_response
                    
        except Exception as e:
            logger.exception(f"Error in OpenAI provider: {str(e)}")
            return fallback_response
