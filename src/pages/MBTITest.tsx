import { useState, useEffect, useRef } from "react";
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

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAnswer = (value: string) => {
    const updated = { ...answers, [currentQuestion]: value };
    setAnswers(updated);
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      setCurrentQuestion(prev =>
        prev < questions.length - 1 ? prev + 1 : prev
      );
      autoAdvanceTimer.current = null;
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
      ISTJ: { name: "物流师", desc: "实际、有责任心的组织者，注重传统和规则", color: "bg-primary", traits: ["可靠", "有条理", "注重细节", "务实", "责任心强", "一丝不苟"], strengths: ["极强的责任感和执行力", "注重细节，很少犯错", "忠诚可靠，值得信赖", "善于组织和管理"], weaknesses: ["可能过于固执，难以接受变化", "有时缺乏灵活性", "不善于表达情感", "可能过度关注规则"], careers: ["会计师", "审计员", "项目经理", "法律工作者", "公务员", "质量管理"], relationships: "在感情中你是忠诚可靠的伴侣，重视承诺和责任。你可能不善于浪漫表达，但会用实际行动表达关爱。建议多表达内心感受。", growth: "尝试接受变化和不确定性，培养灵活思维。多关注他人的情感需求，学会放松和享受当下。", famousPeople: ["沃伦·巴菲特", "安格拉·默克尔", "乔治·华盛顿"] },
      ISFJ: { name: "守卫者", desc: "温暖、体贴的保护者，默默付出关爱他人", color: "bg-primary", traits: ["忠诚", "有耐心", "细心", "支持他人", "谦虚", "善良"], strengths: ["极强的同理心和关怀能力", "可靠且有耐心", "记忆力强，关注细节", "默默奉献，不求回报"], weaknesses: ["容易过度牺牲自己", "难以拒绝他人", "不善于表达自身需求", "可能过于保守"], careers: ["护士", "社会工作者", "幼儿教育", "图书管理员", "人力资源", "心理咨询"], relationships: "你是温暖体贴的伴侣，总是把对方的需求放在首位。注意不要过度忽视自己的需求，学会在关系中建立健康的边界。", growth: "学会说不，设定个人边界。重视自身需求，不要总是为他人牺牲。尝试更主动地表达自己的想法和感受。", famousPeople: ["碧昂丝", "凯特王妃", "特蕾莎修女"] },
      INFJ: { name: "提倡者", desc: "理想主义的倡导者，追求深层意义和价值", color: "bg-primary", traits: ["有洞察力", "理想主义", "富有同情心", "有创造力", "坚定", "有远见"], strengths: ["深刻的洞察力和直觉", "强烈的使命感和价值观", "善于理解他人的动机", "富有创造力和想象力"], weaknesses: ["可能过于理想化", "容易被批评所伤", "有时脱离现实", "可能过度完美主义"], careers: ["心理咨询师", "作家", "教育家", "社会倡导者", "人力资源", "艺术治疗"], relationships: "你寻求深层的心灵连接，渴望真正理解和被理解。你是忠诚和富有洞察力的伴侣，但需要注意不要对关系抱有过高的理想化期待。", growth: "学会接受不完美，包括自己和他人的。将理想转化为可行的行动计划，避免过度内省。", famousPeople: ["马丁·路德·金", "尼尔森·曼德拉", "荣格"] },
      INTJ: { name: "建筑师", desc: "富有想象力的战略家，追求知识和完美", color: "bg-primary", traits: ["独立", "战略性思维", "追求知识", "高标准", "果断", "创新"], strengths: ["卓越的战略规划能力", "独立思考，不随波逐流", "高效的执行力", "持续学习和自我提升"], weaknesses: ["可能显得傲慢或冷漠", "对他人要求过高", "不善于处理情感问题", "可能过度自信"], careers: ["科学家", "系统架构师", "投资分析师", "企业战略顾问", "法官", "大学教授"], relationships: "你需要一个能进行深层次智性交流的伴侣。你可能不擅长表达情感，但会用行动证明你的承诺。建议多学习情感表达。", growth: "培养情商和人际敏感度，学会欣赏他人的优点。不要把所有事情都理性化，允许自己体验和表达情感。", famousPeople: ["埃隆·马斯克", "尼古拉·特斯拉", "史蒂芬·霍金"] },
      ISTP: { name: "鉴赏家", desc: "大胆灵活的实践者，善于解决实际问题", color: "bg-success", traits: ["冷静", "善于分析", "动手能力强", "适应力强", "好奇", "务实"], strengths: ["出色的问题解决能力", "冷静沉着，临危不惧", "动手能力强", "适应力极强"], weaknesses: ["可能过于冷淡疏离", "不善于表达情感", "容易感到厌倦", "可能冲动行事"], careers: ["工程师", "技术员", "飞行员", "运动员", "外科医生", "数据分析师"], relationships: "你需要个人空间和自由，不喜欢被束缚。你通过行动而非语言表达爱意。建议多与伴侣分享你的内心世界。", growth: "学会表达内心感受，不要总是用逻辑回避情感。培养长期规划能力，不要只活在当下。", famousPeople: ["迈克尔·乔丹", "克林特·伊斯特伍德", "布鲁斯·李"] },
      ISFP: { name: "探险家", desc: "灵活友善的艺术家，活在当下享受美好", color: "bg-success", traits: ["温和", "敏感", "艺术天赋", "活在当下", "友善", "谦虚"], strengths: ["敏锐的审美感觉", "善良温和，富有同情心", "灵活适应变化", "专注于当下体验"], weaknesses: ["容易逃避冲突", "可能缺乏长远规划", "过于敏感易受伤", "可能优柔寡断"], careers: ["设计师", "艺术家", "摄影师", "兽医", "厨师", "园艺师"], relationships: "你是温柔体贴的伴侣，善于感受和回应对方的情感需求。但你可能回避冲突，这可能导致问题积累。建议学会正面沟通。", growth: "培养面对冲突的勇气，学会为自己发声。制定长远目标，不要只沉浸在当下的感受中。", famousPeople: ["鲍勃·迪伦", "麦当娜", "大卫·鲍伊"] },
      INFP: { name: "调停者", desc: "诗意般的理想主义者，追求真实和意义", color: "bg-primary", traits: ["理想主义", "忠于价值观", "富有创造力", "善解人意", "开放", "富有想象力"], strengths: ["深刻的同理心和理解力", "强烈的价值观和道德感", "丰富的创造力和想象力", "善于激励和鼓舞他人"], weaknesses: ["可能过于理想化", "容易情绪化", "有时脱离现实", "可能过度自我批评"], careers: ["作家", "心理咨询师", "教师", "社工", "编辑", "人权工作者"], relationships: "你渴望深层的情感连接和灵魂伴侣。你是忠诚且富有诗意的伴侣，但需要注意不要过度理想化对方。接受真实的关系。", growth: "将理想转化为行动，不要只停留在想象中。学会接受不完美，培养实际的执行力。", famousPeople: ["莎士比亚", "J.R.R.托尔金", "威廉·莎士比亚"] },
      INTP: { name: "逻辑学家", desc: "创新的理论家，渴望理解宇宙的运作", color: "bg-primary", traits: ["好奇", "善于分析", "客观", "创新思维", "独立", "追求知识"], strengths: ["卓越的逻辑分析能力", "创新思维和解决问题", "求知欲强，博学多才", "客观理性，不受偏见影响"], weaknesses: ["可能过于理论化", "社交能力较弱", "容易忽视他人感受", "可能拖延执行"], careers: ["科研人员", "程序员", "哲学家", "数学家", "架构设计师", "游戏设计师"], relationships: "你需要一个能理解你内心世界的智性伴侣。你可能不善于浪漫表达，但你的忠诚和深度思考是你的优势。", growth: "培养执行力，不要只停留在思考阶段。学会关注和表达情感，提高社交技能。", famousPeople: ["爱因斯坦", "比尔·盖茨", "亚伯拉罕·林肯"] },
      ESTP: { name: "企业家", desc: "精明大胆的实干家，喜欢冒险和刺激", color: "bg-accent", traits: ["大胆", "行动派", "观察敏锐", "灵活应变", "直接", "社交能力强"], strengths: ["出色的危机处理能力", "观察力敏锐，反应迅速", "社交能力强，有说服力", "实践能力突出"], weaknesses: ["可能冲动行事", "不善于长期规划", "可能忽视他人感受", "容易追求刺激冒险"], careers: ["企业家", "销售经理", "运动教练", "消防员", "投资交易员", "公关经理"], relationships: "你是热情有趣的伴侣，喜欢给关系带来惊喜和冒险。但要注意不要只追求刺激而忽视了深层的情感连接。", growth: "培养耐心和长远规划能力。学会倾听他人感受，不要总是急于行动。考虑行动的长期影响。", famousPeople: ["唐纳德·特朗普", "杰克·尼克尔森", "麦当娜"] },
      ESFP: { name: "表演者", desc: "活力四射的娱乐者，享受生活的乐趣", color: "bg-accent", traits: ["热情", "友善", "自发性", "享受生活", "乐观", "充满活力"], strengths: ["极强的人际交往能力", "乐观积极，感染力强", "善于活跃气氛", "适应能力强"], weaknesses: ["可能缺乏长远规划", "容易分心", "可能回避严肃话题", "有时过度追求快乐"], careers: ["表演艺术", "活动策划", "旅游导游", "销售代表", "健身教练", "公共关系"], relationships: "你是充满活力和乐趣的伴侣，善于制造浪漫和惊喜。注意也要关注关系中的深层需求，不要回避严肃的情感话题。", growth: "培养专注力和纪律性。学会面对不愉快的现实，不要总是逃避到快乐中。制定和执行长期目标。", famousPeople: ["玛丽莲·梦露", "贾斯汀·比伯", "威尔·史密斯"] },
      ENFP: { name: "竞选者", desc: "热情自由的激励者，发现人生的可能性", color: "bg-accent", traits: ["热情", "有创造力", "善于社交", "乐观", "灵活", "富有想象力"], strengths: ["出色的沟通和激励能力", "创造力和想象力丰富", "善于发现他人潜力", "热情洋溢，感染力强"], weaknesses: ["可能过于理想化", "难以坚持长期项目", "可能过度承诺", "容易分心"], careers: ["记者", "广告创意", "培训师", "心理咨询师", "创业者", "社交媒体运营"], relationships: "你是热情浪漫的伴侣，总能给关系注入新鲜感。但要注意不要在新鲜感消退后失去兴趣，学会在平淡中发现爱。", growth: "提高执行力和专注度。学会完成已开始的项目，不要总是追求新的可能性。培养耐心和纪律。", famousPeople: ["罗宾·威廉姆斯", "马克·吐温", "奥普拉·温弗瑞"] },
      ENTP: { name: "辩论家", desc: "聪明好辩的思想家，喜欢挑战和创新", color: "bg-accent", traits: ["聪明", "好奇", "善于辩论", "创新", "精力充沛", "机智"], strengths: ["出色的辩论和说服能力", "创新思维，善于找到新角度", "知识面广", "适应力强，善于应变"], weaknesses: ["可能过于争辩", "不善于执行细节", "可能忽视他人感受", "容易对常规工作失去兴趣"], careers: ["律师", "创业者", "产品经理", "政治家", "战略顾问", "辩论教练"], relationships: "你喜欢在关系中进行智性辩论和交流。注意不要把争辩带入感情中，学会在需要的时候放下理性，拥抱情感。", growth: "学会把想法付诸实践。培养对他人感受的敏感度，不要为了辩赢而伤害他人。提高执行力。", famousPeople: ["本杰明·富兰克林", "托马斯·爱迪生", "马克·扎克伯格"] },
      ESTJ: { name: "总经理", desc: "出色的管理者，高效务实注重秩序", color: "bg-accent", traits: ["高效", "有组织力", "负责任", "务实", "果断", "可靠"], strengths: ["出色的组织和管理能力", "高效的执行力", "公正负责", "善于建立秩序和流程"], weaknesses: ["可能过于专制", "不够灵活变通", "可能忽视他人情感", "过度关注效率"], careers: ["企业管理者", "军官", "法官", "学校管理者", "银行经理", "运营总监"], relationships: "你是可靠负责的伴侣，提供稳定和安全感。注意不要在关系中过于控制，学会尊重伴侣的自主性和情感需求。", growth: "培养同理心和情感敏感度。学会授权和信任他人，不要试图控制一切。接受多元化的做事方式。", famousPeople: ["亨利·福特", "希拉里·克林顿", "杰克·韦尔奇"] },
      ESFJ: { name: "执政官", desc: "热心助人的主人，关心他人福祉", color: "bg-accent", traits: ["友善", "有责任心", "善于合作", "关心他人", "忠诚", "传统"], strengths: ["出色的人际协调能力", "热心帮助他人", "善于营造和谐氛围", "责任心强，忠诚可靠"], weaknesses: ["可能过度在意他人评价", "容易过度干涉他人", "不善于处理冲突", "可能过于传统保守"], careers: ["教师", "护士", "社工", "行政管理", "客服经理", "活动协调员"], relationships: "你是温暖关怀的伴侣，总是把对方的需求放在心上。注意不要过度牺牲自己，学会在满足他人和自我需求之间找到平衡。", growth: "学会设定健康的个人边界。不要过度在意他人的看法，培养独立思考的能力。接受适当的冲突是关系的一部分。", famousPeople: ["泰勒·斯威夫特", "史蒂夫·哈维", "詹妮弗·安妮斯顿"] },
      ENFJ: { name: "主人公", desc: "有魅力的领导者，善于激励和引导他人", color: "bg-accent", traits: ["有魅力", "善于鼓励", "有责任心", "善解人意", "可靠", "热情"], strengths: ["天生的领导力和影响力", "极强的同理心", "善于激励和引导他人", "出色的沟通能力"], weaknesses: ["可能过度牺牲自己", "容易受他人情绪影响", "可能过于理想化", "难以接受批评"], careers: ["教育家", "心理咨询师", "人力资源总监", "非营利组织领导", "培训师", "外交官"], relationships: "你是深情和有奉献精神的伴侣，善于理解和支持对方。注意不要忽视自己的需求，学会也接受他人的关爱和支持。", growth: "学会照顾自己的需求，不要总是为他人付出。接受不是每个人都能被帮助，培养健康的情感边界。", famousPeople: ["奥巴马", "奥普拉·温弗瑞", "马丁·路德·金"] },
      ENTJ: { name: "指挥官", desc: "大胆果断的领导者，追求效率和成就", color: "bg-accent", traits: ["果断", "高效", "战略眼光", "天生领导", "自信", "有远见"], strengths: ["卓越的领导和决策能力", "战略性思维，高瞻远瞩", "高效的执行力", "善于组织和动员资源"], weaknesses: ["可能过于强势和专制", "对他人要求过高", "不善于处理情感", "可能不够耐心"], careers: ["CEO", "企业家", "政治家", "管理顾问", "大学校长", "军事指挥官"], relationships: "你是强大而可靠的伴侣，追求高质量的关系。注意不要在关系中过于掌控，学会倾听和妥协。情感表达和效率同样重要。", growth: "培养耐心和温柔，学会接受不同的节奏和方式。关注他人的情感需求，在效率和人情味之间找到平衡。", famousPeople: ["史蒂夫·乔布斯", "拿破仑", "玛格丽特·撒切尔"] }
    };

    // 归一化每个维度得分，使每对总和为10
    const normalize = (a: number, b: number): [number, number] => {
      const total = a + b;
      if (total === 0) return [5, 5];
      return [Math.round((a / total) * 10), Math.round((b / total) * 10)];
    };
    const [eScore, iScore] = normalize(counts.E, counts.I);
    const [sScore, nScore] = normalize(counts.S, counts.N);
    const [tScore, fScore] = normalize(counts.T, counts.F);
    const [jScore, pScore] = normalize(counts.J, counts.P);

    const dimensionScores = {
      EI: { E: eScore, I: iScore },
      SN: { S: sScore, N: nScore },
      TF: { T: tScore, F: fScore },
      JP: { J: jScore, P: pScore }
    };

    return { ...results[type], type, dimensionScores };
  };

  if (showResult) {
    const result = getResult();
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/tests")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">MBTI测试报告</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* 主要结果 */}
          <Card className={`p-8 ${result.color} border-0 shadow-float text-white text-center animate-fade-in`}>
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-3">{result.type}</h2>
            <h3 className="text-2xl font-semibold mb-2">{result.name}</h3>
            <p className="text-xl opacity-90">{result.desc}</p>
          </Card>

          {/* 维度得分 */}
          <Card className="p-6 shadow-card animate-slide-up">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">📊 维度得分</h3>
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
                      <span className="text-foreground font-medium">{label1}: {scoreValues[0]}</span>
                      <span className="text-muted-foreground">{label2}: {scoreValues[1]}</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                      <div className="bg-primary transition-all" style={{ width: `${firstPercent}%` }} />
                      <div className="bg-primary/40 flex-1" />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4">* 数值越高代表该倾向越明显，得分接近说明你在此维度上较为平衡</p>
          </Card>

          {/* 性格特点 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">🧩 性格特点</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {result.traits.map((trait: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{trait}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 核心优势 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">💪 核心优势</h3>
            <div className="space-y-2">
              {result.strengths.map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-primary mt-1">✓</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 潜在挑战 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">⚡ 潜在挑战</h3>
            <div className="space-y-2">
              {result.weaknesses.map((w: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 人际关系 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">💕 人际关系</h3>
            <p className="text-muted-foreground leading-relaxed">{result.relationships}</p>
          </Card>

          {/* 适合的职业方向 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">💼 适合的职业方向</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {result.careers.map((career: string, i: number) => (
                <div key={i} className="p-2 rounded-lg bg-muted/30 text-muted-foreground text-sm text-center">
                  {career}
                </div>
              ))}
            </div>
          </Card>

          {/* 成长建议 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">🌱 成长建议</h3>
            <p className="text-muted-foreground leading-relaxed">{result.growth}</p>
          </Card>

          {/* 同类型名人 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.35s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">⭐ 同类型名人</h3>
            <div className="flex flex-wrap gap-3">
              {result.famousPeople.map((person: string, i: number) => (
                <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {person}
                </span>
              ))}
            </div>
          </Card>

          {/* 学习建议 */}
          <Card className="p-6 shadow-card animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">📝 学习建议</h3>
            <div className="space-y-3 text-muted-foreground">
              <p>📖 了解你的认知偏好，选择最适合自己的学习方式</p>
              <p>🎯 {result.type.includes("J") ? "利用你的计划能力，制定详细的学习时间表" : "保持灵活性的同时，设定清晰的学习里程碑"}</p>
              <p>👥 {result.type.includes("E") ? "通过小组讨论和分享来加深理解" : "为自己创造安静专注的学习环境"}</p>
              <p>💡 {result.type.includes("N") ? "先理解整体概念再深入细节" : "从具体例子入手，逐步建立知识体系"}</p>
              <p>⏰ {result.type.includes("T") ? "利用逻辑分析能力，建立知识框架" : "将学习内容与个人价值和兴趣联系起来"}</p>
            </div>
          </Card>

          {/* 重要提示 */}
          <Card className="p-6 shadow-card border-l-4 border-l-primary animate-slide-up" style={{ animationDelay: "0.45s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">⚠️ 重要提示</h3>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>• MBTI是一种性格偏好的参考工具，不是绝对的标签定义</p>
              <p>• 每种性格类型都有其独特的优势和价值，没有好坏之分</p>
              <p>• 人的性格会随着经历和成长而有所变化</p>
              <p>• 了解自己的类型有助于自我认识，但不应成为限制</p>
              <p>• 建议结合实际生活经验来理解和应用测试结果</p>
            </div>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/tests")}>
              返回测试中心
            </Button>
            <Button className="flex-1 bg-gradient-primary" onClick={() => navigate("/")}>
              回到首页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

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
            value={answers[currentQuestion] || ""}
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
