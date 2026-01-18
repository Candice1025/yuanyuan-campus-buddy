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

const DepressionTest = () => {
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

  // 抑郁自评量表(SDS)问题
  const questions = [
    { id: 0, question: "我感到情绪沮丧，郁闷" },
    { id: 1, question: "我感到早晨心情最好" },
    { id: 2, question: "我要哭或想哭" },
    { id: 3, question: "我夜间睡眠不好" },
    { id: 4, question: "我吃饭像平时一样多" },
    { id: 5, question: "我的性功能正常" },
    { id: 6, question: "我感到体重减轻" },
    { id: 7, question: "我为便秘烦恼" },
    { id: 8, question: "我的心跳比平时快" },
    { id: 9, question: "我无故感到疲劳" },
    { id: 10, question: "我的头脑像往常一样清楚" },
    { id: 11, question: "我做事情像平时一样不感到困难" },
    { id: 12, question: "我坐卧不安，难以保持平静" },
    { id: 13, question: "我对未来感到有希望" },
    { id: 14, question: "我比平时更容易激怒" },
    { id: 15, question: "我觉得决定什么事很容易" },
    { id: 16, question: "我感到自己是有用的和不可缺少的人" },
    { id: 17, question: "我的生活很有意义" },
    { id: 18, question: "假若我死了别人会过得更好" },
    { id: 19, question: "我仍旧喜爱自己平时喜爱的东西" }
  ];

  const options = [
    { value: 1, label: "没有或很少时间" },
    { value: 2, label: "小部分时间" },
    { value: 3, label: "相当多时间" },
    { value: 4, label: "绝大部分或全部时间" }
  ];

  // 反向计分题目 (序号从0开始，所以实际题号-1)
  const reverseScoreQuestions = [1, 4, 5, 10, 11, 13, 15, 16, 17, 19];

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
            test_type: "depression",
            test_name: "抑郁自评量表",
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
      emotional: { name: "情绪症状", score: 0, max: 0, questions: [0, 2, 14] },
      somatic: { name: "躯体症状", score: 0, max: 0, questions: [3, 4, 5, 6, 7, 8, 9, 12, 13] },
      cognitive: { name: "认知症状", score: 0, max: 0, questions: [10, 11, 15, 16, 17, 18, 19] },
      positive: { name: "积极情感", score: 0, max: 0, questions: [1] }
    };
    
    Object.entries(answers).forEach(([questionIndex, answer]) => {
      const index = parseInt(questionIndex);
      let score = reverseScoreQuestions.includes(index) ? (5 - answer) : answer;
      rawScore += score;
      
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

    if (standardScore < 53) {
      level = "正常";
      desc = "你的情绪状态良好，没有明显的抑郁症状";
      color = "bg-success";
      detailedAnalysis = "测试结果显示你目前的情绪状态处于健康范围内。你能够保持积极的生活态度，对日常活动有兴趣，睡眠和食欲也比较正常。这表明你具有良好的心理弹性和情绪调节能力。";
      symptoms = [
        "情绪稳定，能够体验到生活中的快乐",
        "对日常活动保持兴趣和动力",
        "睡眠和食欲基本正常",
        "能够正常社交和完成日常任务"
      ];
      suggestions = [
        "🌟 继续保持良好的生活习惯",
        "💪 坚持规律运动，增强心理韧性",
        "😊 培养积极的兴趣爱好",
        "👨‍👩‍👧‍👦 维持良好的社交关系",
        "🌱 学习情绪管理技巧，预防问题发生"
      ];
      copingStrategies = [
        "建立「情绪日记」习惯，记录每天的心情变化",
        "练习感恩：每天写下3件值得感谢的事",
        "保持社交连接，定期与朋友家人交流"
      ];
      resources = [
        { name: "积极心理学课程", desc: "学习提升幸福感的科学方法" },
        { name: "心理健康讲座", desc: "参与学校组织的心理健康活动" }
      ];
    } else if (standardScore < 63) {
      level = "轻度抑郁";
      desc = "你可能存在轻度抑郁倾向，需要关注";
      color = "bg-accent";
      detailedAnalysis = "测试结果显示你可能存在轻度抑郁倾向。你可能会偶尔感到情绪低落、对事物兴趣减退，或出现一些睡眠和食欲的变化。这种状态在大学生中并不罕见，通常与压力、适应问题或生活事件有关。通过积极调整，情况是可以改善的。";
      symptoms = [
        "偶尔感到情绪低落或沮丧",
        "对一些平时喜欢的活动兴趣减退",
        "有时感到疲劳或精力不足",
        "偶尔出现睡眠或食欲变化",
        "偶尔对未来感到担忧或悲观"
      ];
      suggestions = [
        "🗣️ 多与朋友家人交流，分享你的感受",
        "🏃‍♂️ 增加户外活动和体育运动",
        "📝 记录每天的积极事件和成就",
        "🎯 设定小目标并努力完成",
        "☀️ 增加阳光照射，规律作息",
        "💡 如持续不适，建议咨询心理老师"
      ];
      copingStrategies = [
        "行为激活：制定活动计划，逐步恢复日常生活",
        "认知重构：识别负面想法，用更客观的视角看问题",
        "社交支持：主动联系朋友，避免自我孤立",
        "自我关怀：像对待好朋友一样善待自己"
      ];
      resources = [
        { name: "校心理咨询中心", desc: "提供免费咨询服务，可预约" },
        { name: "心理健康APP", desc: "如小睡眠、潮汐等情绪调节工具" },
        { name: "运动社团", desc: "参与体育活动，提升多巴胺水平" }
      ];
    } else if (standardScore < 73) {
      level = "中度抑郁";
      desc = "你可能存在中度抑郁症状，建议寻求帮助";
      color = "bg-primary";
      detailedAnalysis = "测试结果表明你可能正在经历中度抑郁。这种程度的抑郁可能已经影响到你的日常功能，包括学习效率、社交活动和身体健康。你可能经常感到情绪低落、对事物失去兴趣、精力不足，甚至可能有负面的自我评价。建议你认真对待这个信号，主动寻求专业帮助。";
      symptoms = [
        "经常感到情绪低落、悲伤或空虚",
        "对大多数活动失去兴趣或快乐感",
        "明显的疲劳感，做事缺乏动力",
        "睡眠问题：失眠或嗜睡",
        "食欲和体重明显变化",
        "难以集中注意力，影响学习",
        "自我评价降低，觉得自己无用"
      ];
      suggestions = [
        "🏥 强烈建议预约学校心理咨询师",
        "👥 不要独自承受，告诉信任的人",
        "⏰ 保持规律的作息时间",
        "🍎 注意均衡饮食，避免酒精",
        "❌ 避免做重大决定",
        "📵 减少社交媒体使用时间"
      ];
      copingStrategies = [
        "结构化日程：为每天安排具体的活动",
        "小步前进：将任务分解，一次只做一件事",
        "身体活动：即使是短暂的散步也有帮助",
        "求助网络：建立可靠的支持系统"
      ];
      resources = [
        { name: "校心理咨询中心", desc: "预约专业心理咨询师进行评估" },
        { name: "辅导员/班主任", desc: "可协调学业压力和提供支持" },
        { name: "校医院", desc: "必要时可转介精神科就诊" },
        { name: "心理援助热线", desc: "12355（24小时）" }
      ];
    } else {
      level = "重度抑郁";
      desc = "你可能存在重度抑郁症状，强烈建议立即寻求专业帮助";
      color = "bg-destructive";
      detailedAnalysis = "测试结果显示你可能正在经历重度抑郁。这是一个需要认真对待的信号。你可能感到极度痛苦、绝望，日常功能可能严重受损。请记住，抑郁症是一种疾病，不是你的错，也不是软弱的表现。寻求帮助是勇敢和明智的选择，抑郁症是可以治疗的。";
      symptoms = [
        "持续的悲伤、绝望或空虚感",
        "几乎对所有活动失去兴趣",
        "严重的疲劳和精力丧失",
        "严重的睡眠障碍",
        "食欲和体重显著变化",
        "无价值感或过度的内疚",
        "可能出现自我伤害或死亡的想法"
      ];
      suggestions = [
        "🚨 请立即联系心理咨询师或医生",
        "📞 24小时心理援助热线：12355",
        "👨‍⚕️ 需要专业心理治疗，可能需要药物治疗",
        "👪 立即告知家人或信任的人",
        "🛡️ 确保自身安全是最重要的",
        "⏸️ 暂时减轻学业负担"
      ];
      copingStrategies = [
        "安全第一：如有自伤想法，立即寻求帮助",
        "不要独处：尽量与他人在一起",
        "保持基本生活：按时吃饭、保证睡眠",
        "一天一天来：不要想太远的未来"
      ];
      resources = [
        { name: "校心理危机干预热线", desc: "紧急情况请立即拨打" },
        { name: "医院精神科/心理科", desc: "进行专业评估和治疗" },
        { name: "北京心理危机研究与干预中心", desc: "010-82951332" },
        { name: "全国心理援助热线", desc: "400-161-9995（24小时）" },
        { name: "希望24热线", desc: "400-161-9995" }
      ];
    }

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
            <h1 className="text-2xl font-bold text-foreground">抑郁自测报告</h1>
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
              * 情绪症状：悲伤、哭泣等；躯体症状：睡眠、食欲等；认知症状：思维、兴趣、自我评价等
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
                <span className="text-muted-foreground">&lt; 53分：正常</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <span className="text-muted-foreground">53-62分：轻度</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-muted-foreground">63-72分：中度</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span className="text-muted-foreground">≥ 73分：重度</span>
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
              <p>• 本测试基于抑郁自评量表（SDS），仅供参考，不能作为临床诊断依据</p>
              <p>• 如果您感到持续的情绪低落或有自我伤害的想法，请立即寻求专业帮助</p>
              <p>• 抑郁症是一种疾病，不是性格缺陷或意志薄弱的表现</p>
              <p>• 寻求帮助是勇敢的表现，抑郁症是可以治疗的</p>
              <p>• 校内心理咨询室可以提供免费的专业支持</p>
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
              <h1 className="text-xl font-bold text-foreground">抑郁自评量表</h1>
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

export default DepressionTest;
