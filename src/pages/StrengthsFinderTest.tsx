import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Home, RotateCcw, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function StrengthsFinderTest() {
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

  const themes = {
    achiever: { name: "成就", desc: "不断追求成就，工作勤奋，精力充沛", category: "执行力" },
    activator: { name: "行动", desc: "将想法转化为行动，催化他人行动", category: "影响力" },
    adaptability: { name: "适应", desc: "活在当下，灵活应对变化", category: "关系建立" },
    analytical: { name: "分析", desc: "寻求原因和结果，理性思考", category: "战略思维" },
    arranger: { name: "统筹", desc: "善于组织和管理复杂情况", category: "执行力" },
    belief: { name: "信仰", desc: "核心价值观指引人生，有使命感", category: "执行力" },
    command: { name: "统率", desc: "掌控局面，勇于决策和发声", category: "影响力" },
    communication: { name: "沟通", desc: "善于表达，把想法转化为语言", category: "影响力" },
    competition: { name: "竞争", desc: "以他人表现衡量自己，追求第一", category: "影响力" },
    connectedness: { name: "关联", desc: "相信万物相连，寻找意义和目的", category: "关系建立" },
    consistency: { name: "公平", desc: "追求平衡和公正对待", category: "执行力" },
    context: { name: "回顾", desc: "从过去了解现在，重视历史", category: "战略思维" },
    deliberative: { name: "审慎", desc: "谨慎决策，识别风险", category: "执行力" },
    developer: { name: "伯乐", desc: "发现他人潜力，帮助成长", category: "关系建立" },
    discipline: { name: "纪律", desc: "需要结构和秩序，重视计划", category: "执行力" },
    empathy: { name: "同理", desc: "感知他人情感，善解人意", category: "关系建立" },
    focus: { name: "专注", desc: "目标明确，全力以赴", category: "执行力" },
    futuristic: { name: "前瞻", desc: "受未来愿景激励，富有想象力", category: "战略思维" },
    harmony: { name: "和谐", desc: "寻求共识，避免冲突", category: "关系建立" },
    ideation: { name: "理念", desc: "善于产生创意，创新思维", category: "战略思维" },
    includer: { name: "包容", desc: "接纳他人，让人有归属感", category: "关系建立" },
    individualization: { name: "个别", desc: "关注个体差异，因材施教", category: "关系建立" },
    input: { name: "搜集", desc: "收集信息和资源，求知欲强", category: "战略思维" },
    intellection: { name: "思维", desc: "享受思考，需要独处时间", category: "战略思维" },
    learner: { name: "学习", desc: "热爱学习，追求进步", category: "战略思维" },
    maximizer: { name: "完美", desc: "追求卓越，发挥优势", category: "影响力" },
    positivity: { name: "积极", desc: "充满热情，传播正能量", category: "关系建立" },
    relator: { name: "关系", desc: "享受深度关系，忠诚可靠", category: "关系建立" },
    responsibility: { name: "责任", desc: "言出必行，承担责任", category: "执行力" },
    restorative: { name: "排难", desc: "善于解决问题，修复改进", category: "执行力" },
    self_assurance: { name: "自信", desc: "内心笃定，相信自己判断", category: "影响力" },
    significance: { name: "追求", desc: "追求卓越和认可，有影响力", category: "影响力" },
    strategic: { name: "战略", desc: "发现多种路径，善于规划", category: "战略思维" },
    woo: { name: "取悦", desc: "善于社交，赢得他人好感", category: "影响力" },
  };

  const questions = [
    { id: 1, options: ["achiever", "learner"], textA: "我总是精力充沛，想要完成更多任务", textB: "我热爱学习新知识，享受成长过程" },
    { id: 2, options: ["activator", "deliberative"], textA: "我喜欢将想法快速付诸行动", textB: "我做决定前需要仔细考虑各种风险" },
    { id: 3, options: ["communication", "intellection"], textA: "我善于用语言表达想法", textB: "我喜欢独自深入思考问题" },
    { id: 4, options: ["empathy", "analytical"], textA: "我能敏锐感知他人的情绪", textB: "我习惯理性分析问题的原因" },
    { id: 5, options: ["focus", "adaptability"], textA: "我专注于目标，不轻易改变方向", textB: "我能灵活应对各种变化" },
    { id: 6, options: ["strategic", "discipline"], textA: "我善于找到达成目标的多种路径", textB: "我需要有条理的计划和秩序" },
    { id: 7, options: ["competition", "harmony"], textA: "我以他人表现来衡量自己的成功", textB: "我追求团队和谐，避免冲突" },
    { id: 8, options: ["command", "includer"], textA: "我能自然地掌控局面和主导讨论", textB: "我希望每个人都感到被接纳" },
    { id: 9, options: ["futuristic", "context"], textA: "我对未来充满憧憬和想象", textB: "我从历史中寻找答案和经验" },
    { id: 10, options: ["ideation", "restorative"], textA: "我经常产生新颖的想法", textB: "我善于发现问题并解决它们" },
    { id: 11, options: ["maximizer", "developer"], textA: "我专注于将优势发挥到极致", textB: "我喜欢帮助他人成长进步" },
    { id: 12, options: ["positivity", "belief"], textA: "我总是充满热情和正能量", textB: "我的核心价值观指引我的人生" },
    { id: 13, options: ["relator", "woo"], textA: "我享受与少数人的深度关系", textB: "我善于结识新朋友并赢得好感" },
    { id: 14, options: ["responsibility", "self_assurance"], textA: "我对承诺非常认真，言出必行", textB: "我对自己的判断很有信心" },
    { id: 15, options: ["significance", "connectedness"], textA: "我追求卓越和他人的认可", textB: "我相信万物相连，寻找人生意义" },
    { id: 16, options: ["arranger", "consistency"], textA: "我善于统筹复杂的情况", textB: "我追求公平对待每个人" },
    { id: 17, options: ["input", "individualization"], textA: "我喜欢收集各种信息和资源", textB: "我关注每个人的独特之处" },
    { id: 18, options: ["achiever", "strategic"], textA: "我不断追求完成更多任务", textB: "我善于制定达成目标的策略" },
    { id: 19, options: ["activator", "focus"], textA: "我倾向于快速行动而非等待", textB: "我能长时间专注于重要目标" },
    { id: 20, options: ["communication", "empathy"], textA: "我擅长清晰表达想法", textB: "我能感同身受地理解他人" },
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (theme: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = theme;
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
            test_type: "strengths",
            test_name: "盖洛普优势识别",
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
    const themeScores: { [key: string]: number } = {};
    
    answers.forEach((theme) => {
      themeScores[theme] = (themeScores[theme] || 0) + 1;
    });

    const topThemes = Object.entries(themeScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => ({
        key: theme,
        ...themes[theme as keyof typeof themes]
      }));

    const categories: { [key: string]: number } = {};
    topThemes.forEach(theme => {
      categories[theme.category] = (categories[theme.category] || 0) + 1;
    });

    return { topThemes, categories };
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
              <Trophy className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-3xl font-bold text-primary">你的五大优势主题</h2>
              <p className="text-muted-foreground">这些是你最突出的才干，充分发挥它们将帮助你取得成功</p>
            </div>

            <div className="space-y-4">
              {result.topThemes.map((theme, index) => (
                <div key={theme.key} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{theme.name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {theme.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{theme.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">优势分布</h3>
              <div className="space-y-2">
                {Object.entries(result.categories).map(([category, count]) => (
                  <div key={category} className="flex items-center gap-3">
                    <span className="text-sm min-w-20">{category}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(count / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 盖洛普优势理论认为，专注于发展自己的优势比弥补弱点更有效。了解并运用这些优势，可以帮助你在工作和生活中获得更大的成就感和效能。
              </p>
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
            <h2 className="text-xl font-semibold">盖洛普优势识别测评</h2>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">选择更符合你的描述</p>
            
            <RadioGroup 
              value={answers[currentQuestion]} 
              onValueChange={handleAnswer}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                  <RadioGroupItem 
                    value={questions[currentQuestion].options[0]} 
                    id="option-a" 
                  />
                  <Label htmlFor="option-a" className="flex-1 cursor-pointer">
                    {questions[currentQuestion].textA}
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                  <RadioGroupItem 
                    value={questions[currentQuestion].options[1]} 
                    id="option-b" 
                  />
                  <Label htmlFor="option-b" className="flex-1 cursor-pointer">
                    {questions[currentQuestion].textB}
                  </Label>
                </div>
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
