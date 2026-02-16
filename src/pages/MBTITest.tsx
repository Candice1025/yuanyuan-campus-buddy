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

const MBTITest = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
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

  // MBTI完整测试问题 - 24题，每题4选项
  const questions = [
    // E/I 维度（外向/内向）- 6题
    {
      id: 0,
      question: "在社交场合中，你通常：",
      options: [
        { value: "E2", label: "非常享受，主动成为话题中心" },
        { value: "E1", label: "比较喜欢，乐于和大家交流" },
        { value: "I1", label: "偶尔参与，更多时候在观察" },
        { value: "I2", label: "感到疲惫，希望尽快离开" }
      ]
    },
    {
      id: 1,
      question: "在小组项目中，你更倾向于：",
      options: [
        { value: "E2", label: "主动担任组长，协调大家分工" },
        { value: "E1", label: "积极分享想法，推动讨论进行" },
        { value: "I1", label: "先独立思考，再发表成熟观点" },
        { value: "I2", label: "倾向于独立完成自己的部分" }
      ]
    },
    {
      id: 2,
      question: "周末休息时，你更喜欢：",
      options: [
        { value: "E2", label: "组织朋友聚会，越热闹越开心" },
        { value: "E1", label: "约几个好友出去逛街或吃饭" },
        { value: "I1", label: "和一两个密友安静聊天" },
        { value: "I2", label: "独自在家看书、看剧或打游戏" }
      ]
    },
    {
      id: 3,
      question: "认识新朋友时，你通常：",
      options: [
        { value: "E2", label: "很快就能聊开，留下联系方式" },
        { value: "E1", label: "主动打招呼，尝试找共同话题" },
        { value: "I1", label: "等对方先开口，再慢慢回应" },
        { value: "I2", label: "比较拘谨，需要很长时间才能熟悉" }
      ]
    },
    {
      id: 4,
      question: "获得能量的方式：",
      options: [
        { value: "E2", label: "与人交流让我精力充沛" },
        { value: "E1", label: "适度社交可以提升我的状态" },
        { value: "I1", label: "需要独处时间来恢复能量" },
        { value: "I2", label: "只有独处才能让我真正放松" }
      ]
    },
    {
      id: 5,
      question: "在课堂上，你更喜欢：",
      options: [
        { value: "E2", label: "积极举手发言，参与讨论" },
        { value: "E1", label: "小组讨论时分享自己的看法" },
        { value: "I1", label: "认真听讲，有问题下课再问" },
        { value: "I2", label: "默默记笔记，不太愿意发言" }
      ]
    },
    // S/N 维度（实感/直觉）- 6题
    {
      id: 6,
      question: "当学习新知识时，你更倾向于：",
      options: [
        { value: "S2", label: "需要具体的例子和实际应用" },
        { value: "S1", label: "关注事实、数据和细节" },
        { value: "N1", label: "思考整体概念和背后原理" },
        { value: "N2", label: "联想到各种可能性和创新应用" }
      ]
    },
    {
      id: 7,
      question: "面对问题时，你首先会：",
      options: [
        { value: "S2", label: "回顾过去类似的经验和方法" },
        { value: "S1", label: "收集具体信息，分析已知数据" },
        { value: "N1", label: "思考问题的深层原因和含义" },
        { value: "N2", label: "探索全新的可能性和创新方案" }
      ]
    },
    {
      id: 8,
      question: "做作业或任务时，你更喜欢：",
      options: [
        { value: "S2", label: "严格按照要求和既定步骤完成" },
        { value: "S1", label: "参考成功的案例和模板" },
        { value: "N1", label: "在要求的基础上加入自己的理解" },
        { value: "N2", label: "发挥想象力，尝试全新的方法" }
      ]
    },
    {
      id: 9,
      question: "老师讲课时，你更关注：",
      options: [
        { value: "S2", label: "具体的公式、步骤和操作方法" },
        { value: "S1", label: "实际的例子和应用场景" },
        { value: "N1", label: "知识点之间的联系和规律" },
        { value: "N2", label: "背后的原理和深层含义" }
      ]
    },
    {
      id: 10,
      question: "描述一件事情时，你倾向于：",
      options: [
        { value: "S2", label: "按时间顺序详细描述细节" },
        { value: "S1", label: "说明具体发生了什么事" },
        { value: "N1", label: "概括主要内容和意义" },
        { value: "N2", label: "用比喻和隐喻来表达感受" }
      ]
    },
    {
      id: 11,
      question: "对于未来，你更：",
      options: [
        { value: "S2", label: "制定详细可行的短期计划" },
        { value: "S1", label: "根据现实情况做实际打算" },
        { value: "N1", label: "有大致的方向和长远目标" },
        { value: "N2", label: "充满各种美好的想象和可能" }
      ]
    },
    // T/F 维度（思考/情感）- 6题
    {
      id: 12,
      question: "做决定时，你更看重：",
      options: [
        { value: "T2", label: "客观数据和逻辑分析结果" },
        { value: "T1", label: "利弊得失和效率考量" },
        { value: "F1", label: "对他人的影响和感受" },
        { value: "F2", label: "内心的价值观和情感认同" }
      ]
    },
    {
      id: 13,
      question: "同学向你求助时，你会：",
      options: [
        { value: "T2", label: "直接分析问题并给出解决方案" },
        { value: "T1", label: "指出问题所在，提供建议" },
        { value: "F1", label: "先表示理解，再一起想办法" },
        { value: "F2", label: "先安慰对方情绪，陪伴倾听" }
      ]
    },
    {
      id: 14,
      question: "评价一件事时，你更注重：",
      options: [
        { value: "T2", label: "是否符合逻辑和客观标准" },
        { value: "T1", label: "是否高效和有实际意义" },
        { value: "F1", label: "是否照顾到了大家的感受" },
        { value: "F2", label: "是否符合自己的价值观" }
      ]
    },
    {
      id: 15,
      question: "别人批评你时，你会：",
      options: [
        { value: "T2", label: "理性分析批评是否有道理" },
        { value: "T1", label: "思考如何改进和提升" },
        { value: "F1", label: "先关注对方的态度和情绪" },
        { value: "F2", label: "可能会感到受伤和难过" }
      ]
    },
    {
      id: 16,
      question: "与他人发生分歧时，你会：",
      options: [
        { value: "T2", label: "用事实和逻辑说服对方" },
        { value: "T1", label: "客观分析双方的观点" },
        { value: "F1", label: "尝试理解对方的立场" },
        { value: "F2", label: "倾向于妥协以维护关系" }
      ]
    },
    {
      id: 17,
      question: "选择朋友时，你更看重：",
      options: [
        { value: "T2", label: "对方的能力和可靠性" },
        { value: "T1", label: "共同的兴趣和话题" },
        { value: "F1", label: "相处时的感觉和默契" },
        { value: "F2", label: "对方的善良和真诚" }
      ]
    },
    // J/P 维度（判断/知觉）- 6题
    {
      id: 18,
      question: "对待计划和时间，你更喜欢：",
      options: [
        { value: "J2", label: "提前详细规划，严格执行" },
        { value: "J1", label: "有大致计划，按时完成" },
        { value: "P1", label: "保持灵活，根据情况调整" },
        { value: "P2", label: "随性而为，享受意外惊喜" }
      ]
    },
    {
      id: 19,
      question: "完成作业时，你通常：",
      options: [
        { value: "J2", label: "收到任务就开始做，提前完成" },
        { value: "J1", label: "制定计划，按时间节点推进" },
        { value: "P1", label: "看心情和状态，但会按时完成" },
        { value: "P2", label: "临近截止日期才有动力完成" }
      ]
    },
    {
      id: 20,
      question: "整理书包或房间时，你：",
      options: [
        { value: "J2", label: "定期整理，物品分类有序" },
        { value: "J1", label: "基本整洁，找东西比较方便" },
        { value: "P1", label: "有点乱但自己知道在哪" },
        { value: "P2", label: "比较随意，找不到就再买" }
      ]
    },
    {
      id: 21,
      question: "面对突发变化时，你：",
      options: [
        { value: "J2", label: "感到不安，希望尽快恢复计划" },
        { value: "J1", label: "有些困扰，但会重新安排" },
        { value: "P1", label: "觉得无所谓，灵活应对" },
        { value: "P2", label: "反而觉得有趣，享受变化" }
      ]
    },
    {
      id: 22,
      question: "旅行时，你更喜欢：",
      options: [
        { value: "J2", label: "提前规划好每个景点和时间" },
        { value: "J1", label: "有大致行程，留些自由时间" },
        { value: "P1", label: "只定住宿，其他随心而定" },
        { value: "P2", label: "完全不做计划，走到哪算哪" }
      ]
    },
    {
      id: 23,
      question: "对于规则和截止日期，你：",
      options: [
        { value: "J2", label: "严格遵守，从不拖延" },
        { value: "J1", label: "基本遵守，偶尔灵活处理" },
        { value: "P1", label: "觉得可以商量和调整" },
        { value: "P2", label: "经常拖到最后一刻" }
      ]
    }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
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
            test_type: "mbti",
            test_name: "MBTI人格测试",
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
    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    Object.values(answers).forEach((answer) => {
      const dimension = answer.charAt(0) as keyof typeof counts;
      const weight = parseInt(answer.charAt(1));
      counts[dimension] += weight;
    });

    const type = 
      (counts.E > counts.I ? "E" : "I") +
      (counts.S > counts.N ? "S" : "N") +
      (counts.T > counts.F ? "T" : "F") +
      (counts.J > counts.P ? "J" : "P");

    const results: Record<string, any> = {
      ISTJ: { name: "物流师", desc: "实际、有责任心的组织者，注重传统和规则", color: "bg-primary", traits: ["可靠", "有条理", "注重细节", "务实", "责任心强", "一丝不苟"] },
      ISFJ: { name: "守卫者", desc: "温暖、体贴的保护者，默默付出关爱他人", color: "bg-primary", traits: ["忠诚", "有耐心", "细心", "支持他人", "谦虚", "善良"] },
      INFJ: { name: "提倡者", desc: "理想主义的倡导者，追求深层意义和价值", color: "bg-primary", traits: ["有洞察力", "理想主义", "富有同情心", "有创造力", "坚定", "有远见"] },
      INTJ: { name: "建筑师", desc: "富有想象力的战略家，追求知识和完美", color: "bg-primary", traits: ["独立", "战略性思维", "追求知识", "高标准", "果断", "创新"] },
      ISTP: { name: "鉴赏家", desc: "大胆灵活的实践者，善于解决实际问题", color: "bg-success", traits: ["冷静", "善于分析", "动手能力强", "适应力强", "好奇", "务实"] },
      ISFP: { name: "探险家", desc: "灵活友善的艺术家，活在当下享受美好", color: "bg-success", traits: ["温和", "敏感", "艺术天赋", "活在当下", "友善", "谦虚"] },
      INFP: { name: "调停者", desc: "诗意般的理想主义者，追求真实和意义", color: "bg-primary", traits: ["理想主义", "忠于价值观", "富有创造力", "善解人意", "开放", "富有想象力"] },
      INTP: { name: "逻辑学家", desc: "创新的理论家，渴望理解宇宙的运作", color: "bg-primary", traits: ["好奇", "善于分析", "客观", "创新思维", "独立", "追求知识"] },
      ESTP: { name: "企业家", desc: "精明大胆的实干家，喜欢冒险和刺激", color: "bg-accent", traits: ["大胆", "行动派", "观察敏锐", "灵活应变", "直接", "社交能力强"] },
      ESFP: { name: "表演者", desc: "活力四射的娱乐者，享受生活的乐趣", color: "bg-accent", traits: ["热情", "友善", "自发性", "享受生活", "乐观", "充满活力"] },
      ENFP: { name: "竞选者", desc: "热情自由的激励者，发现人生的可能性", color: "bg-accent", traits: ["热情", "有创造力", "善于社交", "乐观", "灵活", "富有想象力"] },
      ENTP: { name: "辩论家", desc: "聪明好辩的思想家，喜欢挑战和创新", color: "bg-accent", traits: ["聪明", "好奇", "善于辩论", "创新", "精力充沛", "机智"] },
      ESTJ: { name: "总经理", desc: "出色的管理者，高效务实注重秩序", color: "bg-accent", traits: ["高效", "有组织力", "负责任", "务实", "果断", "可靠"] },
      ESFJ: { name: "执政官", desc: "热心助人的主人，关心他人福祉", color: "bg-accent", traits: ["友善", "有责任心", "善于合作", "关心他人", "忠诚", "传统"] },
      ENFJ: { name: "主人公", desc: "有魅力的领导者，善于激励和引导他人", color: "bg-accent", traits: ["有魅力", "善于鼓励", "有责任心", "善解人意", "可靠", "热情"] },
      ENTJ: { name: "指挥官", desc: "大胆果断的领导者，追求效率和成就", color: "bg-accent", traits: ["果断", "高效", "战略眼光", "天生领导", "自信", "有远见"] }
    };

    const dimensionScores = {
      EI: { E: counts.E, I: counts.I },
      SN: { S: counts.S, N: counts.N },
      TF: { T: counts.T, F: counts.F },
      JP: { J: counts.J, P: counts.P }
    };

    return { ...results[type], type, dimensionScores };
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
            <h1 className="text-2xl font-bold text-foreground">测试结果</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className={`p-8 ${result.color} border-0 shadow-float text-white text-center mb-8 animate-fade-in`}>
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-3">{result.type}</h2>
            <h3 className="text-2xl font-semibold mb-2">{result.name}</h3>
            <p className="text-xl opacity-90">{result.desc}</p>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up">
            <h3 className="text-xl font-semibold text-foreground mb-4">维度得分</h3>
            <div className="space-y-4">
              {Object.entries(result.dimensionScores).map(([dimension, scores]) => {
                const scoresObj = scores as { [key: string]: number };
                const labels: Record<string, [string, string]> = {
                  EI: ["外向(E)", "内向(I)"],
                  SN: ["实感(S)", "直觉(N)"],
                  TF: ["思考(T)", "情感(F)"],
                  JP: ["判断(J)", "感知(P)"]
                };
                const [label1, label2] = labels[dimension];
                const scoreValues = Object.values(scoresObj);
                const total = scoreValues.reduce((a, b) => a + b, 0);
                const firstPercent = total > 0 ? (scoreValues[0] / total) * 100 : 50;
                return (
                  <div key={dimension}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{label1}: {scoreValues[0]}</span>
                      <span>{label2}: {scoreValues[1]}</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                      <div className="bg-primary transition-all" style={{ width: `${firstPercent}%` }} />
                      <div className="bg-primary/40 flex-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4">性格特点</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {result.traits.map((trait: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{trait}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4">学习建议</h3>
            <div className="space-y-3 text-muted-foreground">
              <p>📝 尝试将抽象概念与具体例子结合</p>
              <p>🎯 设定明确的学习目标，保持专注</p>
              <p>👥 寻找学习伙伴，互相鼓励和支持</p>
              <p>⏰ 合理安排时间，避免拖延</p>
              <p>💡 了解自己的优势，选择适合的学习方式</p>
            </div>
          </Card>

          <div className="flex gap-4">
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
              <h1 className="text-xl font-bold text-foreground">MBTI人格测试</h1>
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
            value={answers[currentQuestion]}
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            {currentQ.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-primary hover:bg-primary/5 ${
                  answers[currentQuestion] === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => handleAnswer(option.value)}
              >
                <RadioGroupItem value={option.value} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
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

export default MBTITest;
