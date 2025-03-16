import os
import sys
import asyncio
import logging
from app.providers import ProviderFactory, ProblemGenerationRequest

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up API tokens from environment variables
replicate_token = os.environ.get("REPLICATE_API_TOKEN", os.environ.get("Replicate_API_TOKEN"))
if replicate_token:
    os.environ["REPLICATE_API_TOKEN"] = replicate_token
    logger.info("Replicate API token configured")

deepseek_token = os.environ.get("DEEPSEEK_API_KEY")
if deepseek_token:
    logger.info("DeepSeek API token configured")

async def test_providers():
    """Test the AI providers"""
    # Test Replicate provider
    logger.info("Testing Replicate provider...")
    replicate_provider = ProviderFactory.get_provider("replicate")
    
    # Test problem generation
    request = ProblemGenerationRequest(
        grade_level=3,
        topic="addition",
        difficulty=2,
        language="zh"
    )
    
    try:
        problem = await replicate_provider.generate_problem(request)
        logger.info(f"Generated problem: {problem}")
    except Exception as e:
        logger.error(f"Error generating problem with Replicate: {str(e)}")
    
    # Test DeepSeek provider
    logger.info("Testing DeepSeek provider...")
    deepseek_provider = ProviderFactory.get_provider("deepseek")
    
    # Test answer evaluation
    try:
        evaluation = await deepseek_provider.evaluate_answer(
            problem_id="test_problem",
            user_answer=7,
            correct_answer=7
        )
        logger.info(f"Evaluation result: {evaluation}")
    except Exception as e:
        logger.error(f"Error evaluating answer with DeepSeek: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_providers())
