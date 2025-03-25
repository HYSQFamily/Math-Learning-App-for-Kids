// Define API endpoints with HTTPS
const API_ENDPOINTS = [
  'https://math-learning-app-backend.fly.dev',
  'https://math-learning-app-backend-fallback.fly.dev'
];

// Initialize with the first endpoint
let currentEndpointIndex = 0;
let API_URL = API_ENDPOINTS[currentEndpointIndex];

// Function to switch to the next endpoint if one fails
const switchToNextEndpoint = () => {
  console.log(`Switching to next API endpoint: ${API_ENDPOINTS[currentEndpointIndex]}`);
  currentEndpointIndex = (currentEndpointIndex + 1) % API_ENDPOINTS.length;
  API_URL = API_ENDPOINTS[currentEndpointIndex];
  return API_URL;
};

export interface User {
  id: string;
  username: string;
  grade_level: number;
  points: number;
  streak_days: number;
  last_practice?: string;
}

export interface Problem {
  id: string;
  type: string;
  question: string;
  correct_answer: number;
  difficulty: number;
  hints: string[];
  explanation: string;
  knowledge_point: string;
  related_points: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_reward: number;
}

export interface Progress {
  user_id: string;
  total_solved: number;
  correct_solved: number;
  current_streak: number;
  points: number;
  last_practice: string;
  achievements: Achievement[];
}

export const api = {
  createUser: async (username: string): Promise<User> => {
    // Try each endpoint until one works
    for (let attempt = 0; attempt < API_ENDPOINTS.length; attempt++) {
      try {
        console.log(`Attempting to create user with API endpoint: ${API_URL}`);
        const response = await fetch(`${API_URL}/users/?username=${encodeURIComponent(username)}`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.log(`Network error, retrying with next endpoint: ${API_URL}`);
        switchToNextEndpoint();
        
        // If we've tried all endpoints, throw the error
        if (attempt === API_ENDPOINTS.length - 1) {
          console.log(`All API endpoints failed, using fallback: ${error}`);
          throw error;
        }
      }
    }
    
    // This should never be reached due to the throw in the loop
    throw new Error("Failed to create user after trying all endpoints");
  },

  askTutor: async (userId: string, question: string, service: string = 'openai') => {
    // Try each endpoint until one works
    for (let attempt = 0; attempt < API_ENDPOINTS.length; attempt++) {
      try {
        const response = await fetch(`${API_URL}/tutor/ask?service=${service}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId, question }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || '系统出现错误，请稍后再试');
        }
        
        return await response.json();
      } catch (error: any) {
        console.error('AI Tutor Error:', error);
        switchToNextEndpoint();
        
        // If we've tried all endpoints, throw the error
        if (attempt === API_ENDPOINTS.length - 1) {
          throw error;
        }
      }
    }
    
    // This should never be reached due to the throw in the loop
    throw new Error("Failed to ask tutor after trying all endpoints");
  },

  getProblems: async (type?: string): Promise<Problem[]> => {
    // Try each endpoint until one works
    for (let attempt = 0; attempt < API_ENDPOINTS.length; attempt++) {
      try {
        const url = type ? `${API_URL}/problems/?problem_type=${type}` : `${API_URL}/problems/`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        switchToNextEndpoint();
        
        // If we've tried all endpoints, throw the error
        if (attempt === API_ENDPOINTS.length - 1) {
          console.error('Failed to get problems:', error);
          throw error;
        }
      }
    }
    
    // This should never be reached due to the throw in the loop
    return [];
  },

  submitAttempt: async (userId: string, problemId: string, answer: number) => {
    // Try each endpoint until one works
    for (let attempt = 0; attempt < API_ENDPOINTS.length; attempt++) {
      try {
        const response = await fetch(`${API_URL}/attempts/?user_id=${userId}&problem_id=${problemId}&answer=${answer}`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        switchToNextEndpoint();
        
        // If we've tried all endpoints, throw the error
        if (attempt === API_ENDPOINTS.length - 1) {
          console.error('Failed to submit attempt:', error);
          throw error;
        }
      }
    }
    
    // This should never be reached due to the throw in the loop
    throw new Error("Failed to submit attempt after trying all endpoints");
  },

  getProgress: async (userId: string): Promise<Progress> => {
    // Try each endpoint until one works
    for (let attempt = 0; attempt < API_ENDPOINTS.length; attempt++) {
      try {
        const response = await fetch(`${API_URL}/progress/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        switchToNextEndpoint();
        
        // If we've tried all endpoints, throw the error
        if (attempt === API_ENDPOINTS.length - 1) {
          console.error('Failed to get progress:', error);
          throw error;
        }
      }
    }
    
    // This should never be reached due to the throw in the loop
    throw new Error("Failed to get progress after trying all endpoints");
  },
  
  // Add generator endpoint for problem generation
  generateProblem: async (gradeLevel: number, topic: string, language: string = 'en'): Promise<Problem> => {
    // Try each endpoint until one works
    for (let attempt = 0; attempt < API_ENDPOINTS.length; attempt++) {
      try {
        const timestamp = Date.now(); // Add cache-busting timestamp
        const url = `${API_URL}/problems/generate?grade_level=${gradeLevel}&topic=${topic}&language=${language}&t=${timestamp}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        switchToNextEndpoint();
        
        // If we've tried all endpoints, throw the error
        if (attempt === API_ENDPOINTS.length - 1) {
          console.error('Failed to generate problem:', error);
          throw error;
        }
      }
    }
    
    // This should never be reached due to the throw in the loop
    throw new Error("Failed to generate problem after trying all endpoints");
  }
};
