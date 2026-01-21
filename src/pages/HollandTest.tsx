import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Home, RotateCcw, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PaymentConfirmation from "@/components/PaymentConfirmation";

export default function HollandTest() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, []);

  const types = {
    R: { 
      name: "实际型 (Realistic)", 
      desc: "喜欢动手操作，偏好技术性和机械性工作",
      traits: "务实、稳重、坦诚、谦逊",
      careers: "工程师、技工、农业工作者、飞行员、运动员"
    },
    I: { 
      name: "研究型 (Investigative)", 
      desc: "喜欢思考和分析，偏好科学和研究工作",
      traits: "理性、精确、好奇、独立",
      careers: "科学家、医生、程序员、研究员、分析师"
    },
    A: { 
      name: "艺术型 (Artistic)", 
      desc: "富有创造力，偏好艺术和创意工作",
      traits: "想象力丰富、情感丰富、独立、创新",
      careers: "设计师、艺术家、作家、音乐家、演员"
    },
    S: { 
      name: "社会型 (Social)", 
      desc: "善于与人交往，偏好帮助和教育他人的工作",
      traits: "友善、热情、善解人意、有责任感",
      careers: "教师、咨询师、社工、护士、人力资源"
    },
    E: { 
      name: "企业型 (Enterprising)", 
      desc: "有领导力和说服力，偏好管理和商业工作",
      traits: "自信、进取、外向、有野心",
      careers: "销售经理、企业家、律师、政治家、市场营销"
    },
    C: { 
      name: "常规型 (Conventional)", 
      desc: "喜欢有序和规范，偏好数据和细节工作",
      traits: "细心、有条理、高效、保守",
      careers: "会计师、审计师、行政助理、图书管理员、数据分析"
    },
  };

  // 30题，每题4选项
  const questions = [
    { id: 1, text: "你喜欢使用工具和机器工作吗？", options: [
      { value: "R:3", label: "非常喜欢，动手操作让我很有成就感" },
      { value: "R:2", label: "比较喜欢，偶尔会动手修理东西" },
      { value: "R:1", label: "一般，不太主动但会尝试" },
      { value: "R:0", label: "不太喜欢，更愿意做其他事" }
    ]},
    { id: 2, text: "你喜欢进行科学实验和研究吗？", options: [
      { value: "I:3", label: "非常喜欢，探索未知让我兴奋" },
      { value: "I:2", label: "比较喜欢，会主动了解新知识" },
      { value: "I:1", label: "一般，偶尔会感兴趣" },
      { value: "I:0", label: "不太喜欢，觉得枯燥" }
    ]},
    { id: 3, text: "你喜欢绘画、音乐或写作等创作活动吗？", options: [
      { value: "A:3", label: "非常喜欢，创作是我的热情所在" },
      { value: "A:2", label: "比较喜欢，经常进行艺术创作" },
      { value: "A:1", label: "一般，偶尔会参与" },
      { value: "A:0", label: "不太喜欢，没有艺术天赋" }
    ]},
    { id: 4, text: "你喜欢帮助和教导他人吗？", options: [
      { value: "S:3", label: "非常喜欢，帮助他人让我快乐" },
      { value: "S:2", label: "比较喜欢，乐于分享知识" },
      { value: "S:1", label: "一般，有时候会帮助" },
      { value: "S:0", label: "不太喜欢，更愿意独处" }
    ]},
    { id: 5, text: "你喜欢领导团队和组织活动吗？", options: [
      { value: "E:3", label: "非常喜欢，天生就是领导者" },
      { value: "E:2", label: "比较喜欢，愿意承担责任" },
      { value: "E:1", label: "一般，有时候会主动" },
      { value: "E:0", label: "不太喜欢，更愿意做跟随者" }
    ]},
    { id: 6, text: "你喜欢整理文件和数据工作吗？", options: [
      { value: "C:3", label: "非常喜欢，有序让我感到安心" },
      { value: "C:2", label: "比较喜欢，喜欢条理清晰" },
      { value: "C:1", label: "一般，必要时会做" },
      { value: "C:0", label: "不太喜欢，觉得单调" }
    ]},
    { id: 7, text: "你喜欢户外工作和体力活动吗？", options: [
      { value: "R:3", label: "非常喜欢，户外活动让我充满活力" },
      { value: "R:2", label: "比较喜欢，经常参与户外运动" },
      { value: "R:1", label: "一般，偶尔会参与" },
      { value: "R:0", label: "不太喜欢，更愿意待在室内" }
    ]},
    { id: 8, text: "你喜欢阅读科学文献和专业书籍吗？", options: [
      { value: "I:3", label: "非常喜欢，知识让我充实" },
      { value: "I:2", label: "比较喜欢，经常阅读" },
      { value: "I:1", label: "一般，有需要时会看" },
      { value: "I:0", label: "不太喜欢，更愿意看轻松读物" }
    ]},
    { id: 9, text: "你喜欢参加艺术展览和文化活动吗？", options: [
      { value: "A:3", label: "非常喜欢，艺术是我的生活" },
      { value: "A:2", label: "比较喜欢，经常参加" },
      { value: "A:1", label: "一般，偶尔会去" },
      { value: "A:0", label: "不太喜欢，没什么兴趣" }
    ]},
    { id: 10, text: "你喜欢参与志愿者和社区服务吗？", options: [
      { value: "S:3", label: "非常喜欢，乐于奉献" },
      { value: "S:2", label: "比较喜欢，经常参与" },
      { value: "S:1", label: "一般，有时间会参加" },
      { value: "S:0", label: "不太喜欢，更注重个人事务" }
    ]},
    { id: 11, text: "你喜欢商业谈判和说服他人吗？", options: [
      { value: "E:3", label: "非常喜欢，很擅长说服人" },
      { value: "E:2", label: "比较喜欢，喜欢挑战" },
      { value: "E:1", label: "一般，有时候会尝试" },
      { value: "E:0", label: "不太喜欢，不擅长此类活动" }
    ]},
    { id: 12, text: "你喜欢遵循既定流程和标准吗？", options: [
      { value: "C:3", label: "非常喜欢，规则给我安全感" },
      { value: "C:2", label: "比较喜欢，喜欢有章可循" },
      { value: "C:1", label: "一般，视情况而定" },
      { value: "C:0", label: "不太喜欢，更愿意灵活应对" }
    ]},
    { id: 13, text: "你喜欢修理和组装东西吗？", options: [
      { value: "R:3", label: "非常喜欢，有成就感" },
      { value: "R:2", label: "比较喜欢，愿意尝试" },
      { value: "R:1", label: "一般，不太主动" },
      { value: "R:0", label: "不太喜欢，宁愿找人帮忙" }
    ]},
    { id: 14, text: "你喜欢解决复杂的理论问题吗？", options: [
      { value: "I:3", label: "非常喜欢，越复杂越有趣" },
      { value: "I:2", label: "比较喜欢，喜欢挑战" },
      { value: "I:1", label: "一般，有时候会尝试" },
      { value: "I:0", label: "不太喜欢，觉得费脑" }
    ]},
    { id: 15, text: "你喜欢自由表达和创新吗？", options: [
      { value: "A:3", label: "非常喜欢，创新是我的追求" },
      { value: "A:2", label: "比较喜欢，经常有新想法" },
      { value: "A:1", label: "一般，偶尔会有创意" },
      { value: "A:0", label: "不太喜欢，更愿意遵循现有方式" }
    ]},
    { id: 16, text: "你关心他人的情感和需求吗？", options: [
      { value: "S:3", label: "非常关心，总是注意到他人感受" },
      { value: "S:2", label: "比较关心，会主动询问" },
      { value: "S:1", label: "一般，有时候会注意" },
      { value: "S:0", label: "不太关心，更注重自己" }
    ]},
    { id: 17, text: "你喜欢制定计划和目标吗？", options: [
      { value: "E:3", label: "非常喜欢，目标明确让我前进" },
      { value: "E:2", label: "比较喜欢，喜欢有方向" },
      { value: "E:1", label: "一般，有时候会制定" },
      { value: "E:0", label: "不太喜欢，更愿意随遇而安" }
    ]},
    { id: 18, text: "你喜欢精确和细致的工作吗？", options: [
      { value: "C:3", label: "非常喜欢，追求完美" },
      { value: "C:2", label: "比较喜欢，注重细节" },
      { value: "C:1", label: "一般，视情况而定" },
      { value: "C:0", label: "不太喜欢，觉得太繁琐" }
    ]},
    { id: 19, text: "你喜欢实践多于理论吗？", options: [
      { value: "R:3", label: "非常同意，实践出真知" },
      { value: "R:2", label: "比较同意，喜欢动手" },
      { value: "R:1", label: "一般，两者兼顾" },
      { value: "R:0", label: "不太同意，更喜欢理论" }
    ]},
    { id: 20, text: "你喜欢探索未知和新发现吗？", options: [
      { value: "I:3", label: "非常喜欢，好奇心驱使我" },
      { value: "I:2", label: "比较喜欢，经常探索" },
      { value: "I:1", label: "一般，偶尔会尝试" },
      { value: "I:0", label: "不太喜欢，喜欢熟悉的事物" }
    ]},
    { id: 21, text: "你喜欢美和艺术的事物吗？", options: [
      { value: "A:3", label: "非常喜欢，美让我陶醉" },
      { value: "A:2", label: "比较喜欢，欣赏美的事物" },
      { value: "A:1", label: "一般，偶尔会注意" },
      { value: "A:0", label: "不太喜欢，更注重实用" }
    ]},
    { id: 22, text: "你喜欢团队合作和人际互动吗？", options: [
      { value: "S:3", label: "非常喜欢，团队力量大" },
      { value: "S:2", label: "比较喜欢，喜欢交流" },
      { value: "S:1", label: "一般，视情况而定" },
      { value: "S:0", label: "不太喜欢，更愿意独立工作" }
    ]},
    { id: 23, text: "你喜欢竞争和挑战吗？", options: [
      { value: "E:3", label: "非常喜欢，竞争激励我" },
      { value: "E:2", label: "比较喜欢，享受挑战" },
      { value: "E:1", label: "一般，有时候会参与" },
      { value: "E:0", label: "不太喜欢，更愿意安稳" }
    ]},
    { id: 24, text: "你喜欢按部就班的工作方式吗？", options: [
      { value: "C:3", label: "非常喜欢，有序让我高效" },
      { value: "C:2", label: "比较喜欢，喜欢稳定" },
      { value: "C:1", label: "一般，视情况而定" },
      { value: "C:0", label: "不太喜欢，更愿意灵活" }
    ]},
    { id: 25, text: "你喜欢操作机械设备吗？", options: [
      { value: "R:3", label: "非常喜欢，机械很有趣" },
      { value: "R:2", label: "比较喜欢，愿意学习" },
      { value: "R:1", label: "一般，必要时会操作" },
      { value: "R:0", label: "不太喜欢，不擅长" }
    ]},
    { id: 26, text: "你喜欢分析数据和信息吗？", options: [
      { value: "I:3", label: "非常喜欢，数据说话" },
      { value: "I:2", label: "比较喜欢，喜欢分析" },
      { value: "I:1", label: "一般，有需要时会做" },
      { value: "I:0", label: "不太喜欢，觉得枯燥" }
    ]},
    { id: 27, text: "你喜欢用独特方式表达自己吗？", options: [
      { value: "A:3", label: "非常喜欢，独特是我的风格" },
      { value: "A:2", label: "比较喜欢，经常有创意表达" },
      { value: "A:1", label: "一般，偶尔会尝试" },
      { value: "A:0", label: "不太喜欢，更愿意随大流" }
    ]},
    { id: 28, text: "你喜欢倾听和安慰他人吗？", options: [
      { value: "S:3", label: "非常喜欢，我是好的倾听者" },
      { value: "S:2", label: "比较喜欢，愿意帮助" },
      { value: "S:1", label: "一般，有时候会做" },
      { value: "S:0", label: "不太喜欢，不擅长" }
    ]},
    { id: 29, text: "你喜欢推销产品或想法吗？", options: [
      { value: "E:3", label: "非常喜欢，很有说服力" },
      { value: "E:2", label: "比较喜欢，愿意尝试" },
      { value: "E:1", label: "一般，有时候会做" },
      { value: "E:0", label: "不太喜欢，不擅长推销" }
    ]},
    { id: 30, text: "你喜欢记录和归档信息吗？", options: [
      { value: "C:3", label: "非常喜欢，整理让我满足" },
      { value: "C:2", label: "比较喜欢，喜欢有序" },
      { value: "C:1", label: "一般，必要时会做" },
      { value: "C:0", label: "不太喜欢，觉得繁琐" }
    ]},
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 先显示付款页面
      setShowPayment(true);
    }
  };

  const handlePaymentConfirm = async () => {
    const result = getResult();
    
    if (userId) {
      try {
        await supabase.from("test_results").insert({
          user_id: userId,
          test_type: "career",
          test_name: "霍兰德职业兴趣",
          result: JSON.stringify(result),
        });
        toast.success("测试结果已保存");
      } catch (error) {
        console.error("保存测试结果失败:", error);
      }
    }
    
    setShowPayment(false);
    setShowResult(true);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getResult = () => {
    const typeScores: { [key: string]: number } = {
      R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
    };
    
    answers.forEach((answer) => {
      const [type, scoreStr] = answer.split(":");
      const score = Number(scoreStr);
      typeScores[type] += score;
    });

    const sortedTypes = Object.entries(typeScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const hollandCode = sortedTypes.map(([type]) => type).join("");

    return {
      code: hollandCode,
      primary: { type: sortedTypes[0][0], ...types[sortedTypes[0][0] as keyof typeof types], score: sortedTypes[0][1] },
      secondary: { type: sortedTypes[1][0], ...types[sortedTypes[1][0] as keyof typeof types], score: sortedTypes[1][1] },
      tertiary: { type: sortedTypes[2][0], ...types[sortedTypes[2][0] as keyof typeof types], score: sortedTypes[2][1] },
      allScores: typeScores,
    };
  };

  if (showPayment) {
    return (
      <PaymentConfirmation 
        testName="霍兰德职业兴趣测试" 
        onConfirm={handlePaymentConfirm} 
      />
    );
  }

  if (showResult) {
    const result = getResult();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/tests")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">测试结果</h1>
          </div>

          <Card className="p-6 space-y-6">
            <div className="text-center space-y-4">
              <Briefcase className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-3xl font-bold text-primary">你的霍兰德代码</h2>
              <div className="text-5xl font-bold tracking-wider">{result.code}</div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-primary">{result.primary.type}</span>
                  <h3 className="font-bold text-lg">{result.primary.name}</h3>
                </div>
                <p className="text-muted-foreground mb-2">{result.primary.desc}</p>
                <p className="text-sm mb-2"><span className="font-semibold">特质：</span>{result.primary.traits}</p>
                <p className="text-sm"><span className="font-semibold">适合职业：</span>{result.primary.careers}</p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-primary">{result.secondary.type}</span>
                  <h3 className="font-semibold">{result.secondary.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{result.secondary.desc}</p>
                <p className="text-sm"><span className="font-semibold">适合职业：</span>{result.secondary.careers}</p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-primary">{result.tertiary.type}</span>
                  <h3 className="font-semibold">{result.tertiary.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{result.tertiary.desc}</p>
                <p className="text-sm"><span className="font-semibold">适合职业：</span>{result.tertiary.careers}</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">六维度得分</h3>
                <div className="space-y-2">
                  {Object.entries(result.allScores).map(([type, score]) => (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-sm font-bold min-w-8">{type}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(score / 15) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-8">{score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 霍兰德职业兴趣理论将人的职业兴趣分为6种类型（RIASEC），通过了解你的兴趣类型组合，可以帮助你找到更适合的职业方向和发展路径。
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => navigate("/tests")} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                返回测试中心
              </Button>
              <Button onClick={() => navigate("/")} className="flex-1">
                <Home className="mr-2 h-4 w-4" />
                返回首页
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/tests")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">霍兰德职业兴趣测试</h2>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">{questions[currentQuestion].text}</h3>
            
            <RadioGroup 
              value={answers[currentQuestion]} 
              onValueChange={handleAnswer}
            >
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                    <RadioGroupItem value={option.value} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              className="flex-1"
            >
              上一题
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion]}
              className="flex-1"
            >
              {currentQuestion === questions.length - 1 ? "查看结果" : "下一题"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
