import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, AlertTriangle, CheckCircle, Info, Heart, Lightbulb, BookOpen, Phone, Shield, Target, TrendingUp, Users, Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  id: string;
  test_name: string;
  test_type: string;
  result: string;
  created_at: string;
}

const TestResultDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [test, setTest] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data } = await supabase
        .from("test_results")
        .select("*")
        .eq("id", id!)
        .eq("user_id", session.user.id)
        .maybeSingle();

      setTest(data);
      setLoading(false);
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">未找到测试记录</p>
          <Button onClick={() => navigate("/profile")}>返回</Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const renderResult = () => {
    let parsed: any;
    try {
      parsed = JSON.parse(test.result);
    } catch {
      return renderSimpleResult(test.result);
    }

    if (typeof parsed !== "object" || parsed === null) {
      return renderSimpleResult(String(parsed));
    }

    // Depression / Anxiety / Stress scale results
    if (parsed.standardScore !== undefined || parsed.totalScore !== undefined || parsed.percentage !== undefined) {
      return renderScaleResult(parsed);
    }

    // MBTI
    if (parsed.type && parsed.dimensionScores) {
      return renderMBTIResult(parsed);
    }

    // Holland career test
    if (parsed.code && parsed.primary && parsed.allScores) {
      return renderHollandResult(parsed);
    }

    // Enneagram
    if (parsed.primary && parsed.primary.type && parsed.primary.core) {
      return renderEnneagramResult(parsed);
    }

    // Animal personality
    if (parsed.primary && parsed.primary.animal) {
      return renderAnimalResult(parsed);
    }

    // Mental age
    if (parsed.mentalAge !== undefined) {
      return renderMentalAgeResult(parsed);
    }

    // Strengths finder
    if (parsed.topThemes) {
      return renderStrengthsResult(parsed);
    }

    // Learning style
    if (parsed.type && parsed.scores && parsed.strengths) {
      return renderLearningResult(parsed);
    }

    // Generic object
    return renderGenericResult(parsed);
  };

  const renderSimpleResult = (result: string) => (
    <Card className="p-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">测试结果</h3>
        <Badge variant="secondary" className="text-lg px-4 py-1">{result}</Badge>
      </div>
    </Card>
  );

  /* ==================== Scale Results (Depression / Anxiety / Stress) ==================== */
  const renderScaleResult = (data: any) => {
    const score = data.standardScore ?? data.totalScore ?? data.score ?? 0;
    const level = data.level ?? data.category ?? "未知";
    const desc = data.desc ?? data.description ?? "";
    const suggestions = data.suggestions ?? [];
    const symptoms = data.symptoms ?? [];
    const copingStrategies = data.copingStrategies ?? [];
    const resources = data.resources ?? [];
    const stressManagement = data.stressManagement ?? [];
    const detailedAnalysis = data.detailedAnalysis ?? "";
    const dimensionResults = data.dimensionResults ?? [];

    const levelColor = level.includes("重度") || level.includes("高度") ? "bg-destructive" :
      level.includes("中度") ? "bg-primary" :
      level.includes("轻度") ? "bg-accent" : "bg-success";

    return (
      <div className="space-y-4">
        {/* Score Card */}
        <Card className="p-6 text-center">
          <div className={`w-24 h-24 rounded-full ${levelColor} flex items-center justify-center mx-auto mb-4`}>
            <span className="text-3xl font-bold text-white">{score}</span>
          </div>
          <Badge className={`${levelColor} text-white text-lg px-6 py-1.5 mb-3`}>{level}</Badge>
          {desc && <p className="text-muted-foreground mt-3 leading-relaxed">{desc}</p>}
          {data.rawScore !== undefined && (
            <p className="text-xs text-muted-foreground mt-2">原始分: {data.rawScore} | 标准分: {data.standardScore}</p>
          )}
          {data.percentage !== undefined && (
            <p className="text-xs text-muted-foreground mt-2">压力指数: {data.percentage}%</p>
          )}
        </Card>

        {/* Detailed Analysis */}
        {detailedAnalysis && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" /> 详细分析
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{detailedAnalysis}</p>
          </Card>
        )}

        {/* Dimension Analysis */}
        {dimensionResults.length > 0 && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> 维度分析
            </h4>
            <div className="space-y-4">
              {dimensionResults.map((dim: any) => (
                <div key={dim.key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-foreground font-medium">{dim.name}</span>
                    <span className="text-muted-foreground">{dim.percentage}%</span>
                  </div>
                  <Progress value={dim.percentage} className="h-2.5" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {dim.percentage >= 75 ? "⚠️ 该维度得分较高，需要重点关注" :
                     dim.percentage >= 50 ? "💡 该维度得分中等，建议适当调节" :
                     "✅ 该维度状态良好"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Symptoms */}
        {symptoms.length > 0 && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" /> 主要表现
            </h4>
            <ul className="space-y-2">
              {symptoms.map((s: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-destructive/60 mt-0.5">•</span> {s}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Coping Strategies */}
        {copingStrategies.length > 0 && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> 应对策略
            </h4>
            <ul className="space-y-2">
              {copingStrategies.map((s: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">💡</span> {s}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Stress Management (stress test specific) */}
        {stressManagement.length > 0 && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> 压力管理技巧
            </h4>
            <ul className="space-y-2">
              {stressManagement.map((s: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">🎯</span> {s}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-accent" /> 专业建议
            </h4>
            <ul className="space-y-2">
              {suggestions.map((s: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground">{s}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* Resources */}
        {resources.length > 0 && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" /> 推荐资源
            </h4>
            <div className="space-y-3">
              {resources.map((r: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="p-4 bg-muted/30 border-dashed">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            ⚠️ 本测试结果仅供参考，不构成医学诊断。如您感到严重不适，请及时寻求专业心理咨询师或医生的帮助。
            全国24小时心理援助热线：<span className="font-semibold">12355</span>
          </p>
        </Card>
      </div>
    );
  };

  /* ==================== MBTI Result ==================== */
  const renderMBTIResult = (data: any) => {
    const mbtiDescriptions: Record<string, { strengths: string[]; weaknesses: string[]; relationships: string; careers: string[]; growth: string[] }> = {
      ISTJ: { strengths: ["责任心极强", "注重细节", "组织能力出色", "值得信赖"], weaknesses: ["过于固执", "不善表达感情", "对变化抵触"], relationships: "在关系中忠诚可靠，重视承诺和传统。需要学会更加灵活和表达情感。", careers: ["会计师", "审计师", "项目经理", "法官", "工程师"], growth: ["练习接受变化和不确定性", "学会表达情感而非只是行动", "对新想法保持开放态度"] },
      ISFJ: { strengths: ["温暖体贴", "忠诚可靠", "观察细致", "耐心持久"], weaknesses: ["过度牺牲自己", "害怕冲突", "不善拒绝"], relationships: "在关系中默默付出，善于照顾他人。需要学会表达自己的需求。", careers: ["护士", "社工", "教师", "人力资源", "行政管理"], growth: ["学会说'不'，设立健康边界", "关注自身需求，不仅是他人", "勇敢表达不同意见"] },
      INFJ: { strengths: ["深刻洞察力", "富有同情心", "理想主义", "善于激励他人"], weaknesses: ["过于理想化", "容易精疲力竭", "过度敏感"], relationships: "追求深层的精神连接，重视真诚和意义。需要学会接受不完美。", careers: ["心理咨询师", "作家", "教育家", "社会工作者", "非营利组织管理"], growth: ["接受现实的不完美", "保护自己的精力边界", "将理想付诸实际行动"] },
      INTJ: { strengths: ["战略思维", "独立自主", "追求卓越", "创新能力强"], weaknesses: ["过于自负", "对人缺乏耐心", "完美主义"], relationships: "在关系中理性务实，重视智力上的匹配。需要学会理解他人的情感。", careers: ["科学家", "战略顾问", "系统架构师", "投资分析师", "大学教授"], growth: ["发展情商和同理心", "接受他人不同的做事方式", "在追求完美中找到平衡"] },
      ISTP: { strengths: ["冷静沉着", "动手能力强", "善于分析", "灵活应变"], weaknesses: ["情感疏离", "冒险倾向", "承诺困难"], relationships: "在关系中需要独立空间，通过行动而非语言表达关心。", careers: ["工程师", "技术专家", "飞行员", "运动员", "法医"], growth: ["练习表达内心感受", "学会长期规划", "发展与人深入交往的能力"] },
      ISFP: { strengths: ["温和友善", "审美能力强", "活在当下", "忠于自我"], weaknesses: ["过于敏感", "回避冲突", "难以长期规划"], relationships: "在关系中温柔体贴，享受和谐的相处。需要学会面对冲突。", careers: ["设计师", "摄影师", "音乐家", "厨师", "理疗师"], growth: ["勇敢面对冲突，表达不满", "学习制定长期目标", "拓展舒适区"] },
      INFP: { strengths: ["创造力丰富", "忠于价值观", "善解人意", "适应性强"], weaknesses: ["过度理想化", "拖延症", "过于自我批评"], relationships: "追求理想化的深度关系，重视精神共鸣。需要学会接受现实。", careers: ["作家", "心理咨询师", "艺术家", "图书管理员", "社会工作者"], growth: ["将想法转化为行动", "对自己温柔一些", "平衡理想与现实"] },
      INTP: { strengths: ["逻辑严密", "创新思维", "求知欲强", "独立思考"], weaknesses: ["社交能力弱", "过度分析", "忽视日常事务"], relationships: "在关系中需要智力刺激，重视思想交流。需要学会关注他人感受。", careers: ["程序员", "数学家", "哲学家", "研究员", "架构师"], growth: ["发展社交技能", "从分析走向行动", "关注他人的情感需求"] },
      ESTP: { strengths: ["行动力强", "观察敏锐", "适应力强", "社交能力好"], weaknesses: ["缺乏耐心", "冲动行事", "忽视长远"], relationships: "在关系中充满活力和乐趣。需要学会耐心和深入的情感交流。", careers: ["企业家", "销售经理", "运动教练", "消防员", "急诊医生"], growth: ["培养耐心，学会等待", "思考行为的长远影响", "发展深入思考能力"] },
      ESFP: { strengths: ["热情开朗", "善于社交", "乐观积极", "适应性强"], weaknesses: ["注意力分散", "逃避问题", "过于随性"], relationships: "在关系中充满热情和乐趣，善于营造快乐氛围。需要学会面对严肃话题。", careers: ["演员", "活动策划", "导游", "公关", "儿童教育"], growth: ["学会面对不舒服的话题", "提升规划能力", "在享乐和责任间找到平衡"] },
      ENFP: { strengths: ["热情洋溢", "创意无限", "善于激励", "共情能力强"], weaknesses: ["难以专注", "过于理想化", "缺乏执行力"], relationships: "在关系中充满热情和创意，善于发现他人潜力。需要学会持续投入。", careers: ["记者", "创业者", "心理咨询师", "广告创意", "培训师"], growth: ["培养专注力和执行力", "学会坚持一个项目到底", "平衡热情与实际"] },
      ENTP: { strengths: ["思维敏捷", "创新能力强", "善于辩论", "充满好奇心"], weaknesses: ["缺乏耐心", "忽视细节", "争论上瘾"], relationships: "在关系中智慧风趣，善于挑战和激发思考。需要学会倾听。", careers: ["创业者", "律师", "产品经理", "发明家", "策略顾问"], growth: ["学会倾听而非只是辩论", "注重细节和落地执行", "培养同理心"] },
      ESTJ: { strengths: ["组织能力强", "高效务实", "负责任", "逻辑清晰"], weaknesses: ["过于强势", "缺乏灵活性", "忽视他人感受"], relationships: "在关系中可靠负责，善于组织和管理。需要学会考虑他人感受。", careers: ["企业管理", "军官", "法官", "财务总监", "行政总监"], growth: ["学会倾听不同声音", "提升情商", "接受并非所有事都能控制"] },
      ESFJ: { strengths: ["关心他人", "有责任心", "善于合作", "忠诚可靠"], weaknesses: ["过于在意他人评价", "缺乏主见", "回避冲突"], relationships: "在关系中慷慨热情，善于照顾他人需求。需要学会关注自己。", careers: ["人力资源", "护理", "教师", "客服经理", "社区管理"], growth: ["学会说'不'", "发展独立思考能力", "减少对外部认可的依赖"] },
      ENFJ: { strengths: ["有魅力", "善于激励", "有责任心", "善解人意"], weaknesses: ["过度关注他人", "完美主义", "容易过劳"], relationships: "在关系中慷慨付出，善于理解和支持他人。需要学会自我关怀。", careers: ["教育管理", "心理咨询", "人力资源总监", "NGO领导", "培训师"], growth: ["优先照顾自己的需求", "接受不能帮到所有人", "设立健康的情感边界"] },
      ENTJ: { strengths: ["天生领导力", "战略眼光", "高效决策", "自信果断"], weaknesses: ["过于强势", "忽视情感", "对失败缺乏容忍"], relationships: "在关系中直接坦率，追求共同成长。需要学会展示脆弱和温柔。", careers: ["CEO", "战略顾问", "投资银行家", "政治家", "法律顾问"], growth: ["发展温情和耐心", "接受失败是成长的一部分", "学会示弱和求助"] }
    };

    const extra = mbtiDescriptions[data.type] || null;

    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <h3 className="text-4xl font-bold text-primary mb-2">{data.type}</h3>
          {data.name && <p className="text-xl font-semibold text-foreground mb-1">{data.name}</p>}
          {data.desc && <p className="text-sm text-muted-foreground leading-relaxed">{data.desc}</p>}
        </Card>

        {/* Dimension Scores */}
        {data.dimensionScores && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> 四维度得分
            </h4>
            <div className="space-y-4">
              {Object.entries(data.dimensionScores).map(([dimension, scores]: [string, any]) => {
                const labels: Record<string, [string, string]> = {
                  EI: ["外向(E)", "内向(I)"], SN: ["实感(S)", "直觉(N)"],
                  TF: ["思考(T)", "情感(F)"], JP: ["判断(J)", "感知(P)"]
                };
                const [label1, label2] = labels[dimension] || [dimension, ""];
                const vals = Object.values(scores) as number[];
                const total = vals[0] + vals[1];
                const pct = total > 0 ? (vals[0] / total) * 100 : 50;
                return (
                  <div key={dimension}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-foreground">{label1}: {vals[0]}</span>
                      <span className="font-medium text-foreground">{label2}: {vals[1]}</span>
                    </div>
                    <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                      <div className="bg-primary transition-all rounded-l-full" style={{ width: `${pct}%` }} />
                      <div className="bg-primary/30 flex-1 rounded-r-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Traits */}
        {data.traits && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> 性格特征
            </h4>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(data.traits) ? data.traits : data.traits.split(/[,，、]/)).map((t: string, i: number) => (
                <Badge key={i} variant="secondary" className="px-3 py-1">{t.trim()}</Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Strengths & Weaknesses */}
        {extra && (
          <>
            <Card className="p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> 核心优势
              </h4>
              <ul className="space-y-2">
                {extra.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" /> 潜在挑战
              </h4>
              <ul className="space-y-2">
                {extra.weaknesses.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive/60 mt-0.5">!</span> {s}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" /> 人际关系
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{extra.relationships}</p>
            </Card>

            <Card className="p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> 适合职业
              </h4>
              <div className="flex flex-wrap gap-2">
                {extra.careers.map((c, i) => (
                  <Badge key={i} variant="outline" className="px-3 py-1">{c}</Badge>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> 成长方向
              </h4>
              <ul className="space-y-2">
                {extra.growth.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">🌱</span> {s}
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </div>
    );
  };

  /* ==================== Holland Result ==================== */
  const renderHollandResult = (data: any) => {
    const hollandInsights: Record<string, { env: string; values: string; advice: string }> = {
      R: { env: "喜欢户外、动手操作的环境", values: "重视实际成果和技术能力", advice: "多参与实践项目和技能培训" },
      I: { env: "喜欢安静、独立思考的环境", values: "重视知识和智慧", advice: "多阅读、参加学术活动" },
      A: { env: "喜欢自由、不受约束的环境", values: "重视创造力和自我表达", advice: "参加艺术社团，培养创造力" },
      S: { env: "喜欢与人合作的社交环境", values: "重视帮助他人和社会责任", advice: "参加志愿活动和社交社团" },
      E: { env: "喜欢竞争性、领导性环境", values: "重视影响力和成就感", advice: "参加学生组织和创业活动" },
      C: { env: "喜欢有序、规范的工作环境", values: "重视稳定性和准确性", advice: "学习数据分析和管理工具" }
    };

    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <h3 className="text-4xl font-bold text-primary mb-2 tracking-wider">{data.code}</h3>
          <p className="text-lg text-foreground font-semibold">{data.primary.name}</p>
          <p className="text-sm text-muted-foreground mt-1">{data.primary.desc}</p>
        </Card>

        {/* All Scores */}
        {data.allScores && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> 六维度得分
            </h4>
            <div className="space-y-3">
              {Object.entries(data.allScores).map(([key, score]: [string, any]) => {
                const names: Record<string, string> = { R: "现实型", I: "研究型", A: "艺术型", S: "社会型", E: "企业型", C: "常规型" };
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground font-medium">{key} - {names[key] || key}</span>
                      <span className="text-muted-foreground">{score}分</span>
                    </div>
                    <Progress value={(score / 15) * 100} className="h-2.5" />
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Primary/Secondary/Tertiary Details */}
        {[data.primary, data.secondary, data.tertiary].filter(Boolean).map((item: any, i: number) => {
          const insight = hollandInsights[item.type];
          return (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={i === 0 ? "default" : "secondary"}>{i === 0 ? "🥇 主要类型" : i === 1 ? "🥈 次要类型" : "🥉 第三类型"}</Badge>
                <h4 className="font-semibold text-foreground">{item.name}</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
              {item.traits && <p className="text-sm mb-1"><span className="text-foreground font-medium">特质：</span><span className="text-muted-foreground">{item.traits}</span></p>}
              {item.careers && <p className="text-sm mb-2"><span className="text-foreground font-medium">推荐职业：</span><span className="text-muted-foreground">{item.careers}</span></p>}
              {insight && (
                <div className="mt-3 p-3 rounded-lg bg-muted/50 space-y-1">
                  <p className="text-xs text-muted-foreground">🏢 {insight.env}</p>
                  <p className="text-xs text-muted-foreground">💎 {insight.values}</p>
                  <p className="text-xs text-muted-foreground">📌 {insight.advice}</p>
                </div>
              )}
            </Card>
          );
        })}

        <Card className="p-4 bg-muted/30 border-dashed">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            💡 霍兰德职业兴趣理论将人的职业兴趣分为6种类型（RIASEC），三字母代码代表你最突出的三个类型组合，帮助你找到更适合的职业方向。
          </p>
        </Card>
      </div>
    );
  };

  /* ==================== Enneagram Result ==================== */
  const renderEnneagramResult = (data: any) => {
    const growthDirections: Record<number, { integration: string; disintegration: string; advice: string[] }> = {
      1: { integration: "压力下走向4型（情绪化），成长走向7型（放松快乐）", disintegration: "学会接受不完美", advice: ["练习自我接纳", "允许自己犯错", "培养幽默感"] },
      2: { integration: "压力下走向8型（控制），成长走向4型（自我认知）", disintegration: "学会关注自己的需求", advice: ["学会说'不'", "识别自己的真实需求", "不要通过帮助他人获得价值感"] },
      3: { integration: "压力下走向9型（懒惰），成长走向6型（忠诚合作）", disintegration: "学会真实面对自己", advice: ["区分自我价值和成就", "允许自己展示脆弱", "培养真诚的人际关系"] },
      4: { integration: "压力下走向2型（讨好），成长走向1型（自律行动）", disintegration: "学会行动而非沉溺情绪", advice: ["建立日常规律", "将创造力付诸实践", "避免过度自我沉溺"] },
      5: { integration: "压力下走向7型（分散），成长走向8型（自信行动）", disintegration: "学会走出舒适区", advice: ["增加社交互动", "从思考走向行动", "分享自己的知识和感受"] },
      6: { integration: "压力下走向3型（形象），成长走向9型（平和信任）", disintegration: "学会信任自己和他人", advice: ["减少过度担忧", "培养自信", "面对恐惧而非逃避"] },
      7: { integration: "压力下走向1型（批判），成长走向5型（深入专注）", disintegration: "学会深入和坚持", advice: ["练习专注一件事", "面对痛苦而非逃避", "培养深度思考"] },
      8: { integration: "压力下走向5型（退缩），成长走向2型（关怀他人）", disintegration: "学会温柔和脆弱", advice: ["练习倾听他人", "允许自己展示柔软", "控制力量的运用"] },
      9: { integration: "压力下走向6型（焦虑），成长走向3型（行动力）", disintegration: "学会表达自己的意见", advice: ["培养主动性和行动力", "不要回避冲突", "认识到自己的重要性"] }
    };

    const p = data.primary;
    const growth = growthDirections[p.type];

    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <h3 className="text-4xl font-bold text-primary mb-2">{p.type}号</h3>
          <p className="text-xl font-semibold text-foreground">{p.name}</p>
          <p className="text-sm text-muted-foreground mt-2">{p.core}</p>
        </Card>

        {/* Fear & Desire */}
        {(p.fear || p.desire) && (
          <div className="grid grid-cols-2 gap-3">
            {p.fear && (
              <Card className="p-4 bg-destructive/5">
                <p className="text-xs font-semibold text-destructive mb-1">核心恐惧</p>
                <p className="text-sm text-muted-foreground">{p.fear}</p>
              </Card>
            )}
            {p.desire && (
              <Card className="p-4 bg-success/5">
                <p className="text-xs font-semibold text-success mb-1">核心渴望</p>
                <p className="text-sm text-muted-foreground">{p.desire}</p>
              </Card>
            )}
          </div>
        )}

        {/* Traits */}
        {p.traits && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-2">性格特质</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.traits}</p>
          </Card>
        )}

        {/* Secondary Type */}
        {data.secondary && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-2">副型：{data.secondary.type}号 - {data.secondary.name}</h4>
            <p className="text-sm text-muted-foreground">{data.secondary.core}</p>
          </Card>
        )}

        {/* Growth Direction */}
        {growth && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> 成长与压力方向
            </h4>
            <p className="text-sm text-muted-foreground mb-3">{growth.integration}</p>
            <h5 className="text-sm font-medium text-foreground mb-2">成长建议：</h5>
            <ul className="space-y-1.5">
              {growth.advice.map((a, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">🌱</span> {a}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Score Distribution */}
        {data.allScores && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-3">九型得分分布</h4>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6,7,8,9].map(type => (
                <div key={type} className={`text-center p-2 rounded-lg ${type === p.type ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'}`}>
                  <div className={`font-bold ${type === p.type ? 'text-primary' : 'text-foreground'}`}>{type}型</div>
                  <div className="text-sm text-muted-foreground">{data.allScores[type] || 0}分</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  /* ==================== Animal Personality ==================== */
  const renderAnimalResult = (data: any) => {
    const animalInsights: Record<string, { socialStyle: string; workStyle: string; growthTips: string[] }> = {
      lion: { socialStyle: "直接果断，天生的领导者", workStyle: "目标导向，追求效率", growthTips: ["学会倾听他人", "培养耐心", "接受不同观点"] },
      dolphin: { socialStyle: "活泼开朗，善于沟通", workStyle: "创意丰富，团队协作", growthTips: ["培养专注力", "注重细节", "完善执行力"] },
      owl: { socialStyle: "冷静理性，深思熟虑", workStyle: "分析型，追求精确", growthTips: ["增强行动力", "适度表达情感", "接受不完美"] },
      koala: { socialStyle: "温和友善，善于倾听", workStyle: "稳重可靠，团队型", growthTips: ["勇于表达意见", "提升决断力", "学会说不"] },
      cat: { socialStyle: "独立自主，选择性社交", workStyle: "注重品质，追求完美", growthTips: ["增加团队合作", "学会妥协", "更开放地表达"] },
      dog: { socialStyle: "热情忠诚，社交广泛", workStyle: "勤奋努力，服务他人", growthTips: ["设立个人边界", "学会拒绝", "关注自身需求"] }
    };

    const p = data.primary;
    const insight = animalInsights[p.animal?.toLowerCase()];

    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <div className="text-6xl mb-3">{p.emoji ?? "🐾"}</div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{p.animal ?? p.name}</h3>
          {p.desc && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.desc}</p>}
        </Card>

        {p.traits && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-2">性格特征</h4>
            <div className="flex flex-wrap gap-2">
              {(typeof p.traits === 'string' ? p.traits.split(/[,，、]/) : p.traits).map((t: string, i: number) => (
                <Badge key={i} variant="secondary" className="px-3 py-1">{t.trim()}</Badge>
              ))}
            </div>
          </Card>
        )}

        {insight && (
          <>
            <Card className="p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> 社交与工作风格
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">社交风格：</span>{insight.socialStyle}</p>
                <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">工作风格：</span>{insight.workStyle}</p>
              </div>
            </Card>
            <Card className="p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> 成长建议
              </h4>
              <ul className="space-y-2">
                {insight.growthTips.map((t, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">🌱</span> {t}
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}

        {/* Secondary & Tertiary */}
        {data.secondary && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-2">次要特征：{data.secondary.emoji} {data.secondary.name}</h4>
            <p className="text-sm text-muted-foreground">{data.secondary.desc}</p>
          </Card>
        )}
        {data.tertiary && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-2">潜在特征：{data.tertiary.emoji} {data.tertiary.name}</h4>
            <p className="text-sm text-muted-foreground">{data.tertiary.desc}</p>
          </Card>
        )}

        <Card className="p-4 bg-muted/30 border-dashed">
          <p className="text-xs text-muted-foreground text-center">
            🐾 每个人都拥有多种动物特质的组合，这使你成为独一无二的个体。了解自己的性格特点，可以帮助你更好地发挥优势、改善人际关系。
          </p>
        </Card>
      </div>
    );
  };

  /* ==================== Mental Age ==================== */
  const renderMentalAgeResult = (data: any) => {
    const ageDiff = data.difference ?? (data.mentalAge - (data.actualAge || 20));
    const insights = ageDiff < -5
      ? { icon: "🌟", tips: ["保持好奇心和探索精神", "你的年轻心态是宝贵财富", "适当增加深度思考时间", "平衡活力和成熟"] }
      : ageDiff <= 5
      ? { icon: "🎯", tips: ["你的心态非常健康均衡", "继续保持积极的生活方式", "既有活力又有成熟的思考", "是非常理想的心理状态"] }
      : { icon: "🧘", tips: ["适当放松，不必事事追求完美", "培养轻松愉快的兴趣爱好", "多与年轻人交流互动", "学会享受当下"] };

    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <div className="text-5xl mb-2">{insights.icon}</div>
          <h3 className="text-5xl font-bold text-primary mb-2">{data.mentalAge}岁</h3>
          <p className="text-lg text-foreground font-medium">心理年龄</p>
          {data.category && <Badge variant="secondary" className="mt-2 text-base px-4 py-1">{data.category}</Badge>}
          {data.description && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{data.description}</p>}
        </Card>

        {data.actualAge && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> 年龄对比
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{data.actualAge}</p>
                <p className="text-xs text-muted-foreground">实际年龄</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <p className="text-2xl font-bold text-primary">{data.mentalAge}</p>
                <p className="text-xs text-muted-foreground">心理年龄</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className={`text-2xl font-bold ${ageDiff > 0 ? 'text-accent' : 'text-success'}`}>{ageDiff > 0 ? '+' : ''}{ageDiff}</p>
                <p className="text-xs text-muted-foreground">差异值</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-5">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" /> 个性化建议
          </h4>
          <ul className="space-y-2">
            {[...(data.suggestions || []), ...insights.tips].slice(0, 6).map((s: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">💡</span> {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    );
  };

  /* ==================== Strengths Finder ==================== */
  const renderStrengthsResult = (data: any) => {
    const themes = data.topThemes ?? [];
    const categories = data.categories ?? {};

    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="text-2xl font-bold text-primary mb-2">你的五大核心优势</h3>
          <p className="text-sm text-muted-foreground">这些是你最突出的才干，充分发挥它们将帮助你取得成功</p>
        </Card>

        <div className="space-y-3">
          {themes.map((theme: any, index: number) => (
            <Card key={index} className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h4 className="font-bold text-lg text-foreground">{theme.name}</h4>
                    {theme.category && (
                      <Badge variant="outline" className="text-xs">{theme.category}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{theme.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {Object.keys(categories).length > 0 && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> 优势分布
            </h4>
            <div className="space-y-3">
              {Object.entries(categories).map(([category, count]: [string, any]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{category}</span>
                    <span className="text-muted-foreground">{count}/5</span>
                  </div>
                  <Progress value={(count / 5) * 100} className="h-2.5" />
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-5">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" /> 如何发挥你的优势
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">1.</span> 在学习和工作中刻意运用你的优势，而非弥补弱点</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">2.</span> 寻找能发挥这些优势的课外活动和项目</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">3.</span> 与拥有不同优势的人合作，实现互补</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">4.</span> 持续投入你的优势领域，让优势成为你的核心竞争力</li>
          </ul>
        </Card>

        <Card className="p-4 bg-muted/30 border-dashed">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            💡 盖洛普优势理论认为，专注于发展自己的优势比弥补弱点更有效。了解并运用这些优势，可以帮助你获得更大的成就感和效能。
          </p>
        </Card>
      </div>
    );
  };

  /* ==================== Learning Style ==================== */
  const renderLearningResult = (data: any) => {
    const learningDetails: Record<string, { fullDesc: string; studyEnv: string; examTips: string[]; tools: string[] }> = {
      V: { fullDesc: "作为视觉学习者，你通过看和观察来学习最有效。你善于记忆图表、图像和空间关系，在课堂上喜欢看板书和PPT，笔记中常用颜色和图形。", studyEnv: "光线明亮、整洁有序的环境，减少视觉干扰", examTips: ["将知识点制作成思维导图回顾", "用不同颜色标注重点", "回忆课堂上老师的板书画面"], tools: ["思维导图软件(XMind)", "荧光笔和彩色笔记", "教学视频和动画", "可视化笔记工具"] },
      A: { fullDesc: "作为听觉学习者，你通过听讲和讨论来学习最有效。你善于记忆声音信息，喜欢课堂讲解和小组讨论，常通过自言自语来帮助思考。", studyEnv: "安静或有适度背景音乐的环境", examTips: ["复习时大声朗读关键内容", "录制自己的复习总结音频", "与同学讨论和互相提问"], tools: ["录音笔/手机录音", "有声书和播客", "音频课程平台", "学习小组讨论"] },
      R: { fullDesc: "作为读写学习者，你通过阅读和写作来学习最有效。你喜欢文字信息，善于从教材和文献中提取知识，常通过写笔记和总结来加深理解。", studyEnv: "安静的图书馆或书房环境", examTips: ["做详细的笔记和要点总结", "将知识重写成自己的话", "制作要点清单和大纲"], tools: ["笔记软件(Notion/Obsidian)", "纸质笔记本", "电子书阅读器", "写作平台"] },
      K: { fullDesc: "作为动觉学习者，你通过动手操作和身体参与来学习最有效。你喜欢实验、角色扮演和实际操作，坐着不动反而会影响你的注意力。", studyEnv: "允许走动和活动的空间", examTips: ["边走动边回顾知识点", "用手势辅助记忆", "将知识与实际经验联系"], tools: ["实验和实践项目", "闪卡(边走边用)", "模型和教具", "身体活动式学习"] }
    };

    const detail = learningDetails[data.type] || null;

    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <div className="text-5xl mb-3">{data.icon}</div>
          <h3 className="text-2xl font-bold text-primary mb-2">{data.name}</h3>
          <p className="text-sm text-muted-foreground">{data.desc}</p>
        </Card>

        {/* Score Distribution */}
        {data.scores && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> 学习风格分布
            </h4>
            <div className="space-y-3">
              {Object.entries(data.scores as Record<string, number>).map(([style, score]) => {
                const names: Record<string, string> = { V: "视觉型", A: "听觉型", R: "读写型", K: "动觉型" };
                const icons: Record<string, string> = { V: "👁️", A: "👂", R: "📚", K: "🤸" };
                const total = Object.values(data.scores as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
                const pct = total > 0 ? Math.round((score / total) * 100) : 25;
                return (
                  <div key={style}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground font-medium">{icons[style]} {names[style]}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2.5" />
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Detailed Description */}
        {detail && (
          <>
            <Card className="p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" /> 深度解读
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{detail.fullDesc}</p>
              <div className="mt-3 p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">🏠 <span className="font-medium">最佳学习环境：</span>{detail.studyEnv}</p>
              </div>
            </Card>

            {/* Strengths */}
            {data.strengths && (
              <Card className="p-5">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" /> 学习优势
                </h4>
                <ul className="space-y-2">
                  {data.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-success mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Study Tips */}
            {data.tips && (
              <Card className="p-5">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" /> 学习方法建议
                </h4>
                <ul className="space-y-2">
                  {data.tips.map((t: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">{t}</li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Exam Tips */}
            <Card className="p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> 考试复习策略
              </h4>
              <ul className="space-y-2">
                {detail.examTips.map((t, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">📝</span> {t}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Recommended Tools */}
            <Card className="p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> 推荐学习工具
              </h4>
              <div className="flex flex-wrap gap-2">
                {detail.tools.map((t, i) => (
                  <Badge key={i} variant="outline" className="px-3 py-1">{t}</Badge>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    );
  };

  /* ==================== Generic Result ==================== */
  const renderGenericResult = (data: any) => (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]: [string, any]) => (
        <Card key={key} className="p-5">
          <h4 className="font-semibold text-foreground mb-1 capitalize">{key}</h4>
          <p className="text-sm text-muted-foreground">
            {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
          </p>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{test.test_name}</h1>
            <p className="text-xs text-muted-foreground">{formatDate(test.created_at)}</p>
          </div>
        </div>
      </header>

      <section className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {renderResult()}
        </div>
      </section>
    </div>
  );
};

export default TestResultDetail;
