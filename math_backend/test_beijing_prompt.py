import asyncio
import os
import json
import requests

async def test_beijing_bilingual_problem():
    """Test Beijing bilingual problem generation with the specific prompt"""
    # Test the deployed API
    url = "http://localhost:8000/problems/next"
    
    # Request parameters
    params = {
        "user_id": "test-user",
        "language": "sv+zh"
    }
    
    try:
        # Make the request
        response = requests.get(url, params=params)
        
        # Check response status
        if response.status_code == 200:
            problem = response.json()
            
            # Print problem
            print("Beijing Bilingual Problem:")
            print(json.dumps(problem, indent=2, ensure_ascii=False))
            
            # Check if problem has bilingual question
            if isinstance(problem["question"], dict) and "zh" in problem["question"] and "sv" in problem["question"]:
                print("✅ Successfully generated bilingual problem")
                print(f"Chinese: {problem['question']['zh']}")
                print(f"Swedish: {problem['question']['sv']}")
                
                # Check if the problem is appropriate for Beijing 3rd grade
                # We no longer expect "北京" or "三年级" to be in the problem text
                # Instead, we check if it's a math problem with appropriate difficulty
                if isinstance(problem.get("difficulty"), (int, float)) and 1 <= problem.get("difficulty", 0) <= 3:
                    print("✅ Problem is appropriate for Beijing 3rd grade level")
                    # Verify that "北京" and "三年级" are NOT in the problem text
                    if "北京" not in problem['question']['zh'] and "三年级" not in problem['question']['zh']:
                        print("✅ Problem does not mention grade level in the text")
                    else:
                        print("❌ Problem still mentions grade level in the text")
                else:
                    print("⚠️ Problem may not be appropriate for Beijing 3rd grade level")
            else:
                print("❌ Failed to generate bilingual problem")
                print(f"Question format: {type(problem['question'])}")
        else:
            print(f"❌ API request failed with status code {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_beijing_bilingual_problem())
