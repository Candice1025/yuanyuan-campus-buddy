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

export default function AnimalPersonalityTest() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
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

  const questions = [
    { 
      id: 1, 
      text: "在社交场合中，你通常：",
      options: [
        { value: 1, label: "主动与人交谈，成为焦点" },
        { value: 2, label: "安静观察，等待合适时机" },
        { value: 3, label: "与少数人深入交流" },
        { value: 4, label: "随遇而安，顺其自然" },
      ]
    },
    { 
      id: 2, 
      text: "面对困难时，你会：",
      options: [
        { value: 1, label: "直面挑战，勇往直前" },
        { value: 2, label: "冷静分析，寻找最佳方案" },
        { value: 3, label: "团结伙伴，共同面对" },
        { value: 4, label: "保持乐观，相信会好转" },
      ]
    },
    { 
      id: 3, 
      text: "你的工作方式是：",
      options: [
        { value: 1, label: "高效执行，追求结果" },
        { value: 2, label: "深思熟虑，注重细节" },
        { value: 3, label: "团队协作，互相支持" },
        { value: 4, label: "灵活自由，享受过程" },
      ]
    },
    { 
      id: 4, 
      text: "在团队中，你倾向于：",
      options: [
        { value: 1, label: "担任领导，指引方向" },
        { value: 2, label: "提供智慧，分析问题" },
        { value: 3, label: "维系关系，促进和谐" },
        { value: 4, label: "适应环境，配合他人" },
      ]
    },
    { 
      id: 5, 
      text: "你的决策方式：",
      options: [
        { value: 1, label: "果断迅速，凭借直觉" },
        { value: 2, label: "谨慎思考，权衡利弊" },
        { value: 3, label: "考虑他人，寻求共识" },
        { value: 4, label: "顺其自然，不急不躁" },
      ]
    },
    { 
      id: 6, 
      text: "对待变化，你：",
      options: [
        { value: 1, label: "主动拥抱，引领变革" },
        { value: 2, label: "观察评估，再做决定" },
        { value: 3, label: "与团队一起应对" },
        { value: 4, label: "随遇而安，慢慢适应" },
      ]
    },
    { 
      id: 7, 
      text: "你的生活节奏：",
      options: [
        { value: 1, label: "快节奏，充满活力" },
        { value: 2, label: "有规律，张弛有度" },
        { value: 3, label: "与朋友的节奏同步" },
        { value: 4, label: "慢节奏，悠然自得" },
      ]
    },
    { 
      id: 8, 
      text: "面对冲突，你会：",
      options: [
        { value: 1, label: "直接对抗，解决问题" },
        { value: 2, label: "理性分析，寻找根源" },
        { value: 3, label: "协调沟通，促进和解" },
        { value: 4, label: "回避冲突，保持和平" },
      ]
    },
    { 
      id: 9, 
      text: "你更喜欢：",
      options: [
        { value: 1, label: "挑战和竞争" },
        { value: 2, label: "学习和探索" },
        { value: 3, label: "陪伴和分享" },
        { value: 4, label: "平静和舒适" },
      ]
    },
    { 
      id: 10, 
      text: "在压力下，你：",
      options: [
        { value: 1, label: "更加专注，全力以赴" },
        { value: 2, label: "保持冷静，理性应对" },
        { value: 3, label: "寻求支持，共度难关" },
        { value: 4, label: "放松心态，顺其自然" },
      ]
    },
    { 
      id: 11, 
      text: "你的注意力更多在：",
      options: [
        { value: 1, label: "目标和成就" },
        { value: 2, label: "知识和真理" },
        { value: 3, label: "关系和情感" },
        { value: 4, label: "当下和享受" },
      ]
    },
    { 
      id: 12, 
      text: "你对规则的态度：",
      options: [
        { value: 1, label: "必要时可以打破" },
        { value: 2, label: "理解后再遵守" },
        { value: 3, label: "尊重并遵循" },
        { value: 4, label: "灵活对待，不拘泥" },
      ]
    },
    { 
      id: 13, 
      text: "你的能量来源：",
      options: [
        { value: 1, label: "成就和胜利" },
        { value: 2, label: "发现和洞察" },
        { value: 3, label: "连接和归属" },
        { value: 4, label: "宁静和自由" },
      ]
    },
    { 
      id: 14, 
      text: "面对新事物：",
      options: [
        { value: 1, label: "积极尝试，勇于冒险" },
        { value: 2, label: "先研究，再行动" },
        { value: 3, label: "与朋友一起探索" },
        { value: 4, label: "慢慢接触，不急不躁" },
      ]
    },
    { 
      id: 15, 
      text: "你的表达方式：",
      options: [
        { value: 1, label: "直接果断，言简意赅" },
        { value: 2, label: "逻辑清晰，有条不紊" },
        { value: 3, label: "温和友善，善解人意" },
        { value: 4, label: "轻松随意，不拘小节" },
      ]
    },
  ];

  const animals = {
    lion: { name: "狮子", desc: "领导力强，自信果断，勇于挑战", traits: "热情、自信、果断、有魄力" },
    eagle: { name: "鹰", desc: "目标明确，执行力强，追求卓越", traits: "专注、敏锐、独立、高效" },
    wolf: { name: "狼", desc: "团队意识强，忠诚可靠，策略思考", traits: "忠诚、聪慧、团结、坚韧" },
    fox: { name: "狐狸", desc: "机智灵活，善于应变，头脑清晰", traits: "聪明、灵活、谨慎、适应力强" },
    owl: { name: "猫头鹰", desc: "深思熟虑，理性分析，追求智慧", traits: "智慧、冷静、理性、洞察力强" },
    dolphin: { name: "海豚", desc: "友善温和，善解人意，乐于助人", traits: "友善、热情、善良、同理心强" },
    panda: { name: "熊猫", desc: "温和平静，不争不抢，随遇而安", traits: "温和、平和、友好、稳定" },
    elephant: { name: "大象", desc: "稳重可靠，记忆力强，重视传统", traits: "稳重、可靠、忠诚、有耐心" },
    cat: { name: "猫", desc: "独立自主，优雅神秘，有个性", traits: "独立、优雅、神秘、灵敏" },
    dog: { name: "狗", desc: "忠诚友好，热情可靠，重视关系", traits: "忠诚、友好、热情、可靠" },
    tiger: { name: "老虎", desc: "勇敢无畏，独立强大，有威严", traits: "勇敢、强大、独立、有魄力" },
    rabbit: { name: "兔子", desc: "温柔敏感，机警谨慎，善良可爱", traits: "温柔、敏感、谨慎、善良" },
    horse: { name: "马", desc: "自由奔放，精力充沛，热爱自由", traits: "自由、热情、活力、冒险" },
    bear: { name: "熊", desc: "强大有力，保护欲强，温暖可靠", traits: "强大、保护欲强、温暖、可靠" },
    deer: { name: "鹿", desc: "优雅温柔，敏感细腻，纯真善良", traits: "优雅、温柔、敏感、善良" },
    peacock: { name: "孔雀", desc: "自信优雅，追求美感，注重形象", traits: "自信、优雅、美丽、表现力强" },
    penguin: { name: "企鹅", desc: "社交能力强，团队精神，适应力强", traits: "社交、团结、坚韧、适应力强" },
    squirrel: { name: "松鼠", desc: "活泼好动，精力充沛，善于储备", traits: "活泼、勤奋、机警、有计划" },
    snake: { name: "蛇", desc: "冷静理性，观察敏锐，善于等待", traits: "冷静、理性、敏锐、有策略" },
    monkey: { name: "猴子", desc: "聪明机智，灵活多变，好奇心强", traits: "聪明、灵活、好奇、活泼" },
    butterfly: { name: "蝴蝶", desc: "自由浪漫，追求美好，善于改变", traits: "自由、美丽、灵动、善变" },
    bee: { name: "蜜蜂", desc: "勤劳认真，团队合作，高效执行", traits: "勤劳、认真、团队、高效" },
    ant: { name: "蚂蚁", desc: "坚持不懈，组织能力强，脚踏实地", traits: "坚韧、勤奋、有组织、踏实" },
    swan: { name: "天鹅", desc: "优雅高贵，追求完美，有品位", traits: "优雅、高贵、完美、品位" },
    koala: { name: "考拉", desc: "慢节奏生活，温和友善，享受当下", traits: "温和、慢节奏、友善、享受生活" },
    cheetah: { name: "猎豹", desc: "行动迅速，目标明确，爆发力强", traits: "迅速、专注、有爆发力、高效" },
    giraffe: { name: "长颈鹿", desc: "视野开阔，温和友善，独特视角", traits: "远见、温和、独特、友善" },
    chameleon: { name: "变色龙", desc: "适应力强，善于伪装，灵活多变", traits: "适应力强、灵活、谨慎、善变" },
    otter: { name: "水獭", desc: "玩乐有趣，乐观开朗，享受生活", traits: "乐观、有趣、社交、享受生活" },
    tortoise: { name: "乌龟", desc: "稳重持久，有耐心，脚踏实地", traits: "稳重、持久、有耐心、踏实" },
  };

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
            test_type: "personality",
            test_name: "动物性格测试",
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
    const animalScores: { [key: string]: number } = {};
    const animalKeys = Object.keys(animals);
    
    answers.forEach((answer, index) => {
      const animalIndex = (answer + index) % animalKeys.length;
      const animal = animalKeys[animalIndex];
      animalScores[animal] = (animalScores[animal] || 0) + 1;
    });

    const sortedAnimals = Object.entries(animalScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const primaryAnimal = sortedAnimals[0][0];
    const animalInfo = animals[primaryAnimal as keyof typeof animals];

    return {
      primary: { animal: primaryAnimal, ...animalInfo, score: sortedAnimals[0][1] },
      secondary: sortedAnimals[1] ? { 
        animal: sortedAnimals[1][0], 
        ...animals[sortedAnimals[1][0] as keyof typeof animals],
        score: sortedAnimals[1][1]
      } : null,
      tertiary: sortedAnimals[2] ? {
        animal: sortedAnimals[2][0],
        ...animals[sortedAnimals[2][0] as keyof typeof animals],
        score: sortedAnimals[2][1]
      } : null,
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
              <div className="text-6xl">🦁</div>
              <h2 className="text-3xl font-bold text-primary">你是：{result.primary.name}</h2>
              <p className="text-xl text-muted-foreground">{result.primary.desc}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">性格特质</h3>
                <p className="text-muted-foreground">{result.primary.traits}</p>
              </div>

              {result.secondary && (
                <div>
                  <h3 className="font-semibold mb-2">次要特征：{result.secondary.name}</h3>
                  <p className="text-sm text-muted-foreground">{result.secondary.desc}</p>
                </div>
              )}

              {result.tertiary && (
                <div>
                  <h3 className="font-semibold mb-2">潜在特征：{result.tertiary.name}</h3>
                  <p className="text-sm text-muted-foreground">{result.tertiary.desc}</p>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  每个人都拥有多种动物特质的组合，这使你成为独一无二的个体。了解自己的性格特点，可以帮助你更好地发挥优势，改善人际关系。
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
            <h2 className="text-xl font-semibold">动物性格测试</h2>
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
