import asyncio
import aiohttp
import json
import os

async def test_evaluation_fix():
    """Test the evaluation endpoint with a simple problem"""
    url = "https://math-learning-app-backend.fly.dev/evaluation/evaluate"
    
    # Test data for the "5+7=12" problem
    test_data = {
        "problem_id": "p1",  # This is the ID of the sample addition problem
        "user_answer": 12,
        "user_id": "test-user"
    }
    
    # Make the request
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=test_data) as response:
            status = response.status
            try:
                result = await response.json()
            except:
                result = await response.text()
            
            print(f"Status: {status}")
            print(f"Response: {result}")
            
            if status == 200 and result.get("is_correct") == True:
                print("✅ Test passed: Correct answer was properly evaluated")
            else:
                print("❌ Test failed: Correct answer was not properly evaluated")

if __name__ == "__main__":
    asyncio.run(test_evaluation_fix())
