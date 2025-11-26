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

const AnxietyTest = () => {
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

  // 焦虑自评量表(SAS)问题
  const questions = [
    { id: 0, question: "我觉得比平时容易紧张和着急" },
    { id: 1, question: "我无缘无故地感到害怕" },
    { id: 2, question: "我容易心里烦乱或感到惊恐" },
    { id: 3, question: "我觉得我可能将要发疯" },
    { id: 4, question: "我觉得一切都很好" },
    { id: 5, question: "我手脚发抖打颤" },
    { id: 6, question: "我因为头痛、头颈痛和背痛而苦恼" },
    { id: 7, question: "我感觉容易衰弱和疲乏" },
    { id: 8, question: "我觉得心平气和，并且容易安静坐着" },
    { id: 9, question: "我觉得心跳得很快" },
    { id: 10, question: "我因为一阵阵头晕而苦恼" },
    { id: 11, question: "我有晕倒发作，或觉得要晕倒似的" },
    { id: 12, question: "我吸气呼气都感到很容易" },
    { id: 13, question: "我的手脚麻木和刺痛" },
    { id: 14, question: "我因为胃痛和消化不良而苦恼" },
    { id: 15, question: "我常常要小便" },
    { id: 16, question: "我的手脚常常是干燥温暖的" },
    { id: 17, question: "我脸红发热" },
    { id: 18, question: "我容易入睡并且一夜睡得很好" },
    { id: 19, question: "我做恶梦" }
  ];

  const options = [
    { value: 1, label: "没有或很少时间" },
    { value: 2, label: "小部分时间" },
    { value: 3, label: "相当多时间" },
    { value: 4, label: "绝大部分或全部时间" }
  ];

  // 反向计分题目
  const reverseScoreQuestions = [4, 8, 12, 16, 18];

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
            test_type: "anxiety",
            test_name: "焦虑自测量表",
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
    let rawScore = 0;
    Object.entries(answers).forEach(([questionIndex, answer]) => {
      const index = parseInt(questionIndex);
      if (reverseScoreQuestions.includes(index)) {
        rawScore += (5 - answer);
      } else {
        rawScore += answer;
      }
    });

    const standardScore = Math.round(rawScore * 1.25);

    let level = "";
    let desc = "";
    let color = "";
    let suggestions: string[] = [];

    if (standardScore < 50) {
      level = "正常";
      desc = "你的焦虑水平在正常范围内";
      color = "bg-success";
      suggestions = [
        "🌟 保持良好的心态",
        "🧘‍♀️ 适当练习放松技巧",
        "💪 保持规律运动习惯",
        "😊 培养兴趣爱好"
      ];
    } else if (standardScore < 60) {
      level = "轻度焦虑";
      desc = "你可能存在轻度焦虑，需要适当调节";
      color = "bg-accent";
      suggestions = [
        "🧘 学习深呼吸和放松训练",
        "🏃‍♂️ 增加有氧运动",
        "😴 保证充足睡眠",
        "🗣️ 与朋友倾诉分享",
        "📝 尝试写日记释放情绪"
      ];
    } else if (standardScore < 70) {
      level = "中度焦虑";
      desc = "你的焦虑程度较高，建议寻求帮助";
      color = "bg-primary";
      suggestions = [
        "🏥 建议咨询心理老师",
        "🧘‍♀️ 学习系统的放松技巧",
        "⏰ 建立规律作息",
        "☕ 减少咖啡因摄入",
        "📱 适当减少信息刺激"
      ];
    } else {
      level = "重度焦虑";
      desc = "你的焦虑程度很高，强烈建议立即寻求专业帮助";
      color = "bg-destructive";
      suggestions = [
        "🚨 请立即联系心理咨询师",
        "📞 心理援助热线：12355",
        "👨‍⚕️ 可能需要专业治疗",
        "👪 告知家人获得支持",
        "🛡️ 避免独自承受压力"
      ];
    }

    return { level, desc, color, standardScore, rawScore, suggestions };
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
              标准分：{result.standardScore} 分
            </div>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up">
            <h3 className="text-xl font-semibold text-foreground mb-4">评分说明</h3>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>• 标准分 &lt; 50：正常范围</p>
              <p>• 标准分 50-59：轻度焦虑</p>
              <p>• 标准分 60-69：中度焦虑</p>
              <p>• 标准分 ≥ 70：重度焦虑</p>
            </div>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4">建议</h3>
            <div className="space-y-3 text-muted-foreground">
              {result.suggestions.map((suggestion, index) => (
                <p key={index}>{suggestion}</p>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4">⚠️ 重要提示</h3>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>• 本测试仅供参考，不能作为诊断依据</p>
              <p>• 如果焦虑情绪持续影响生活，请寻求专业帮助</p>
              <p>• 适度的焦虑是正常的，关键是学会调节</p>
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
              <h1 className="text-xl font-bold text-foreground">焦虑自测量表</h1>
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

export default AnxietyTest;
