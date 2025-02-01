from fastapi import APIRouter, HTTPException, Query
from .providers.base_provider import TutorRequest
from .providers.provider_factory import ProviderFactory, ProviderType

router = APIRouter()

@router.post("/ask")
async def ask_tutor(req: TutorRequest, service: ProviderType = Query("openai", description="AI service to use (openai or deepseek)")):
    try:
        provider = ProviderFactory.create(service)
        try:
            answer = await provider.ask(req)
            print(f"DEBUG: Received answer from {service} => {answer}")
            return {"answer": answer}
        except Exception as e:
            print(f"ERROR: {service} API error => {str(e)}")
            if service == "deepseek":
                try:
                    print("DEBUG: Falling back to OpenAI")
                    fallback_provider = ProviderFactory.create("openai")
                    answer = await fallback_provider.ask(req)
                    print(f"DEBUG: Received fallback answer from OpenAI => {answer}")
                    return {"answer": answer}
                except Exception as fallback_error:
                    print(f"ERROR: Fallback to OpenAI failed => {str(fallback_error)}")
                    raise HTTPException(status_code=503, detail="AI助手暂时无法回答，请稍后再试")
            raise HTTPException(status_code=503, detail="AI助手暂时无法回答，请稍后再试")
    except Exception as e:
        print(f"ERROR: Unexpected error => {str(e)}")
        raise HTTPException(status_code=500, detail="系统出现错误，请稍后再试")
