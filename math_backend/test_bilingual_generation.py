import asyncio
import os
import json
import logging
from app.providers import ProblemGenerationRequest
from app.providers.replicate_provider import ReplicateProvider
from app.config.prompt_templates import BILINGUAL_PROBLEM_TEMPLATE

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_bilingual_problem_generation():
    """Test bilingual problem generation with Claude 3.7"""
    # Get Replicate API token from environment
    replicate_token = os.environ.get("Replicate_API_TOKEN")
    if not replicate_token:
        print("⚠️ Replicate API token not found in environment variables")
        return
    
    print(f"Using Replicate API token: {replicate_token[:5]}...{replicate_token[-5:]}")
    
    # Set Replicate API token
    os.environ["REPLICATE_API_TOKEN"] = replicate_token
    
    # Create provider
    provider = ReplicateProvider()
    
    # Test bilingual problem generation
    request = ProblemGenerationRequest(
        grade_level=3,
        topic="addition",
        difficulty=2,
        language="sv+zh",
        prompt_template=BILINGUAL_PROBLEM_TEMPLATE
    )
    
    try:
        print("Generating bilingual problem...")
        
        # Generate problem
        problem = await provider.generate_problem(request)
        
        # Print problem
        print("\nBilingual Problem:")
        print(json.dumps(problem, indent=2, ensure_ascii=False))
        
        # Check if problem has bilingual question
        if isinstance(problem["question"], dict) and "zh" in problem["question"] and "sv" in problem["question"]:
            print("\n✅ Successfully generated bilingual problem")
            print(f"Chinese: {problem['question']['zh']}")
            print(f"Swedish: {problem['question']['sv']}")
        else:
            print("\n❌ Failed to generate bilingual problem")
            print(f"Question format: {type(problem['question'])}")
            
            # If we got a string instead of a dict, try to create a bilingual format
            if isinstance(problem["question"], str):
                print("\nAttempting to convert string question to bilingual format...")
                # Create a bilingual format manually for testing
                bilingual_question = {
                    "zh": problem["question"],
                    "sv": f"Svenska: {problem['question']}"  # Placeholder
                }
                problem["question"] = bilingual_question
                print("Converted problem:")
                print(json.dumps(problem, indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_bilingual_problem_generation())
