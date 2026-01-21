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
import PaymentConfirmation from "@/components/PaymentConfirmation";

export default function StrengthsFinderTest() {
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

  // 30题，每题4选项
  const questions = [
    { id: 1, text: "我的工作方式：", options: [
      { theme: "achiever", text: "我总是精力充沛，想要完成更多任务" },
      { theme: "learner", text: "我热爱学习新知识，享受成长过程" },
      { theme: "deliberative", text: "我做决定前需要仔细考虑各种风险" },
      { theme: "adaptability", text: "我能灵活应对各种变化和意外" },
    ]},
    { id: 2, text: "面对新任务，我会：", options: [
      { theme: "activator", text: "立即开始行动，边做边调整" },
      { theme: "strategic", text: "先规划好路径再开始执行" },
      { theme: "analytical", text: "深入分析问题，找出最佳方案" },
      { theme: "discipline", text: "制定详细计划，按步骤执行" },
    ]},
    { id: 3, text: "在沟通中，我：", options: [
      { theme: "communication", text: "善于用语言表达想法，感染他人" },
      { theme: "empathy", text: "能敏锐感知他人的情绪和感受" },
      { theme: "harmony", text: "追求团队和谐，避免冲突" },
      { theme: "command", text: "能自然地掌控局面和主导讨论" },
    ]},
    { id: 4, text: "我对目标的态度：", options: [
      { theme: "focus", text: "专注于目标，不轻易改变方向" },
      { theme: "futuristic", text: "对未来充满憧憬和想象" },
      { theme: "competition", text: "以他人表现来衡量自己的成功" },
      { theme: "significance", text: "追求卓越和他人的认可" },
    ]},
    { id: 5, text: "在团队中，我：", options: [
      { theme: "developer", text: "喜欢帮助他人成长进步" },
      { theme: "includer", text: "希望每个人都感到被接纳" },
      { theme: "relator", text: "享受与少数人的深度关系" },
      { theme: "woo", text: "善于结识新朋友并赢得好感" },
    ]},
    { id: 6, text: "我处理问题的方式：", options: [
      { theme: "restorative", text: "善于发现问题并解决它们" },
      { theme: "ideation", text: "经常产生新颖的想法和创意" },
      { theme: "context", text: "从历史中寻找答案和经验" },
      { theme: "input", text: "喜欢收集各种信息和资源" },
    ]},
    { id: 7, text: "我的价值观：", options: [
      { theme: "belief", text: "核心价值观指引我的人生方向" },
      { theme: "responsibility", text: "对承诺非常认真，言出必行" },
      { theme: "consistency", text: "追求公平对待每个人" },
      { theme: "connectedness", text: "相信万物相连，寻找人生意义" },
    ]},
    { id: 8, text: "我的自信来源：", options: [
      { theme: "self_assurance", text: "对自己的判断很有信心" },
      { theme: "maximizer", text: "专注于将优势发挥到极致" },
      { theme: "positivity", text: "总是充满热情和正能量" },
      { theme: "intellection", text: "喜欢独自深入思考问题" },
    ]},
    { id: 9, text: "面对他人，我：", options: [
      { theme: "individualization", text: "关注每个人的独特之处" },
      { theme: "arranger", text: "善于统筹复杂的情况和人员" },
      { theme: "developer", text: "能发现他人的潜力并帮助发展" },
      { theme: "empathy", text: "能感同身受地理解他人" },
    ]},
    { id: 10, text: "我的学习态度：", options: [
      { theme: "learner", text: "热爱学习，不断追求进步" },
      { theme: "input", text: "喜欢收集和积累各种知识" },
      { theme: "analytical", text: "习惯理性分析问题的原因" },
      { theme: "intellection", text: "享受独自思考和反思" },
    ]},
    { id: 11, text: "我做决策时：", options: [
      { theme: "deliberative", text: "谨慎思考，识别各种风险" },
      { theme: "strategic", text: "善于找到达成目标的多种路径" },
      { theme: "command", text: "果断直接，凭借直觉决策" },
      { theme: "activator", text: "倾向于快速行动而非等待" },
    ]},
    { id: 12, text: "我的人际关系：", options: [
      { theme: "relator", text: "享受与少数人的深度友谊" },
      { theme: "woo", text: "善于结识新朋友扩展人脉" },
      { theme: "harmony", text: "追求团队和谐避免冲突" },
      { theme: "includer", text: "希望每个人都有归属感" },
    ]},
    { id: 13, text: "我的工作动力：", options: [
      { theme: "achiever", text: "不断追求完成更多任务" },
      { theme: "competition", text: "与他人竞争激励我前进" },
      { theme: "significance", text: "追求卓越和被认可" },
      { theme: "belief", text: "核心价值观驱动我工作" },
    ]},
    { id: 14, text: "我的思维方式：", options: [
      { theme: "ideation", text: "经常产生创新的想法" },
      { theme: "futuristic", text: "受未来愿景激励" },
      { theme: "context", text: "从历史中寻找智慧" },
      { theme: "analytical", text: "寻求逻辑和因果关系" },
    ]},
    { id: 15, text: "我的表达方式：", options: [
      { theme: "communication", text: "擅长清晰表达想法" },
      { theme: "positivity", text: "传播积极和正能量" },
      { theme: "command", text: "直接有力地表达观点" },
      { theme: "empathy", text: "温暖关怀地与人交流" },
    ]},
    { id: 16, text: "我对待规则：", options: [
      { theme: "discipline", text: "需要结构和秩序" },
      { theme: "consistency", text: "追求公平和一致性" },
      { theme: "responsibility", text: "认真履行承诺和责任" },
      { theme: "adaptability", text: "灵活应对，不拘泥规则" },
    ]},
    { id: 17, text: "我的核心能力：", options: [
      { theme: "arranger", text: "善于组织和统筹" },
      { theme: "restorative", text: "善于解决问题" },
      { theme: "maximizer", text: "将优势发挥到极致" },
      { theme: "strategic", text: "善于制定策略" },
    ]},
    { id: 18, text: "我与团队的关系：", options: [
      { theme: "developer", text: "帮助他人成长发展" },
      { theme: "harmony", text: "促进团队和谐" },
      { theme: "includer", text: "接纳每一个人" },
      { theme: "individualization", text: "因材施教，尊重差异" },
    ]},
    { id: 19, text: "我的内在驱动：", options: [
      { theme: "learner", text: "持续学习和成长" },
      { theme: "focus", text: "专注于重要目标" },
      { theme: "achiever", text: "完成任务的成就感" },
      { theme: "belief", text: "价值观和使命感" },
    ]},
    { id: 20, text: "我的社交风格：", options: [
      { theme: "woo", text: "主动结交新朋友" },
      { theme: "relator", text: "深耕少数深度关系" },
      { theme: "communication", text: "通过表达建立连接" },
      { theme: "positivity", text: "用热情感染他人" },
    ]},
    { id: 21, text: "我的决策依据：", options: [
      { theme: "analytical", text: "数据和逻辑分析" },
      { theme: "deliberative", text: "风险评估和谨慎考量" },
      { theme: "self_assurance", text: "内心的直觉和信念" },
      { theme: "context", text: "历史经验和先例" },
    ]},
    { id: 22, text: "我追求的是：", options: [
      { theme: "significance", text: "卓越和影响力" },
      { theme: "competition", text: "胜出和第一名" },
      { theme: "maximizer", text: "优势的最大化" },
      { theme: "futuristic", text: "美好的未来愿景" },
    ]},
    { id: 23, text: "我的行动模式：", options: [
      { theme: "activator", text: "立即行动，快速推进" },
      { theme: "discipline", text: "有计划地按步执行" },
      { theme: "focus", text: "专注于最重要的事" },
      { theme: "achiever", text: "高效完成更多任务" },
    ]},
    { id: 24, text: "我对变化的态度：", options: [
      { theme: "adaptability", text: "灵活适应各种变化" },
      { theme: "strategic", text: "预见变化并提前规划" },
      { theme: "deliberative", text: "谨慎评估变化的影响" },
      { theme: "restorative", text: "解决变化带来的问题" },
    ]},
    { id: 25, text: "我的领导方式：", options: [
      { theme: "command", text: "果断决策，掌控全局" },
      { theme: "developer", text: "培养团队成员成长" },
      { theme: "arranger", text: "高效统筹和组织" },
      { theme: "includer", text: "包容接纳每个人" },
    ]},
    { id: 26, text: "我的情感特点：", options: [
      { theme: "empathy", text: "敏锐感知他人情绪" },
      { theme: "positivity", text: "乐观积极有感染力" },
      { theme: "connectedness", text: "感受万物的联系" },
      { theme: "harmony", text: "追求和谐避免冲突" },
    ]},
    { id: 27, text: "我的思考方式：", options: [
      { theme: "intellection", text: "享受独自深入思考" },
      { theme: "ideation", text: "不断产生新想法" },
      { theme: "input", text: "收集各种信息资源" },
      { theme: "analytical", text: "理性分析因果关系" },
    ]},
    { id: 28, text: "我的责任感：", options: [
      { theme: "responsibility", text: "言出必行，认真负责" },
      { theme: "belief", text: "价值观驱动的使命感" },
      { theme: "consistency", text: "公平对待每个人" },
      { theme: "discipline", text: "遵循规则和秩序" },
    ]},
    { id: 29, text: "我的影响力：", options: [
      { theme: "communication", text: "通过表达影响他人" },
      { theme: "woo", text: "通过社交赢得人心" },
      { theme: "command", text: "通过决策领导团队" },
      { theme: "significance", text: "追求卓越的影响力" },
    ]},
    { id: 30, text: "我的发展方向：", options: [
      { theme: "learner", text: "不断学习成长" },
      { theme: "maximizer", text: "发挥优势到极致" },
      { theme: "futuristic", text: "实现未来愿景" },
      { theme: "developer", text: "帮助他人发展" },
    ]},
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
          test_type: "strengths",
          test_name: "盖洛普优势识别",
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
    const themeScores: { [key: string]: number } = {};
    
    answers.forEach((theme) => {
      themeScores[theme] = (themeScores[theme] || 0) + 1;
    });

    const topThemes = Object.entries(themeScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme, score]) => ({
        key: theme,
        score,
        ...themes[theme as keyof typeof themes]
      }));

    const categories: { [key: string]: number } = {};
    topThemes.forEach(theme => {
      categories[theme.category] = (categories[theme.category] || 0) + 1;
    });

    return { topThemes, categories };
  };

  if (showPayment) {
    return (
      <PaymentConfirmation 
        testName="盖洛普优势识别测试" 
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
            <h3 className="text-lg font-medium">{questions[currentQuestion].text}</h3>
            
            <RadioGroup 
              value={answers[currentQuestion]} 
              onValueChange={handleAnswer}
            >
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                    <RadioGroupItem value={option.theme} id={`option-${index}`} />
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
