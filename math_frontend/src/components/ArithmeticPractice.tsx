import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { api } from '../lib/api';

interface ArithmeticPracticeProps {
  language: 'en' | 'zh';
  userId: string;
  onScoreUpdate: () => void;
}

export function ArithmeticPractice({ language, userId, onScoreUpdate }: ArithmeticPracticeProps) {
  const [operation, setOperation] = useState<string>('addition');
  const [problem, setProblem] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{correct: boolean; message: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const operations = {
    addition: { en: 'Addition', zh: '加法' },
    subtraction: { en: '减法', zh: 'Subtraction' },
    multiplication: { en: 'Multiplication', zh: '乘法' },
    division: { en: 'Division', zh: '除法' }
  };

  const loadProblem = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/problems/arithmetic/${operation}?language=${language}`);
      setProblem(response.data);
      setAnswer('');
      setFeedback(null);
    } catch (error) {
      console.error('Failed to load problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = async () => {
    if (!problem) return;
    
    try {
      const response = await api.post(`/problems/arithmetic/${problem.id}/check`, {
        answer: Number(answer),
        user_id: userId
      });
      
      if (response.data.correct) {
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
          <Calculator className="h-5 w-5" />
          {language === 'en' ? 'Arithmetic Practice' : '算术练习'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(operations).map(([key, labels]) => (
              <Button
                key={key}
                variant={operation === key ? "default" : "outline"}
                onClick={() => {
                  setOperation(key);
                  setProblem(null);
                  setAnswer('');
                  setFeedback(null);
                }}
              >
                {labels[language]}
              </Button>
            ))}
          </div>

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
              <div className="text-lg font-medium text-center">
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
                <div className={`p-4 rounded-lg text-center ${
                  feedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {feedback.message}
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
