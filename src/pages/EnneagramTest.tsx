import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Home, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PaymentConfirmation from "@/components/PaymentConfirmation";

export default function EnneagramTest() {
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
    1: { name: "完美主义者", core: "追求完美和正确", fear: "害怕犯错、不完美", desire: "追求正确和改善", traits: "有原则、理想主义、自律、批判性思维" },
    2: { name: "助人者", core: "帮助他人获得认可", fear: "害怕不被需要", desire: "被爱和被欣赏", traits: "关爱、慷慨、取悦他人、情感丰富" },
    3: { name: "成就者", core: "追求成功和认可", fear: "害怕失败、无价值", desire: "有价值、被赞赏", traits: "适应力强、目标导向、有魅力、竞争力强" },
    4: { name: "浪漫主义者", core: "寻找独特身份", fear: "害怕平凡、无身份", desire: "独特、表达自我", traits: "创造力强、敏感、情绪化、追求真实" },
    5: { name: "观察者", core: "追求知识和理解", fear: "害怕无知、无能", desire: "理解世界", traits: "分析能力强、独立、好奇、保守能量" },
    6: { name: "忠诚者", core: "寻求安全和支持", fear: "害怕没有支持、不安全", desire: "安全感、归属感", traits: "负责任、忠诚、焦虑、谨慎" },
    7: { name: "享乐主义者", core: "追求快乐和自由", fear: "害怕痛苦、被束缚", desire: "快乐、满足", traits: "乐观、多才多艺、冲动、热情" },
    8: { name: "领导者", core: "追求力量和控制", fear: "害怕被控制、软弱", desire: "保护自己和他人", traits: "自信、果断、保护性、对抗性" },
    9: { name: "和平主义者", core: "追求和谐和平静", fear: "害怕冲突、失去连接", desire: "内心和平、和谐", traits: "包容、平和、顺从、逃避冲突" },
  };

  // 27题，每题4选项
  const questions = [
    { id: 1, text: "我通常：", options: [
      { type: 1, text: "对自己和他人要求很高，追求完美" },
      { type: 2, text: "关心他人需求，乐于帮助" },
      { type: 3, text: "设定目标并努力达成，在意成功" },
      { type: 4, text: "感受深刻，追求独特和真实" },
    ]},
    { id: 2, text: "我更倾向于：", options: [
      { type: 5, text: "需要独处时间思考和学习" },
      { type: 6, text: "寻求安全感和可靠的支持" },
      { type: 7, text: "追求新鲜体验和快乐" },
      { type: 8, text: "掌控局面，保护自己和他人" },
    ]},
    { id: 3, text: "面对压力时，我会：", options: [
      { type: 9, text: "回避问题，寻求平静" },
      { type: 1, text: "更加批判和追求完美" },
      { type: 6, text: "感到焦虑，寻求支持和保障" },
      { type: 7, text: "寻找快乐和新体验来转移注意" },
    ]},
    { id: 4, text: "在人际关系中：", options: [
      { type: 8, text: "我直接表达想法，不怕冲突" },
      { type: 2, text: "我总是优先考虑他人的需求" },
      { type: 3, text: "我希望展现最好的自己" },
      { type: 4, text: "我渴望深刻的情感连接" },
    ]},
    { id: 5, text: "我更看重：", options: [
      { type: 5, text: "知识和理解" },
      { type: 6, text: "安全和忠诚" },
      { type: 9, text: "和平和和谐" },
      { type: 1, text: "正直和完美" },
    ]},
    { id: 6, text: "我最害怕的是：", options: [
      { type: 2, text: "不被需要和被拒绝" },
      { type: 3, text: "失败和被认为无价值" },
      { type: 4, text: "失去自我和变得平凡" },
      { type: 5, text: "无知和无能" },
    ]},
    { id: 7, text: "别人常说我：", options: [
      { type: 6, text: "很谨慎、有责任心" },
      { type: 7, text: "很开朗、充满活力" },
      { type: 8, text: "很强大、有魄力" },
      { type: 9, text: "很好相处、平和" },
    ]},
    { id: 8, text: "我的决策方式：", options: [
      { type: 1, text: "遵循原则和标准" },
      { type: 4, text: "跟随内心感受和直觉" },
      { type: 5, text: "经过深思熟虑和分析" },
      { type: 7, text: "追随兴奋和可能性" },
    ]},
    { id: 9, text: "我的能量来源于：", options: [
      { type: 2, text: "帮助他人和被感激" },
      { type: 3, text: "达成目标和获得认可" },
      { type: 8, text: "掌控局面和克服困难" },
      { type: 9, text: "平静和谐的环境" },
    ]},
    { id: 10, text: "我倾向于：", options: [
      { type: 1, text: "纠正错误和改善事物" },
      { type: 5, text: "观察和思考多于行动" },
      { type: 6, text: "为最坏情况做准备" },
      { type: 7, text: "保持乐观和期待" },
    ]},
    { id: 11, text: "在团队中，我：", options: [
      { type: 2, text: "支持和鼓励他人" },
      { type: 3, text: "推动目标达成" },
      { type: 4, text: "带来创意和独特视角" },
      { type: 8, text: "自然承担领导角色" },
    ]},
    { id: 12, text: "我的成长方向是：", options: [
      { type: 1, text: "学会接受不完美" },
      { type: 6, text: "学会更加自信和独立" },
      { type: 7, text: "学会面对痛苦和深入" },
      { type: 9, text: "学会主动和表达需求" },
    ]},
    { id: 13, text: "我的弱点可能是：", options: [
      { type: 2, text: "忽视自己的需求" },
      { type: 3, text: "过度在意形象" },
      { type: 4, text: "情绪起伏大" },
      { type: 5, text: "与人保持距离" },
    ]},
    { id: 14, text: "我追求的是：", options: [
      { type: 1, text: "改善和进步" },
      { type: 6, text: "安全和确定" },
      { type: 7, text: "多样性和刺激" },
      { type: 8, text: "独立和力量" },
    ]},
    { id: 15, text: "我的沟通风格：", options: [
      { type: 2, text: "温暖关怀和支持性" },
      { type: 3, text: "注重效率和成果" },
      { type: 4, text: "情感丰富和真实" },
      { type: 9, text: "温和包容" },
    ]},
    { id: 16, text: "我最看重：", options: [
      { type: 1, text: "正确和公正" },
      { type: 5, text: "知识和理解" },
      { type: 8, text: "真实和直接" },
      { type: 9, text: "包容和理解" },
    ]},
    { id: 17, text: "当遇到问题时：", options: [
      { type: 1, text: "我会找出问题并修正" },
      { type: 3, text: "我会寻找最有效的解决方案" },
      { type: 5, text: "我会深入分析和研究" },
      { type: 6, text: "我会考虑各种风险" },
    ]},
    { id: 18, text: "我的情感表达：", options: [
      { type: 2, text: "温暖热情，关心他人感受" },
      { type: 4, text: "深刻敏感，追求真实" },
      { type: 7, text: "乐观积极，传播快乐" },
      { type: 8, text: "直接有力，不掩饰" },
    ]},
    { id: 19, text: "我的自我认知：", options: [
      { type: 1, text: "我是有原则的人" },
      { type: 3, text: "我是成功的人" },
      { type: 5, text: "我是聪明的人" },
      { type: 9, text: "我是随和的人" },
    ]},
    { id: 20, text: "在压力下我会：", options: [
      { type: 2, text: "更加努力讨好他人" },
      { type: 4, text: "变得更加敏感内省" },
      { type: 6, text: "变得更加焦虑谨慎" },
      { type: 8, text: "变得更加强硬对抗" },
    ]},
    { id: 21, text: "我认为生活应该：", options: [
      { type: 1, text: "有序且有意义" },
      { type: 7, text: "充满乐趣和体验" },
      { type: 8, text: "由自己掌控" },
      { type: 9, text: "平静祥和" },
    ]},
    { id: 22, text: "面对批评，我：", options: [
      { type: 1, text: "会认真反思并改进" },
      { type: 3, text: "可能会感到自尊受挫" },
      { type: 4, text: "可能会感到被误解" },
      { type: 5, text: "会理性分析其合理性" },
    ]},
    { id: 23, text: "我最擅长：", options: [
      { type: 2, text: "照顾和支持他人" },
      { type: 3, text: "达成目标和激励团队" },
      { type: 5, text: "深入思考和分析问题" },
      { type: 7, text: "创造快乐和新想法" },
    ]},
    { id: 24, text: "我内心渴望：", options: [
      { type: 2, text: "被爱和被需要" },
      { type: 4, text: "被理解和独特价值" },
      { type: 6, text: "安全感和归属感" },
      { type: 9, text: "内心平静和和谐" },
    ]},
    { id: 25, text: "我的领导风格：", options: [
      { type: 1, text: "以身作则，追求卓越" },
      { type: 3, text: "目标导向，激励团队" },
      { type: 8, text: "果断有力，保护团队" },
      { type: 9, text: "包容协调，促进和谐" },
    ]},
    { id: 26, text: "休息时我喜欢：", options: [
      { type: 4, text: "独自沉浸在艺术和情感中" },
      { type: 5, text: "独处阅读和思考" },
      { type: 7, text: "探索新事物和体验" },
      { type: 9, text: "放松休息，什么都不做" },
    ]},
    { id: 27, text: "我认为成功意味着：", options: [
      { type: 1, text: "做正确的事，达到高标准" },
      { type: 2, text: "被他人需要和感激" },
      { type: 3, text: "获得成就和认可" },
      { type: 8, text: "拥有力量和影响力" },
    ]},
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (typeNum: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = typeNum.toString();
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
          test_type: "personality",
          test_name: "九型人格测试",
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
    const typeScores: { [key: number]: number } = {};
    
    answers.forEach((type) => {
      const typeNum = parseInt(type);
      typeScores[typeNum] = (typeScores[typeNum] || 0) + 1;
    });

    const sortedTypes = Object.entries(typeScores)
      .sort(([, a], [, b]) => b - a);

    const primaryType = Number(sortedTypes[0][0]);
    const secondaryType = sortedTypes[1] ? Number(sortedTypes[1][0]) : null;

    return {
      primary: { type: primaryType, ...types[primaryType as keyof typeof types], score: sortedTypes[0][1] },
      secondary: secondaryType ? { type: secondaryType, ...types[secondaryType as keyof typeof types], score: sortedTypes[1][1] } : null,
      allScores: typeScores,
    };
  };

  if (showPayment) {
    return (
      <PaymentConfirmation 
        testName="九型人格测试" 
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
              <div className="text-6xl font-bold text-primary">
                {result.primary.type}型
              </div>
              <h2 className="text-3xl font-bold">{result.primary.name}</h2>
              <p className="text-xl text-muted-foreground">{result.primary.core}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">核心恐惧</p>
                  <p className="text-sm">{result.primary.fear}</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">核心渴望</p>
                  <p className="text-sm">{result.primary.desire}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">性格特质</h3>
                <p className="text-muted-foreground">{result.primary.traits}</p>
              </div>

              {result.secondary && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">副型：{result.secondary.type}型 - {result.secondary.name}</h3>
                  <p className="text-sm text-muted-foreground">{result.secondary.core}</p>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">九型得分分布</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3,4,5,6,7,8,9].map(type => (
                    <div key={type} className="text-center p-2 rounded bg-card">
                      <div className="font-bold text-primary">{type}型</div>
                      <div className="text-sm text-muted-foreground">{result.allScores[type] || 0}分</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  九型人格理论认为，每个人都有一个核心人格类型，了解自己的类型可以帮助你更好地理解自己的动机、恐惧和成长方向。没有任何一型比另一型更好，关键是认识和接纳真实的自己。
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
            <h2 className="text-xl font-semibold">九型人格测试</h2>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">{questions[currentQuestion].text}</h3>
            
            <RadioGroup 
              value={answers[currentQuestion]} 
              onValueChange={(value) => handleAnswer(Number(value))}
            >
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                    <RadioGroupItem value={option.type.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option.text}
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
