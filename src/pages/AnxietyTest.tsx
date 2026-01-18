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

const AnxietyTest = () => {
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

  // 焦虑自评量表(SAS)问题
  const questions = [
    { id: 0, question: "我觉得比平时容易紧张和着急" },
    { id: 1, question: "我无缘无故地感到害怕" },
    { id: 2, question: "我容易心里烦乱或感到惊恐" },
    { id: 3, question: "我觉得我可能将要发疯" },
    { id: 4, question: "我觉得一切都很好" },
    { id: 5, question: "我手脚发抖打颤" },
    { id: 6, question: "我因为头痛、头颈痛和背痛而苦恼" },
    { id: 7, question: "我感觉容易衰弱和疲乏" },
    { id: 8, question: "我觉得心平气和，并且容易安静坐着" },
    { id: 9, question: "我觉得心跳得很快" },
    { id: 10, question: "我因为一阵阵头晕而苦恼" },
    { id: 11, question: "我有晕倒发作，或觉得要晕倒似的" },
    { id: 12, question: "我吸气呼气都感到很容易" },
    { id: 13, question: "我的手脚麻木和刺痛" },
    { id: 14, question: "我因为胃痛和消化不良而苦恼" },
    { id: 15, question: "我常常要小便" },
    { id: 16, question: "我的手脚常常是干燥温暖的" },
    { id: 17, question: "我脸红发热" },
    { id: 18, question: "我容易入睡并且一夜睡得很好" },
    { id: 19, question: "我做恶梦" }
  ];

  const options = [
    { value: 1, label: "没有或很少时间" },
    { value: 2, label: "小部分时间" },
    { value: 3, label: "相当多时间" },
    { value: 4, label: "绝大部分或全部时间" }
  ];

  // 反向计分题目
  const reverseScoreQuestions = [4, 8, 12, 16, 18];

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
            test_type: "anxiety",
            test_name: "焦虑自测量表",
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
    
    // 维度分析
    const dimensions = {
      physical: { name: "躯体症状", score: 0, max: 0, questions: [5, 6, 7, 9, 10, 11, 13, 14, 15, 17] },
      emotional: { name: "情绪症状", score: 0, max: 0, questions: [0, 1, 2, 3, 19] },
      cognitive: { name: "认知症状", score: 0, max: 0, questions: [4, 8, 12, 16, 18] }
    };
    
    Object.entries(answers).forEach(([questionIndex, answer]) => {
      const index = parseInt(questionIndex);
      let score = reverseScoreQuestions.includes(index) ? (5 - answer) : answer;
      rawScore += score;
      
      // 分配到维度
      Object.values(dimensions).forEach(dim => {
        if (dim.questions.includes(index)) {
          dim.score += score;
          dim.max += 4;
        }
      });
    });

    const standardScore = Math.round(rawScore * 1.25);

    let level = "";
    let desc = "";
    let color = "";
    let suggestions: string[] = [];
    let detailedAnalysis = "";
    let symptoms: string[] = [];
    let copingStrategies: string[] = [];
    let resources: { name: string; desc: string }[] = [];

    if (standardScore < 50) {
      level = "正常";
      desc = "你的焦虑水平在正常范围内，心理状态良好";
      color = "bg-success";
      detailedAnalysis = "从测试结果来看，你目前的焦虑水平处于健康范围内。这表明你具有较好的情绪调节能力，能够有效应对日常生活中的压力和挑战。保持这种积极的心理状态对你的学习和生活都非常有益。";
      symptoms = [
        "情绪稳定，较少出现无缘由的紧张感",
        "睡眠质量良好，入睡容易",
        "身体状态正常，无明显躯体不适",
        "能够保持专注和清晰的思维"
      ];
      suggestions = [
        "🌟 继续保持良好的生活习惯和心态",
        "🧘‍♀️ 可以学习一些放松技巧作为日常保养",
        "💪 保持规律的运动习惯，增强身心健康",
        "😊 培养兴趣爱好，丰富精神生活",
        "👥 维持良好的社交关系，获得情感支持"
      ];
      copingStrategies = [
        "定期进行自我检查，关注情绪变化",
        "学习正念冥想，提升自我觉察能力",
        "建立压力预警机制，及早识别问题"
      ];
      resources = [
        { name: "校园心理健康中心", desc: "定期举办心理健康讲座和工作坊" },
        { name: "团体辅导活动", desc: "参与心理成长小组，提升心理素质" }
      ];
    } else if (standardScore < 60) {
      level = "轻度焦虑";
      desc = "你可能存在轻度焦虑，需要适当调节";
      color = "bg-accent";
      detailedAnalysis = "测试结果显示你存在轻度焦虑倾向。这可能表现为偶尔的紧张、担忧或身体不适。轻度焦虑在大学生中很常见，通常与学业压力、人际关系或对未来的担忧有关。好消息是，通过适当的自我调节，这种状态是可以改善的。";
      symptoms = [
        "偶尔感到紧张或坐立不安",
        "有时难以入睡或睡眠质量下降",
        "偶尔出现心跳加速或呼吸急促",
        "注意力有时难以集中"
      ];
      suggestions = [
        "🧘 每天练习10-15分钟深呼吸和放松训练",
        "🏃‍♂️ 每周进行3-4次有氧运动，如跑步、游泳",
        "😴 保证每晚7-8小时的充足睡眠",
        "🗣️ 与朋友、家人或信任的人分享你的感受",
        "📝 尝试写日记，记录和释放情绪",
        "☕ 减少咖啡因和刺激性饮料的摄入"
      ];
      copingStrategies = [
        "4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒",
        "渐进式肌肉放松：从脚趾到头顶逐步放松",
        "正念冥想：每天10分钟关注当下",
        "积极自我对话：用鼓励的话语替代消极想法"
      ];
      resources = [
        { name: "心理咨询室", desc: "提供免费的一对一咨询服务" },
        { name: "心理健康APP", desc: "如Calm、Headspace等冥想应用" },
        { name: "运动社团", desc: "参与体育活动，释放压力" }
      ];
    } else if (standardScore < 70) {
      level = "中度焦虑";
      desc = "你的焦虑程度较高，建议寻求帮助";
      color = "bg-primary";
      detailedAnalysis = "测试结果表明你正在经历中度焦虑。这种程度的焦虑可能已经开始影响你的日常生活、学习效率和人际关系。你可能经常感到紧张、担忧，并出现一些躯体症状。建议你认真对待这个信号，主动寻求专业帮助。";
      symptoms = [
        "经常感到紧张、担忧或恐惧",
        "睡眠问题明显，难以入睡或早醒",
        "频繁出现心悸、出汗、头晕等躯体症状",
        "注意力难以集中，影响学习效率",
        "容易感到疲劳和烦躁"
      ];
      suggestions = [
        "🏥 强烈建议预约学校心理咨询师",
        "🧘‍♀️ 系统学习放松技巧和情绪管理",
        "⏰ 建立规律的作息时间表",
        "☕ 避免咖啡因、酒精和尼古丁",
        "📱 减少社交媒体使用，降低信息过载",
        "🎯 将大任务分解为小步骤，逐个完成"
      ];
      copingStrategies = [
        "认知重构：识别并挑战非理性想法",
        "暴露疗法：逐步面对引发焦虑的情境",
        "时间管理：使用番茄工作法提高效率",
        "建立支持系统：告知家人朋友你的情况"
      ];
      resources = [
        { name: "校心理咨询中心", desc: "预约专业心理咨询师进行评估和干预" },
        { name: "班主任/辅导员", desc: "可以协调学业压力和提供支持" },
        { name: "全国心理援助热线", desc: "12355（青少年服务热线）" }
      ];
    } else {
      level = "重度焦虑";
      desc = "你的焦虑程度很高，强烈建议立即寻求专业帮助";
      color = "bg-destructive";
      detailedAnalysis = "测试结果显示你正在经历重度焦虑。这种程度的焦虑可能严重影响你的日常功能，包括学习、社交和身体健康。你可能感到非常痛苦和无助。请记住，焦虑症是可以治疗的，寻求专业帮助是勇敢和明智的选择。";
      symptoms = [
        "持续的强烈紧张和恐惧感",
        "严重的睡眠障碍",
        "明显的躯体症状：心悸、呼吸困难、头晕、手抖",
        "回避社交和日常活动",
        "可能出现惊恐发作",
        "日常功能受到明显影响"
      ];
      suggestions = [
        "🚨 请立即联系校心理咨询中心或医院",
        "📞 24小时心理援助热线：12355",
        "👨‍⚕️ 可能需要专业心理治疗和药物干预",
        "👪 立即告知家人或信任的人",
        "🛡️ 避免独自承受，寻求多方支持",
        "⏸️ 暂时减轻学业负担，优先处理心理健康"
      ];
      copingStrategies = [
        "紧急情况下的接地技术：5-4-3-2-1感官法",
        "保持基本的生活规律：按时吃饭、适当活动",
        "避免重大决定，等状态稳定后再做选择",
        "随身携带能让你感到安心的物品"
      ];
      resources = [
        { name: "校心理危机干预热线", desc: "紧急情况请立即拨打" },
        { name: "医院心理科/精神科", desc: "进行专业评估和治疗" },
        { name: "北京心理危机研究与干预中心", desc: "010-82951332" },
        { name: "生命热线", desc: "400-161-9995（24小时）" }
      ];
    }

    // 计算维度百分比
    const dimensionResults = Object.entries(dimensions).map(([key, dim]) => ({
      key,
      name: dim.name,
      percentage: dim.max > 0 ? Math.round((dim.score / dim.max) * 100) : 0
    }));

    return { 
      level, desc, color, standardScore, rawScore, suggestions, 
      detailedAnalysis, symptoms, copingStrategies, resources, dimensionResults 
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
            <h1 className="text-2xl font-bold text-foreground">焦虑自测报告</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* 主要结果卡片 */}
          <Card className={`p-8 ${result.color} border-0 shadow-float text-white text-center animate-fade-in`}>
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-3">{result.level}</h2>
            <p className="text-xl opacity-90 mb-4">{result.desc}</p>
            <div className="text-lg font-medium">
              标准分：{result.standardScore} 分
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
              📈 维度分析
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
              * 躯体症状：身体反应如心跳、头晕等；情绪症状：紧张、恐惧等；认知症状：思维和注意力相关
            </p>
          </Card>

          {/* 症状表现 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
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

          {/* 评分说明 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              📋 评分说明
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-muted-foreground">&lt; 50分：正常</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <span className="text-muted-foreground">50-59分：轻度</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-muted-foreground">60-69分：中度</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span className="text-muted-foreground">≥ 70分：重度</span>
              </div>
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
              🛠️ 实用应对策略
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

          {/* 推荐资源 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
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
          <Card className="p-6 shadow-card border-l-4 border-l-primary animate-slide-up" style={{ animationDelay: "0.35s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              ⚠️ 重要提示
            </h3>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>• 本测试基于焦虑自评量表（SAS），仅供参考，不能作为临床诊断依据</p>
              <p>• 测试结果可能受到多种因素影响，建议结合专业评估</p>
              <p>• 如果焦虑情绪持续影响生活，请及时寻求专业帮助</p>
              <p>• 适度的焦虑是正常的保护机制，关键是学会识别和调节</p>
              <p>• 心理健康和身体健康同样重要，值得被重视和呵护</p>
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
              <h1 className="text-xl font-bold text-foreground">焦虑自测量表</h1>
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

export default AnxietyTest;
