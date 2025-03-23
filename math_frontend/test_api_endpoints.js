// Test script for API endpoints
async function testApiEndpoints() {
  const endpoints = [
    'https://math-learning-app-backend.fly.dev/',
    'https://math-learning-app-backend.fly.dev/problems/next?user_id=test-user&language=sv%2Bzh'
  ];
  
  const results = document.getElementById('results');
  results.innerHTML = '<h3>Testing API Endpoints...</h3>';
  
  for (const endpoint of endpoints) {
    try {
      results.innerHTML += `<p>Testing: ${endpoint}</p>`;
      const response = await fetch(endpoint);
      const data = await response.json();
      
      results.innerHTML += `<p class="success">✅ Success: ${JSON.stringify(data, null, 2)}</p>`;
    } catch (error) {
      results.innerHTML += `<p class="error">❌ Error: ${error.message}</p>`;
    }
  }
}

// Test the Next Problem button issue
async function testNextProblemButton() {
  const results = document.getElementById('next-problem-results');
  results.innerHTML = '<h3>Testing Next Problem Button...</h3>';
  
  try {
    // Simulate the Next Problem button click
    const userId = 'test-user-' + Math.random().toString(36).substring(2, 9);
    const endpoint = 'https://math-learning-app-backend.fly.dev/problems/next?user_id=' + userId + '&language=sv%2Bzh';
    
    results.innerHTML += `<p>Fetching problem with user_id=${userId}</p>`;
    const response = await fetch(endpoint);
    const data = await response.json();
    
    results.innerHTML += `<p class="success">✅ Problem fetched successfully: ${JSON.stringify(data, null, 2)}</p>`;
    
    // Check if the question is bilingual
    if (typeof data.question === 'object' && data.question.zh && data.question.sv) {
      results.innerHTML += `<p class="success">✅ Bilingual question format confirmed</p>`;
    } else {
      results.innerHTML += `<p class="warning">⚠️ Question is not in bilingual format</p>`;
    }
  } catch (error) {
    results.innerHTML += `<p class="error">❌ Error: ${error.message}</p>`;
  }
}
