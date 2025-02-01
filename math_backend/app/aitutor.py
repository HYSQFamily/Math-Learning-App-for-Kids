from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class TutorRequest(BaseModel):
    user_id: str
    question: str

@router.post("/ask")
async def ask_tutor(req: TutorRequest):
    try:
        openai_api_key = os.getenv("OPENAI_API_TOKEN")
        if not openai_api_key:
            print("ERROR: OpenAI API token not found in environment")
            raise HTTPException(status_code=500, detail="系统配置错误，请联系管理员")
        
        print(f"DEBUG: Asking OpenAI => {req.question}")
        try:
            client = openai.AsyncOpenAI(api_key=openai_api_key)
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": """你是一位友善的小学数学老师，正在辅导三年级的学生。
请用简单易懂的语言回答问题，并鼓励学生思考。在回答时：
1. 使用生动有趣的例子
2. 分步骤解释
3. 给出提示而不是直接答案
4. 用积极鼓励的语气
5. 适时表扬学生的思考"""},
                    {"role": "user", "content": req.question}
                ],
                temperature=0.7,
                max_tokens=500
            )
            answer = response.choices[0].message.content
            print(f"DEBUG: Received answer from OpenAI => {answer}")
            return {"answer": answer}
        except openai.APIError as e:
            print(f"ERROR: OpenAI API error => {str(e)}")
            raise HTTPException(status_code=503, detail="AI助手暂时无法回答，请稍后再试")
        except openai.RateLimitError:
            print("ERROR: OpenAI rate limit exceeded")
            raise HTTPException(status_code=429, detail="请求太频繁，请稍后再试")
        except openai.APIConnectionError as e:
            print(f"ERROR: OpenAI connection error => {str(e)}")
            raise HTTPException(status_code=503, detail="网络连接问题，请稍后再试")
    except Exception as e:
        print(f"ERROR: Unexpected error => {str(e)}")
        raise HTTPException(status_code=500, detail="系统出现错误，请稍后再试")
