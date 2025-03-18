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
                if "北京" in problem['question']['zh'] or "三年级" in problem['question']['zh']:
                    print("✅ Problem is appropriate for Beijing 3rd grade")
                else:
                    print("⚠️ Problem may not be specific to Beijing 3rd grade")
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
