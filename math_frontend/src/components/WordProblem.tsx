import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Brain } from "lucide-react";
import { api, Problem } from '../lib/api';

interface WordProblemProps {
  language: 'en' | 'zh';
  userId: string;
  onScoreUpdate: () => void;
}

export function WordProblem({ language, userId, onScoreUpdate }: WordProblemProps) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{correct: boolean; message: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const loadProblem = async () => {
    setLoading(true);
    try {
      const response = await api.getWordProblem(language);
      setProblem(response);
      setAnswer('');
      setFeedback(null);
      setShowExplanation(false);
    } catch (error) {
      console.error('Failed to load problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = async () => {
    if (!problem) return;
    
    try {
      const response = await api.checkWordProblemAnswer(problem.id, userId, Number(answer));
      
      if (response.correct) {
        setFeedback({
          correct: true,
          message: language === 'en' ? 'Correct! Great job!' : '答对了！做得好！'
        });
        onScoreUpdate();
      } else {
        setFeedback({
          correct: false,
          message: language === 'en' ? 'Try again!' : '再试一次！'
        });
      }
    } catch (error) {
      console.error('Failed to check answer:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          {language === 'en' ? 'Word Problems' : '应用题'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!problem ? (
            <Button 
              onClick={loadProblem}
              className="w-full"
              disabled={loading}
            >
              {loading 
                ? (language === 'en' ? 'Loading...' : '加载中...') 
                : (language === 'en' ? 'Get New Problem' : '获取新题目')}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="text-lg font-medium">
                {language === 'en' ? problem.question_en : problem.question_zh}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={language === 'en' ? 'Your answer' : '你的答案'}
                  className="text-lg"
                />
                <Button onClick={checkAnswer}>
                  {language === 'en' ? 'Check' : '检查'}
                </Button>
              </div>
              {feedback && (
                <div className={`p-4 rounded-lg ${
                  feedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <p className="text-center mb-2">{feedback.message}</p>
                  {!feedback.correct && (
                    <Button
                      variant="outline"
                      onClick={() => setShowExplanation(true)}
                      className="w-full mt-2"
                    >
                      {language === 'en' ? 'Show Explanation' : '查看解释'}
                    </Button>
                  )}
                </div>
              )}
              {showExplanation && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-900 mb-2">
                    {language === 'en' ? 'Explanation:' : '解释：'}
                  </p>
                  <p className="text-blue-800">
                    {language === 'en' ? problem.explanation_en : problem.explanation_zh}
                  </p>
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={loadProblem}
                className="w-full"
                disabled={loading}
              >
                {language === 'en' ? 'Next Problem' : '下一题'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
