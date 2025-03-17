import asyncio
import os
import json
from app.providers import ProblemGenerationRequest
from app.providers.replicate_provider import ReplicateProvider

async def test_bilingual_problem_generation():
    """Test bilingual problem generation with Claude 3.7"""
    # Set Replicate API token
    os.environ["REPLICATE_API_TOKEN"] = os.environ.get("Replicate_API_TOKEN", "")
    
    # Create provider
    provider = ReplicateProvider()
    
    # Test bilingual problem generation
    request = ProblemGenerationRequest(
        grade_level=3,
        topic="addition",
        difficulty=2,
        language="sv+zh"
    )
    
    try:
        # Generate problem
        problem = await provider.generate_problem(request)
        
        # Print problem
        print("Bilingual Problem:")
        print(json.dumps(problem, indent=2, ensure_ascii=False))
        
        # Check if problem has bilingual question
        if isinstance(problem["question"], dict) and "zh" in problem["question"] and "sv" in problem["question"]:
            print("✅ Successfully generated bilingual problem")
        else:
            print("❌ Failed to generate bilingual problem")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_bilingual_problem_generation())
