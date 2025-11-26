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

const DepressionTest = () => {
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

  // 抑郁自评量表(SDS)问题
  const questions = [
    { id: 0, question: "我感到情绪沮丧，郁闷" },
    { id: 1, question: "我感到早晨心情最好" },
    { id: 2, question: "我要哭或想哭" },
    { id: 3, question: "我夜间睡眠不好" },
    { id: 4, question: "我吃饭像平时一样多" },
    { id: 5, question: "我的性功能正常" },
    { id: 6, question: "我感到体重减轻" },
    { id: 7, question: "我为便秘烦恼" },
    { id: 8, question: "我的心跳比平时快" },
    { id: 9, question: "我无故感到疲劳" },
    { id: 10, question: "我的头脑像往常一样清楚" },
    { id: 11, question: "我做事情像平时一样不感到困难" },
    { id: 12, question: "我坐卧不安，难以保持平静" },
    { id: 13, question: "我对未来感到有希望" },
    { id: 14, question: "我比平时更容易激怒" },
    { id: 15, question: "我觉得决定什么事很容易" },
    { id: 16, question: "我感到自己是有用的和不可缺少的人" },
    { id: 17, question: "我的生活很有意义" },
    { id: 18, question: "假若我死了别人会过得更好" },
    { id: 19, question: "我仍旧喜爱自己平时喜爱的东西" }
  ];

  const options = [
    { value: 1, label: "没有或很少时间" },
    { value: 2, label: "小部分时间" },
    { value: 3, label: "相当多时间" },
    { value: 4, label: "绝大部分或全部时间" }
  ];

  // 反向计分题目 (序号从0开始，所以实际题号-1)
  const reverseScoreQuestions = [1, 4, 5, 10, 11, 13, 15, 16, 17, 19];

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
            test_type: "depression",
            test_name: "抑郁自评量表",
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
        // 反向计分
        rawScore += (5 - answer);
      } else {
        rawScore += answer;
      }
    });

    // SDS标准分 = 各题得分相加后 × 1.25，四舍五入取整数
    const standardScore = Math.round(rawScore * 1.25);

    let level = "";
    let desc = "";
    let color = "";
    let suggestions: string[] = [];

    if (standardScore < 53) {
      level = "正常";
      desc = "你的情绪状态良好，没有抑郁症状";
      color = "bg-success";
      suggestions = [
        "🌟 保持良好的生活习惯",
        "💪 继续进行规律运动",
        "😊 培养积极的兴趣爱好",
        "👨‍👩‍👧‍👦 维持良好的社交关系"
      ];
    } else if (standardScore < 63) {
      level = "轻度抑郁";
      desc = "你可能存在轻度抑郁倾向，需要关注";
      color = "bg-accent";
      suggestions = [
        "🗣️ 多与朋友家人倾诉交流",
        "🏃‍♂️ 增加户外活动和运动",
        "📝 记录每天的积极事件",
        "🎯 设定小目标并完成它们",
        "💡 如持续不适建议咨询心理老师"
      ];
    } else if (standardScore < 73) {
      level = "中度抑郁";
      desc = "你可能存在中度抑郁症状，建议寻求帮助";
      color = "bg-primary";
      suggestions = [
        "🏥 建议尽快咨询专业心理医生",
        "👥 不要独自承受，寻求支持",
        "⏰ 保持规律的作息时间",
        "🍎 注意均衡饮食",
        "❌ 避免重大决定和压力"
      ];
    } else {
      level = "重度抑郁";
      desc = "你可能存在重度抑郁症状，强烈建议立即寻求专业帮助";
      color = "bg-destructive";
      suggestions = [
        "🚨 请立即联系心理老师或医生",
        "📞 24小时心理援助热线：12355",
        "👨‍⚕️ 必要时需要专业治疗",
        "👪 告知家人或信任的人",
        "🛡️ 确保自身安全最重要"
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
              <p>• 标准分 &lt; 53：正常范围</p>
              <p>• 标准分 53-62：轻度抑郁</p>
              <p>• 标准分 63-72：中度抑郁</p>
              <p>• 标准分 ≥ 73：重度抑郁</p>
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
              <p>• 如果您感到持续的情绪低落或有自我伤害的想法，请立即寻求专业帮助</p>
              <p>• 校内心理咨询室可以提供免费的专业支持</p>
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
              <h1 className="text-xl font-bold text-foreground">抑郁自评量表</h1>
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

export default DepressionTest;
