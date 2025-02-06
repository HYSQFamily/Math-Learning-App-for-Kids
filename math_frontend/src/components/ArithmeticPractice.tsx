import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, X, Divide } from "lucide-react";
import { ArithmeticProblem, Language } from '../types';
import { getArithmeticProblem, checkArithmeticAnswer } from '../lib/api';

const operations = {
  addition: { icon: Plus, text: { en: 'Addition', zh: '加法' } },
  subtraction: { icon: Minus, text: { en: 'Subtraction', zh: '减法' } },
  multiplication: { icon: X, text: { en: 'Multiplication', zh: '乘法' } },
  division: { icon: Divide, text: { en: 'Division', zh: '除法' } }
};

interface ArithmeticPracticeProps {
  language: Language;
  userId: string;
  onScoreUpdate: () => void;
}

export function ArithmeticPractice({ language, userId, onScoreUpdate }: ArithmeticPracticeProps) {
  const [operation, setOperation] = useState<keyof typeof operations>('addition');
  const [problem, setProblem] = useState<ArithmeticProblem | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  const loadProblem = async () => {
    try {
      const newProblem = await getArithmeticProblem(operation, language);
      setProblem(newProblem);
      setAnswer('');
      setFeedback(null);
    } catch (error) {
      console.error('Failed to load problem:', error);
    }
  };

  const checkAnswer = async () => {
    if (!problem) return;
    try {
      const result = await checkArithmeticAnswer(problem.id, Number(answer), userId);
      setFeedback({
        correct: result.correct,
        message: result.correct 
          ? language === 'en' ? 'Correct! Great job!' : '答对了！做得好！'
          : language === 'en' ? `Try again! The answer is ${problem.answer}` : `再试一次！正确答案是 ${problem.answer}`
      });
      if (result.correct) {
        onScoreUpdate();
      }
    } catch (error) {
      console.error('Failed to check answer:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {language === 'en' ? 'Arithmetic Practice' : '算术练习'}
        </CardTitle>
        <div className="flex justify-center gap-2">
          {Object.entries(operations).map(([key, { icon: Icon, text }]) => (
            <Button
              key={key}
              variant={operation === key ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setOperation(key as keyof typeof operations);
                loadProblem();
              }}
            >
              <Icon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{text[language]}</span>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {!problem ? (
          <Button 
            onClick={loadProblem}
            className="w-full"
          >
            {language === 'en' ? 'Start Practice' : '开始练习'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="text-2xl text-center font-bold">
              {problem.num1} {operation === 'addition' ? '+' : 
                           operation === 'subtraction' ? '-' : 
                           operation === 'multiplication' ? '×' : '÷'} {problem.num2} = ?
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
              <div className={`text-center font-medium ${feedback.correct ? 'text-green-600' : 'text-red-600'}`}>
                {feedback.message}
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={loadProblem}
              className="w-full"
            >
              {language === 'en' ? 'Next Problem' : '下一题'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
