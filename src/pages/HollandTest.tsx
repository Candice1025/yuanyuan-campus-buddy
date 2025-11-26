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

export default function HollandTest() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
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

  const questions = [
    { id: 1, text: "你喜欢使用工具和机器工作吗？", type: "R" },
    { id: 2, text: "你喜欢进行科学实验和研究吗？", type: "I" },
    { id: 3, text: "你喜欢绘画、音乐或写作等创作活动吗？", type: "A" },
    { id: 4, text: "你喜欢帮助和教导他人吗？", type: "S" },
    { id: 5, text: "你喜欢领导团队和组织活动吗？", type: "E" },
    { id: 6, text: "你喜欢整理文件和数据工作吗？", type: "C" },
    { id: 7, text: "你喜欢户外工作和体力活动吗？", type: "R" },
    { id: 8, text: "你喜欢阅读科学文献和专业书籍吗？", type: "I" },
    { id: 9, text: "你喜欢参加艺术展览和文化活动吗？", type: "A" },
    { id: 10, text: "你喜欢参与志愿者和社区服务吗？", type: "S" },
    { id: 11, text: "你喜欢商业谈判和说服他人吗？", type: "E" },
    { id: 12, text: "你喜欢遵循既定流程和标准吗？", type: "C" },
    { id: 13, text: "你喜欢修理和组装东西吗？", type: "R" },
    { id: 14, text: "你喜欢解决复杂的理论问题吗？", type: "I" },
    { id: 15, text: "你喜欢自由表达和创新吗？", type: "A" },
    { id: 16, text: "你关心他人的情感和需求吗？", type: "S" },
    { id: 17, text: "你喜欢制定计划和目标吗？", type: "E" },
    { id: 18, text: "你喜欢精确和细致的工作吗？", type: "C" },
    { id: 19, text: "你喜欢实践多于理论吗？", type: "R" },
    { id: 20, text: "你喜欢探索未知和新发现吗？", type: "I" },
    { id: 21, text: "你喜欢美和艺术的事物吗？", type: "A" },
    { id: 22, text: "你喜欢团队合作和人际互动吗？", type: "S" },
    { id: 23, text: "你喜欢竞争和挑战吗？", type: "E" },
    { id: 24, text: "你喜欢按部就班的工作方式吗？", type: "C" },
  ];

  const options = [
    { value: 5, label: "非常喜欢" },
    { value: 3, label: "比较喜欢" },
    { value: 1, label: "一般" },
    { value: 0, label: "不太喜欢" },
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    const answerData = `${questions[currentQuestion].type}:${value}`;
    newAnswers[currentQuestion] = answerData;
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
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
      
      setShowResult(true);
    }
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
                          style={{ width: `${(score / 120) * 100}%` }}
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
              value={answers[currentQuestion]?.split(":")[1]} 
              onValueChange={(value) => handleAnswer(Number(value))}
            >
              <div className="space-y-3">
                {options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                    <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                    <Label htmlFor={`option-${option.value}`} className="flex-1 cursor-pointer">
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
