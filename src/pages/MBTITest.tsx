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

const MBTITest = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
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

  // MBTI完整测试问题
  const questions = [
    // E/I 维度（外向/内向）
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
      question: "在小组项目中，你更倾向于：",
      options: [
        { value: "E", label: "A. 主动分享想法，推动讨论" },
        { value: "I", label: "B. 先思考后发言，独立完成任务" }
      ]
    },
    {
      id: 2,
      question: "周末休息时，你更喜欢：",
      options: [
        { value: "E", label: "A. 约朋友出去玩，参加聚会活动" },
        { value: "I", label: "B. 独自待在家里，做自己喜欢的事" }
      ]
    },
    {
      id: 3,
      question: "认识新朋友时，你通常：",
      options: [
        { value: "E", label: "A. 很快就能打开话题，主动交流" },
        { value: "I", label: "B. 比较慢热，需要时间熟悉" }
      ]
    },
    // S/N 维度（实感/直觉）
    {
      id: 4,
      question: "当学习新知识时，你更倾向于：",
      options: [
        { value: "S", label: "A. 关注具体事实和细节" },
        { value: "N", label: "B. 关注整体概念和可能性" }
      ]
    },
    {
      id: 5,
      question: "面对问题时，你首先会：",
      options: [
        { value: "S", label: "A. 回顾过去的经验和已知方法" },
        { value: "N", label: "B. 探索新的可能性和创新方案" }
      ]
    },
    {
      id: 6,
      question: "做作业或任务时，你更喜欢：",
      options: [
        { value: "S", label: "A. 按部就班，遵循既定步骤" },
        { value: "N", label: "B. 发挥想象，尝试新的方法" }
      ]
    },
    {
      id: 7,
      question: "老师讲课时，你更关注：",
      options: [
        { value: "S", label: "A. 具体的例子和实际应用" },
        { value: "N", label: "B. 背后的原理和深层含义" }
      ]
    },
    // T/F 维度（思考/情感）
    {
      id: 8,
      question: "做决定时，你更看重：",
      options: [
        { value: "T", label: "A. 逻辑分析和客观标准" },
        { value: "F", label: "B. 个人价值观和他人感受" }
      ]
    },
    {
      id: 9,
      question: "同学向你求助时，你会：",
      options: [
        { value: "T", label: "A. 直接指出问题并给出解决方案" },
        { value: "F", label: "B. 先安慰对方情绪，再一起想办法" }
      ]
    },
    {
      id: 10,
      question: "评价一件事时，你更注重：",
      options: [
        { value: "T", label: "A. 是否符合逻辑和效率" },
        { value: "F", label: "B. 是否考虑了大家的感受" }
      ]
    },
    {
      id: 11,
      question: "别人批评你时，你会：",
      options: [
        { value: "T", label: "A. 理性分析批评是否合理" },
        { value: "F", label: "B. 首先关注对方的态度和情绪" }
      ]
    },
    // J/P 维度（判断/知觉）
    {
      id: 12,
      question: "对待计划和时间，你更喜欢：",
      options: [
        { value: "J", label: "A. 有明确的计划和时间表" },
        { value: "P", label: "B. 保持灵活，随机应变" }
      ]
    },
    {
      id: 13,
      question: "完成作业时，你通常：",
      options: [
        { value: "J", label: "A. 提前完成，不喜欢拖到最后" },
        { value: "P", label: "B. 临近截止日期才有动力完成" }
      ]
    },
    {
      id: 14,
      question: "整理书包或房间时，你：",
      options: [
        { value: "J", label: "A. 喜欢保持整洁有序" },
        { value: "P", label: "B. 觉得找得到就行，不必太整齐" }
      ]
    },
    {
      id: 15,
      question: "面对突发变化时，你：",
      options: [
        { value: "J", label: "A. 感到不安，希望按原计划进行" },
        { value: "P", label: "B. 觉得无所谓，反而有新鲜感" }
      ]
    }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Save test result before showing results
      if (userId) {
        const result = getResult();
        try {
          await supabase.from("test_results").insert({
            user_id: userId,
            test_type: "mbti",
            test_name: "MBTI人格测试",
            result: `${result.type} - ${result.name}`
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
    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    Object.values(answers).forEach((answer) => {
      counts[answer as keyof typeof counts]++;
    });

    const type = 
      (counts.E > counts.I ? "E" : "I") +
      (counts.S > counts.N ? "S" : "N") +
      (counts.T > counts.F ? "T" : "F") +
      (counts.J > counts.P ? "J" : "P");

    const results: Record<string, any> = {
      ISTJ: { name: "物流师", desc: "实际、有责任心的组织者", color: "bg-primary", traits: ["可靠", "有条理", "注重细节", "务实"] },
      ISFJ: { name: "守卫者", desc: "温暖、体贴的保护者", color: "bg-primary", traits: ["忠诚", "有耐心", "细心", "支持他人"] },
      INFJ: { name: "提倡者", desc: "理想主义的倡导者", color: "bg-primary", traits: ["有洞察力", "理想主义", "富有同情心", "有创造力"] },
      INTJ: { name: "建筑师", desc: "富有想象力的战略家", color: "bg-primary", traits: ["独立", "战略性思维", "追求知识", "高标准"] },
      ISTP: { name: "鉴赏家", desc: "大胆灵活的实践者", color: "bg-success", traits: ["冷静", "善于分析", "动手能力强", "适应力强"] },
      ISFP: { name: "探险家", desc: "灵活友善的艺术家", color: "bg-success", traits: ["温和", "敏感", "艺术天赋", "活在当下"] },
      INFP: { name: "调停者", desc: "诗意般的理想主义者", color: "bg-primary", traits: ["理想主义", "忠于价值观", "富有创造力", "善解人意"] },
      INTP: { name: "逻辑学家", desc: "创新的理论家", color: "bg-primary", traits: ["好奇", "善于分析", "客观", "创新思维"] },
      ESTP: { name: "企业家", desc: "精明大胆的实干家", color: "bg-accent", traits: ["大胆", "行动派", "观察敏锐", "灵活应变"] },
      ESFP: { name: "表演者", desc: "活力四射的娱乐者", color: "bg-accent", traits: ["热情", "友善", "自发性", "享受生活"] },
      ENFP: { name: "竞选者", desc: "热情自由的激励者", color: "bg-accent", traits: ["热情", "有创造力", "善于社交", "乐观"] },
      ENTP: { name: "辩论家", desc: "聪明好辩的思想家", color: "bg-accent", traits: ["聪明", "好奇", "善于辩论", "创新"] },
      ESTJ: { name: "总经理", desc: "出色的管理者", color: "bg-accent", traits: ["高效", "有组织力", "负责任", "务实"] },
      ESFJ: { name: "执政官", desc: "热心助人的主人", color: "bg-accent", traits: ["友善", "有责任心", "善于合作", "关心他人"] },
      ENFJ: { name: "主人公", desc: "有魅力的领导者", color: "bg-accent", traits: ["有魅力", "善于鼓励", "有责任心", "善解人意"] },
      ENTJ: { name: "指挥官", desc: "大胆果断的领导者", color: "bg-accent", traits: ["果断", "高效", "战略眼光", "天生领导"] }
    };

    return { ...results[type], type };
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
            <h2 className="text-4xl font-bold mb-3">{result.type}</h2>
            <h3 className="text-2xl font-semibold mb-2">{result.name}</h3>
            <p className="text-xl opacity-90">{result.desc}</p>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up">
            <h3 className="text-xl font-semibold text-foreground mb-4">性格特点</h3>
            <div className="grid grid-cols-2 gap-3">
              {result.traits.map((trait: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{trait}</span>
                </div>
              ))}
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
