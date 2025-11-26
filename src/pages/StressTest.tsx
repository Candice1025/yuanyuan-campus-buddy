import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StressTest = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    checkAuth();
  }, []);

  const questions = [
    { id: 0, question: "你是否感到学习压力很大？" },
    { id: 1, question: "你是否经常感到疲惫不堪？" },
    { id: 2, question: "你是否难以集中注意力？" },
    { id: 3, question: "你是否经常担心考试成绩？" },
    { id: 4, question: "你是否感到时间总是不够用？" },
    { id: 5, question: "你是否经常失眠或睡眠质量差？" },
    { id: 6, question: "你是否感到情绪波动大？" },
    { id: 7, question: "你是否觉得难以放松下来？" },
    { id: 8, question: "你是否经常头痛或身体不适？" },
    { id: 9, question: "你是否觉得生活失去乐趣？" },
    { id: 10, question: "你是否感到人际关系压力？" },
    { id: 11, question: "你是否经常拖延任务？" },
    { id: 12, question: "你是否感到对未来担忧？" },
    { id: 13, question: "你是否食欲不振或暴饮暴食？" },
    { id: 14, question: "你是否觉得难以应对日常任务？" },
    { id: 15, question: "你是否经常感到烦躁易怒？" },
    { id: 16, question: "你是否觉得自己能力不足？" },
    { id: 17, question: "你是否经常感到孤独？" },
    { id: 18, question: "你是否觉得生活节奏太快？" },
    { id: 19, question: "你是否有逃避现实的想法？" }
  ];

  const options = [
    { value: 0, label: "从不" },
    { value: 1, label: "偶尔" },
    { value: 2, label: "经常" },
    { value: 3, label: "总是" }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      if (userId) {
        const result = getResult();
        try {
          await supabase.from("test_results").insert({
            user_id: userId,
            test_type: "stress",
            test_name: "压力值测试",
            result: result.level
          });
        } catch (error) {
          console.error("Error saving test result:", error);
          toast.error("保存测试结果失败");
        }
      }
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getResult = () => {
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const maxScore = questions.length * 3;
    const percentage = (totalScore / maxScore) * 100;

    let level = "";
    let desc = "";
    let color = "";
    let suggestions: string[] = [];

    if (percentage < 25) {
      level = "压力较小";
      desc = "你的压力水平很低，生活状态良好";
      color = "bg-success";
      suggestions = [
        "🌟 保持当前的生活节奏",
        "💪 继续保持良好习惯",
        "😊 培养更多兴趣爱好",
        "🤝 帮助他人缓解压力"
      ];
    } else if (percentage < 50) {
      level = "轻度压力";
      desc = "你有一定压力，但整体可控";
      color = "bg-accent";
      suggestions = [
        "🧘‍♀️ 学习放松技巧",
        "📅 合理安排时间",
        "🏃‍♂️ 保持规律运动",
        "😴 保证充足睡眠",
        "🗣️ 适当倾诉交流"
      ];
    } else if (percentage < 75) {
      level = "中度压力";
      desc = "你的压力较大，需要重视和调整";
      color = "bg-primary";
      suggestions = [
        "⏸️ 适当减少任务量",
        "🎯 设定优先级，分步完成",
        "🧘 练习冥想和深呼吸",
        "👥 寻求朋友或家人支持",
        "💡 考虑咨询心理老师"
      ];
    } else {
      level = "高度压力";
      desc = "你的压力水平很高，强烈建议寻求帮助";
      color = "bg-destructive";
      suggestions = [
        "🚨 建议立即咨询心理老师",
        "📞 心理援助热线：12355",
        "⏰ 调整作息，优先休息",
        "🛑 暂停非必要活动",
        "👨‍⚕️ 必要时寻求专业治疗"
      ];
    }

    return { level, desc, color, totalScore, maxScore, percentage: Math.round(percentage), suggestions };
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
            <h2 className="text-4xl font-bold mb-3">{result.level}</h2>
            <p className="text-xl opacity-90 mb-4">{result.desc}</p>
            <div className="text-lg">
              压力指数：{result.percentage}%
            </div>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up">
            <h3 className="text-xl font-semibold text-foreground mb-4">得分详情</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">总分</span>
                <span className="text-foreground font-medium">{result.totalScore} / {result.maxScore}</span>
              </div>
              <Progress value={result.percentage} className="h-2" />
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>• 0-25%: 压力较小</div>
                <div>• 25-50%: 轻度压力</div>
                <div>• 50-75%: 中度压力</div>
                <div>• 75-100%: 高度压力</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4">缓解建议</h3>
            <div className="space-y-3 text-muted-foreground">
              {result.suggestions.map((suggestion, index) => (
                <p key={index}>{suggestion}</p>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4">💡 压力管理小贴士</h3>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>• 学会说"不"，避免过度承诺</p>
              <p>• 培养一项放松的爱好</p>
              <p>• 保持规律的作息和运动</p>
              <p>• 学会接纳不完美的自己</p>
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
              <h1 className="text-xl font-bold text-foreground">压力值测试</h1>
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
            value={answers[currentQuestion]?.toString()}
            onValueChange={(value) => handleAnswer(parseInt(value))}
            className="space-y-4"
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-primary hover:bg-primary/5 ${
                  answers[currentQuestion] === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => handleAnswer(option.value)}
              >
                <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                <Label
                  htmlFor={`option-${option.value}`}
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
            disabled={answers[currentQuestion] === undefined}
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

export default StressTest;
