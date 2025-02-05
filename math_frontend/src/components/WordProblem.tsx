import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BookOpen } from "lucide-react";
import { Language, WordProblem as WordProblemType } from '../types';

interface WordProblemProps {
  language: Language;
  userId: string;
  onScoreUpdate: () => void;
}

export function WordProblem({ language, userId, onScoreUpdate }: WordProblemProps) {
  const [problem, setProblem] = useState<WordProblemType | null>(null);
  const [answer, setAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadProblem = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/problems/word?grade_level=3&language=${language}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to load problem');
      const newProblem = await response.json();
      setProblem(newProblem);
      setAnswer('');
      setShowExplanation(false);
    } catch (error) {
      console.error('Failed to load word problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = async () => {
    if (!problem) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/problems/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          userId,
          answer: Number(answer)
        })
      });
      if (!response.ok) throw new Error('Failed to check answer');
      const result = await response.json();
      setShowExplanation(true);
      if (result.correct) {
        onScoreUpdate();
      }
    } catch (error) {
      console.error('Failed to check answer:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {language === 'en' ? 'Word Problems' : '应用题'}
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            <div className="text-lg">
              {problem.text[language]}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={language === 'en' ? 'Your answer' : '你的答案'}
                className="text-lg"
                step="0.01"
              />
              <Button onClick={checkAnswer}>
                {language === 'en' ? 'Check' : '检查'}
              </Button>
            </div>
            {showExplanation && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-medium mb-2">
                  {language === 'en' ? 'Explanation:' : '解释：'}
                </div>
                <div className="text-sm">
                  {problem.explanation[language]}
                </div>
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
      </CardContent>
    </Card>
  );
}
