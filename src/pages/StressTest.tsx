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

const StressTest = () => {
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

  const questions = [
    { id: 0, question: "你是否感到学习压力很大？" },
    { id: 1, question: "你是否经常感到疲惫不堪？" },
    { id: 2, question: "你是否难以集中注意力？" },
    { id: 3, question: "你是否经常担心考试成绩？" },
    { id: 4, question: "你是否感到时间总是不够用？" },
    { id: 5, question: "你是否经常失眠或睡眠质量差？" },
    { id: 6, question: "你是否感到情绪波动大？" },
    { id: 7, question: "你是否觉得难以放松下来？" },
    { id: 8, question: "你是否经常头痛或身体不适？" },
    { id: 9, question: "你是否觉得生活失去乐趣？" },
    { id: 10, question: "你是否感到人际关系压力？" },
    { id: 11, question: "你是否经常拖延任务？" },
    { id: 12, question: "你是否感到对未来担忧？" },
    { id: 13, question: "你是否食欲不振或暴饮暴食？" },
    { id: 14, question: "你是否觉得难以应对日常任务？" },
    { id: 15, question: "你是否经常感到烦躁易怒？" },
    { id: 16, question: "你是否觉得自己能力不足？" },
    { id: 17, question: "你是否经常感到孤独？" },
    { id: 18, question: "你是否觉得生活节奏太快？" },
    { id: 19, question: "你是否有逃避现实的想法？" }
  ];

  const options = [
    { value: 0, label: "从不" },
    { value: 1, label: "偶尔" },
    { value: 2, label: "经常" },
    { value: 3, label: "总是" }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: number) => {
    const updated = { ...answers, [currentQuestion]: value };
    setAnswers(updated);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      }
    }, 300);
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
            test_type: "stress",
            test_name: "压力值测试",
            result: JSON.stringify(result)
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
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const maxScore = questions.length * 3;
    const percentage = (totalScore / maxScore) * 100;

    // 维度分析
    const dimensions = {
      academic: { name: "学业压力", score: 0, max: 0, questions: [0, 2, 3, 4, 11] },
      physical: { name: "身体反应", score: 0, max: 0, questions: [1, 5, 8, 13] },
      emotional: { name: "情绪状态", score: 0, max: 0, questions: [6, 9, 15, 17, 19] },
      social: { name: "社交与适应", score: 0, max: 0, questions: [10, 16] },
      future: { name: "未来担忧", score: 0, max: 0, questions: [7, 12, 14, 18] }
    };

    Object.entries(answers).forEach(([questionIndex, answer]) => {
      const index = parseInt(questionIndex);
      Object.values(dimensions).forEach(dim => {
        if (dim.questions.includes(index)) {
          dim.score += answer;
          dim.max += 3;
        }
      });
    });

    let level = "";
    let desc = "";
    let color = "";
    let suggestions: string[] = [];
    let detailedAnalysis = "";
    let symptoms: string[] = [];
    let copingStrategies: string[] = [];
    let resources: { name: string; desc: string }[] = [];
    let stressManagement: string[] = [];

    if (percentage < 25) {
      level = "压力较小";
      desc = "你的压力水平很低，生活状态良好";
      color = "bg-success";
      detailedAnalysis = "测试结果显示你目前的压力水平处于较低状态，这是非常健康的。你能够较好地平衡学习、生活和社交，拥有良好的时间管理能力和情绪调节能力。继续保持这种积极的状态！";
      symptoms = [
        "情绪稳定，较少感到焦虑或烦躁",
        "睡眠质量好，精力充沛",
        "能够有效管理时间，完成各项任务",
        "人际关系和谐，社交活动正常"
      ];
      suggestions = [
        "🌟 继续保持当前的生活节奏和习惯",
        "💪 适当挑战自己，追求个人成长",
        "😊 培养更多兴趣爱好，丰富生活",
        "🤝 分享你的经验，帮助他人缓解压力",
        "📚 学习压力管理技巧，预防未来压力"
      ];
      copingStrategies = [
        "建立健康的生活习惯作为预防",
        "学习时间管理技巧，提高效率",
        "培养压力觉察能力，及早发现问题"
      ];
      stressManagement = [
        "制定清晰的目标和计划",
        "保持规律的运动习惯",
        "维护良好的社交网络"
      ];
      resources = [
        { name: "时间管理课程", desc: "进一步提升效率和规划能力" },
        { name: "兴趣社团", desc: "发展爱好，结交志同道合的朋友" }
      ];
    } else if (percentage < 50) {
      level = "轻度压力";
      desc = "你有一定压力，但整体可控";
      color = "bg-accent";
      detailedAnalysis = "测试结果显示你目前承受着轻度压力。这种程度的压力在大学生中很常见，通常来自学业任务、考试准备或社交需求。适度的压力可以促进动力和表现，关键是学会有效管理。";
      symptoms = [
        "偶尔感到紧张或焦虑",
        "有时难以放松或入睡",
        "偶尔感到疲劳或精力不足",
        "有时会拖延任务",
        "偶尔感到时间不够用"
      ];
      suggestions = [
        "🧘‍♀️ 每天练习10分钟放松技巧",
        "📅 使用待办清单，合理安排时间",
        "🏃‍♂️ 每周进行3-4次运动",
        "😴 保证7-8小时睡眠",
        "🗣️ 与朋友倾诉，获得情感支持",
        "⏰ 学会设置优先级，避免过度承诺"
      ];
      copingStrategies = [
        "番茄工作法：25分钟专注 + 5分钟休息",
        "每日三件事：每天只专注最重要的3件事",
        "压力日记：记录压力源和应对方式",
        "正念呼吸：紧张时进行深呼吸"
      ];
      stressManagement = [
        "学会说「不」，设立健康边界",
        "将大任务分解为小步骤",
        "庆祝小成就，增强自信心",
        "保持工作与休息的平衡"
      ];
      resources = [
        { name: "时间管理工作坊", desc: "学习高效学习和时间规划技巧" },
        { name: "瑜伽/冥想课程", desc: "学习放松和减压技巧" },
        { name: "学业辅导中心", desc: "获取学习方法指导" }
      ];
    } else if (percentage < 75) {
      level = "中度压力";
      desc = "你的压力较大，需要重视和调整";
      color = "bg-primary";
      detailedAnalysis = "测试结果表明你正在经历中度压力。这种程度的压力可能已经开始影响你的身心健康和日常功能。你可能感到经常疲惫、难以集中注意力，或者出现一些身体不适。建议你认真对待这个信号，采取积极措施进行调整。";
      symptoms = [
        "经常感到紧张、焦虑或烦躁",
        "睡眠质量明显下降",
        "频繁感到疲劳和精力不足",
        "注意力难以集中，效率下降",
        "可能出现头痛、肌肉紧张等躯体症状",
        "对日常活动兴趣减退"
      ];
      suggestions = [
        "⏸️ 适当减少非必要的任务和承诺",
        "🎯 设定优先级，分步完成重要任务",
        "🧘 每天进行放松练习（冥想、深呼吸）",
        "👥 主动寻求朋友、家人或老师的支持",
        "💡 考虑预约心理咨询，获取专业建议",
        "🌳 增加户外活动和运动时间"
      ];
      copingStrategies = [
        "紧急-重要矩阵：按优先级处理任务",
        "渐进式肌肉放松：系统性释放身体紧张",
        "认知重构：挑战「必须完美」等非理性想法",
        "建立支持系统：告诉他人你需要帮助"
      ];
      stressManagement = [
        "识别主要压力源，有针对性地应对",
        "调整期望值，接受「足够好」",
        "安排专门的休息和娱乐时间",
        "学会寻求帮助，不必独自承担"
      ];
      resources = [
        { name: "校心理咨询中心", desc: "预约专业咨询师获取支持" },
        { name: "辅导员/班主任", desc: "协调学业压力，获取资源" },
        { name: "压力管理小组", desc: "与同伴互助，共同成长" }
      ];
    } else {
      level = "高度压力";
      desc = "你的压力水平很高，强烈建议寻求帮助";
      color = "bg-destructive";
      detailedAnalysis = "测试结果显示你正在经历高度压力。这种程度的压力可能严重影响你的身心健康和日常生活。你可能感到不堪重负、精疲力竭，甚至出现较明显的身体症状。请认真对待这个信号，你需要专业的帮助和支持。";
      symptoms = [
        "持续感到不堪重负和焦虑",
        "严重的睡眠问题",
        "持续的疲劳感，即使休息也无法恢复",
        "明显的身体症状：头痛、胃痛、肌肉紧张",
        "情绪波动大，容易烦躁或崩溃",
        "逃避社交和日常活动",
        "可能出现绝望或无助感"
      ];
      suggestions = [
        "🚨 建议立即预约心理咨询师",
        "📞 心理援助热线：12355（24小时）",
        "⏰ 暂停非必要活动，优先保证休息",
        "🛑 向老师申请适当减轻学业负担",
        "👪 告知家人你的状况，获取支持",
        "👨‍⚕️ 如有严重身体症状，请就医检查"
      ];
      copingStrategies = [
        "暂停和呼吸：遇到崩溃感时，先停下来深呼吸",
        "寻求帮助：这不是软弱，而是智慧的选择",
        "简化生活：暂时只做最必要的事情",
        "自我关怀：像对待生病的朋友一样对待自己"
      ];
      stressManagement = [
        "承认问题的存在，不要逞强",
        "暂时降低对自己的要求",
        "优先处理最紧急的事项",
        "接受不完美，允许自己休息"
      ];
      resources = [
        { name: "校心理危机干预热线", desc: "紧急情况请立即拨打" },
        { name: "学院辅导员", desc: "协调学业减负和休学事宜" },
        { name: "医院心理科", desc: "进行专业评估和治疗" },
        { name: "全国心理援助热线", desc: "400-161-9995（24小时）" }
      ];
    }

    const dimensionResults = Object.entries(dimensions).map(([key, dim]) => ({
      key,
      name: dim.name,
      percentage: dim.max > 0 ? Math.round((dim.score / dim.max) * 100) : 0
    }));

    return { 
      level, desc, color, totalScore, maxScore, percentage: Math.round(percentage), suggestions,
      detailedAnalysis, symptoms, copingStrategies, resources, dimensionResults, stressManagement 
    };
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
            <h1 className="text-2xl font-bold text-foreground">压力测试报告</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* 主要结果卡片 */}
          <Card className={`p-8 ${result.color} border-0 shadow-float text-white text-center animate-fade-in`}>
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-3">{result.level}</h2>
            <p className="text-xl opacity-90 mb-4">{result.desc}</p>
            <div className="text-lg font-medium">
              压力指数：{result.percentage}%
            </div>
          </Card>

          {/* 详细分析 */}
          <Card className="p-6 shadow-card animate-slide-up">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              📊 详细分析
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {result.detailedAnalysis}
            </p>
          </Card>

          {/* 维度分析 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              📈 压力来源分析
            </h3>
            <div className="space-y-4">
              {result.dimensionResults.map((dim) => (
                <div key={dim.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{dim.name}</span>
                    <span className="text-muted-foreground">{dim.percentage}%</span>
                  </div>
                  <Progress value={dim.percentage} className="h-2" />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * 分析你的主要压力来源，帮助你有针对性地进行调整
            </p>
          </Card>

          {/* 得分详情 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              📋 得分详情
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">总分</span>
                <span className="text-foreground font-medium">{result.totalScore} / {result.maxScore}</span>
              </div>
              <Progress value={result.percentage} className="h-3" />
              <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-muted-foreground">0-25%：压力较小</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10">
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                  <span className="text-muted-foreground">25-50%：轻度压力</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground">50-75%：中度压力</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span className="text-muted-foreground">75-100%：高度压力</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 症状表现 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              🔍 可能的表现
            </h3>
            <div className="space-y-2">
              {result.symptoms.map((symptom, index) => (
                <div key={index} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{symptom}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 改善建议 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              💡 改善建议
            </h3>
            <div className="space-y-3">
              {result.suggestions.map((suggestion, index) => (
                <div key={index} className="text-muted-foreground p-2 rounded-lg bg-muted/30">
                  {suggestion}
                </div>
              ))}
            </div>
          </Card>

          {/* 应对策略 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              🛠️ 实用应对技巧
            </h3>
            <div className="space-y-3">
              {result.copingStrategies.map((strategy, index) => (
                <div key={index} className="flex items-start gap-3 text-muted-foreground">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span>{strategy}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 压力管理 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              🎯 压力管理要点
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {result.stressManagement.map((tip, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/30 text-muted-foreground text-sm">
                  ✓ {tip}
                </div>
              ))}
            </div>
          </Card>

          {/* 推荐资源 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.35s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              📚 推荐资源
            </h3>
            <div className="space-y-3">
              {result.resources.map((resource, index) => (
                <div key={index} className="p-3 rounded-lg border border-border">
                  <div className="font-medium text-foreground">{resource.name}</div>
                  <div className="text-sm text-muted-foreground">{resource.desc}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* 重要提示 */}
          <Card className="p-6 shadow-card border-l-4 border-l-primary animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              ⚠️ 重要提示
            </h3>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>• 本测试仅供参考，不能作为医学诊断依据</p>
              <p>• 压力是正常的生活体验，关键是学会识别和管理</p>
              <p>• 如果压力持续影响你的生活和健康，请寻求专业帮助</p>
              <p>• 适时休息不是偷懒，而是为了更好地前进</p>
              <p>• 寻求帮助是智慧和勇气的表现</p>
            </div>
          </Card>

          <div className="flex gap-4 pt-4">
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
              <h1 className="text-xl font-bold text-foreground">压力值测试</h1>
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
            disabled={answers[currentQuestion] === undefined}
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

export default StressTest;
