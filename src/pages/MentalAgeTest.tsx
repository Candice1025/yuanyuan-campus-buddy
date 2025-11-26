import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Home, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MentalAgeTest() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [actualAge, setActualAge] = useState<number>(0);
  const [showAgeInput, setShowAgeInput] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, []);

  const questions = [
    { 
      id: 1, 
      text: "你更喜欢哪种周末活动？",
      options: [
        { value: -10, label: "充满活力的户外运动和探险" },
        { value: 0, label: "和朋友聚会，尝试新鲜事物" },
        { value: 5, label: "在家放松，看书或看电影" },
        { value: 10, label: "宁静的独处时光，回顾过往" },
      ]
    },
    { 
      id: 2, 
      text: "面对新科技产品，你的反应是：",
      options: [
        { value: -10, label: "第一时间购买和尝试" },
        { value: 0, label: "关注评价后再考虑" },
        { value: 5, label: "等到普及后再使用" },
        { value: 10, label: "觉得现有的就够用了" },
      ]
    },
    { 
      id: 3, 
      text: "你的社交方式：",
      options: [
        { value: -10, label: "频繁社交，认识新朋友" },
        { value: 0, label: "平衡社交和独处" },
        { value: 5, label: "与老友保持联系" },
        { value: 10, label: "享受独处，少社交" },
      ]
    },
    { 
      id: 4, 
      text: "你对流行文化的态度：",
      options: [
        { value: -10, label: "紧跟潮流，追逐热点" },
        { value: 0, label: "了解但不盲从" },
        { value: 5, label: "偶尔关注" },
        { value: 10, label: "不太关心流行趋势" },
      ]
    },
    { 
      id: 5, 
      text: "你的购物习惯：",
      options: [
        { value: -10, label: "喜欢尝试新品牌和新产品" },
        { value: 0, label: "在质量和价格间平衡" },
        { value: 5, label: "偏好熟悉的品牌" },
        { value: 10, label: "只买必需品，注重实用" },
      ]
    },
    { 
      id: 6, 
      text: "你的作息时间：",
      options: [
        { value: -10, label: "晚睡晚起，精力充沛" },
        { value: 0, label: "作息灵活，看情况" },
        { value: 5, label: "基本规律，偶尔调整" },
        { value: 10, label: "早睡早起，很有规律" },
      ]
    },
    { 
      id: 7, 
      text: "面对压力，你会：",
      options: [
        { value: -10, label: "通过运动和娱乐释放" },
        { value: 0, label: "找朋友倾诉" },
        { value: 5, label: "自己消化处理" },
        { value: 10, label: "依靠经验和冷静思考" },
      ]
    },
    { 
      id: 8, 
      text: "你的娱乐方式：",
      options: [
        { value: -10, label: "电竞、社交媒体、新奇体验" },
        { value: 0, label: "看电影、听音乐、聚会" },
        { value: 5, label: "阅读、散步、品茶" },
        { value: 10, label: "回忆往事、养生、静心" },
      ]
    },
    { 
      id: 9, 
      text: "你对未来的规划：",
      options: [
        { value: -10, label: "充满梦想和无限可能" },
        { value: 0, label: "有目标但保持灵活" },
        { value: 5, label: "务实规划，稳步前进" },
        { value: 10, label: "更关注当下的稳定" },
      ]
    },
    { 
      id: 10, 
      text: "你的学习态度：",
      options: [
        { value: -10, label: "对新知识充满好奇和热情" },
        { value: 0, label: "根据兴趣选择学习" },
        { value: 5, label: "学习实用的知识" },
        { value: 10, label: "更喜欢分享经验而非学习" },
      ]
    },
    { 
      id: 11, 
      text: "你的消费观念：",
      options: [
        { value: -10, label: "享受当下，及时行乐" },
        { value: 0, label: "平衡消费和储蓄" },
        { value: 5, label: "注重性价比和投资" },
        { value: 10, label: "节俭储蓄，为未来打算" },
      ]
    },
    { 
      id: 12, 
      text: "你对健康的重视程度：",
      options: [
        { value: -10, label: "觉得年轻不用太在意" },
        { value: 0, label: "偶尔关注健康问题" },
        { value: 5, label: "定期体检和保养" },
        { value: 10, label: "非常注重养生保健" },
      ]
    },
    { 
      id: 13, 
      text: "你的穿衣风格：",
      options: [
        { value: -10, label: "追求时尚潮流" },
        { value: 0, label: "舒适与风格兼顾" },
        { value: 5, label: "简约实用为主" },
        { value: 10, label: "经典保守，注重得体" },
      ]
    },
    { 
      id: 14, 
      text: "你的阅读偏好：",
      options: [
        { value: -10, label: "网络小说、漫画、短视频" },
        { value: 0, label: "畅销书和流行杂志" },
        { value: 5, label: "专业书籍和经典作品" },
        { value: 10, label: "历史和人文类书籍" },
      ]
    },
    { 
      id: 15, 
      text: "你对变化的态度：",
      options: [
        { value: -10, label: "喜欢变化，追求新鲜感" },
        { value: 0, label: "接受适度的变化" },
        { value: 5, label: "倾向于稳定不变" },
        { value: 10, label: "偏好熟悉的环境和习惯" },
      ]
    },
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
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
            test_type: "age",
            test_name: "心理年龄测评",
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
    const totalAdjustment = answers.reduce((sum, score) => sum + score, 0);
    const averageAdjustment = totalAdjustment / answers.length;
    const mentalAge = Math.max(10, Math.min(80, actualAge + averageAdjustment));
    const difference = mentalAge - actualAge;

    let category = "";
    let description = "";
    let color = "";

    if (difference < -10) {
      category = "年轻活力型";
      description = "你的心态比实际年龄年轻很多，充满活力和好奇心，对新事物保持开放态度。";
      color = "text-green-600";
    } else if (difference < -3) {
      category = "年轻心态型";
      description = "你的心态比实际年龄略显年轻，保持着积极向上的生活态度。";
      color = "text-blue-600";
    } else if (difference <= 3) {
      category = "年龄相符型";
      description = "你的心理年龄与实际年龄相符，心态平和成熟，生活稳定。";
      color = "text-purple-600";
    } else if (difference <= 10) {
      category = "成熟稳重型";
      description = "你的心态比实际年龄成熟一些，更加稳重和理性。";
      color = "text-orange-600";
    } else {
      category = "超龄成熟型";
      description = "你的心态比实际年龄成熟很多，可能需要适当放松，找回年轻的活力。";
      color = "text-red-600";
    }

    return {
      actualAge,
      mentalAge: Math.round(mentalAge),
      difference: Math.round(difference),
      category,
      description,
      color,
      suggestions: [
        difference > 10 ? "尝试培养一些新的兴趣爱好，保持年轻心态" : "保持现在的生活节奏，继续成长",
        "定期参加社交活动，与不同年龄段的人交流",
        "保持好奇心，不断学习新事物",
        difference < -10 ? "适当增加一些深度思考的时间" : "平衡工作和生活，保持身心健康",
      ]
    };
  };

  const handleStartTest = () => {
    if (actualAge > 0 && actualAge < 120) {
      setShowAgeInput(false);
    } else {
      toast.error("请输入有效的年龄（1-119岁）");
    }
  };

  if (showAgeInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/tests")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">心理年龄测评</h1>
          </div>

          <Card className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎂</div>
              <h2 className="text-2xl font-bold">开始测试前</h2>
              <p className="text-muted-foreground">请先输入您的实际年龄</p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="age">您的实际年龄</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="119"
                value={actualAge || ""}
                onChange={(e) => setActualAge(Number(e.target.value))}
                placeholder="请输入年龄"
                className="text-center text-lg"
              />
            </div>

            <Button onClick={handleStartTest} className="w-full" size="lg">
              开始测试
            </Button>
          </Card>
        </div>
      </div>
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
              <div className="text-6xl">
                {result.difference < -5 ? "🧒" : result.difference > 5 ? "🧓" : "😊"}
              </div>
              <h2 className={`text-3xl font-bold ${result.color}`}>{result.category}</h2>
              <div className="space-y-2">
                <p className="text-5xl font-bold text-primary">{result.mentalAge}岁</p>
                <p className="text-muted-foreground">您的心理年龄</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{result.actualAge}</p>
                    <p className="text-sm text-muted-foreground">实际年龄</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{result.mentalAge}</p>
                    <p className="text-sm text-muted-foreground">心理年龄</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${result.difference > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {result.difference > 0 ? '+' : ''}{result.difference}
                    </p>
                    <p className="text-sm text-muted-foreground">年龄差</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">分析说明</h3>
                <p className="text-muted-foreground">{result.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">建议</h3>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
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
            <h2 className="text-xl font-semibold">心理年龄测评</h2>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">{questions[currentQuestion].text}</h3>
            
            <RadioGroup value={answers[currentQuestion]?.toString() || ""} onValueChange={(value) => handleAnswer(Number(value))}>
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                    <RadioGroupItem value={option.value.toString()} id={`option-${index}`} />
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
              disabled={answers[currentQuestion] === undefined}
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
