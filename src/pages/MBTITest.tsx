import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MBTITest = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  // 简化的MBTI问题示例
  const questions = [
    {
      id: 0,
      question: "在社交场合中，你通常：",
      options: [
        { value: "E", label: "A. 感到精力充沛，享受与人交流" },
        { value: "I", label: "B. 感到疲惫，需要独处恢复能量" }
      ]
    },
    {
      id: 1,
      question: "当学习新知识时，你更倾向于：",
      options: [
        { value: "S", label: "A. 关注具体事实和细节" },
        { value: "N", label: "B. 关注整体概念和可能性" }
      ]
    },
    {
      id: 2,
      question: "做决定时，你更看重：",
      options: [
        { value: "T", label: "A. 逻辑分析和客观标准" },
        { value: "F", label: "B. 个人价值观和他人感受" }
      ]
    },
    {
      id: 3,
      question: "对待计划和时间，你更喜欢：",
      options: [
        { value: "J", label: "A. 有明确的计划和时间表" },
        { value: "P", label: "B. 保持灵活，随机应变" }
      ]
    },
    {
      id: 4,
      question: "在小组项目中，你更倾向于：",
      options: [
        { value: "E", label: "A. 主动分享想法，推动讨论" },
        { value: "I", label: "B. 先思考后发言，独立完成任务" }
      ]
    },
    {
      id: 5,
      question: "面对问题时，你首先会：",
      options: [
        { value: "S", label: "A. 回顾过去的经验和已知方法" },
        { value: "N", label: "B. 探索新的可能性和创新方案" }
      ]
    }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getResult = () => {
    // 简化的结果计算
    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    Object.values(answers).forEach((answer) => {
      counts[answer as keyof typeof counts]++;
    });

    const type = 
      (counts.E >= counts.I ? "E" : "I") +
      (counts.S >= counts.N ? "S" : "N") +
      (counts.T >= counts.F ? "T" : "F") +
      (counts.J >= counts.P ? "J" : "P");

    const results: Record<string, any> = {
      ENFP: { name: "竞选者", desc: "热情、有创造力，善于社交", color: "bg-accent" },
      INFP: { name: "调停者", desc: "理想主义、忠于价值观", color: "bg-primary" },
      ENTJ: { name: "指挥官", desc: "大胆、想象力丰富的领导者", color: "bg-success" },
      INTJ: { name: "建筑师", desc: "富有想象力的战略家", color: "bg-primary" }
    };

    return results[type] || results.INFP;
  };

  if (showResult) {
    const result = getResult();
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/tests")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">测试结果</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className={`p-8 ${result.color} border-0 shadow-float text-white text-center mb-8 animate-fade-in`}>
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">{result.name}</h2>
            <p className="text-xl opacity-90">{result.desc}</p>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up">
            <h3 className="text-xl font-semibold text-foreground mb-4">性格特点</h3>
            <div className="space-y-3 text-muted-foreground">
              <p>✨ 你是一个富有创造力的人，总能想出新颖的点子</p>
              <p>💭 你重视内心的价值观，对自己和他人都很真诚</p>
              <p>🌱 你善于发现他人的潜力，并鼓励他们成长</p>
              <p>📚 你喜欢学习新知识，对世界充满好奇</p>
            </div>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4">学习建议</h3>
            <div className="space-y-3 text-muted-foreground">
              <p>📝 尝试将抽象概念与具体例子结合</p>
              <p>🎯 设定明确的学习目标，保持专注</p>
              <p>👥 寻找学习伙伴，互相鼓励和支持</p>
              <p>⏰ 合理安排时间，避免拖延</p>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/tests")}
            >
              返回测试中心
            </Button>
            <Button
              className="flex-1 bg-gradient-primary"
              onClick={() => navigate("/")}
            >
              回到首页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/tests")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">MBTI人格测试</h1>
              <p className="text-sm text-muted-foreground">
                问题 {currentQuestion + 1} / {questions.length}
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8 shadow-card mb-8 animate-fade-in">
          <h2 className="text-2xl font-semibold text-foreground mb-8">
            {currentQ.question}
          </h2>
          
          <RadioGroup
            value={answers[currentQuestion]}
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            {currentQ.options.map((option) => (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-primary hover:bg-primary/5 ${
                  answers[currentQuestion] === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => handleAnswer(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label
                  htmlFor={option.value}
                  className="flex-1 cursor-pointer text-base"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一题
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion]}
            className="flex-1 bg-gradient-primary"
          >
            {currentQuestion === questions.length - 1 ? "查看结果" : "下一题"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MBTITest;
