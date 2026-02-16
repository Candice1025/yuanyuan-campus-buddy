import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, AlertTriangle, CheckCircle, Info } from "lucide-react";
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

    // Depression / Anxiety / Stress type results
    if (parsed.standardScore !== undefined || parsed.score !== undefined) {
      return renderScaleResult(parsed);
    }

    // MBTI
    if (parsed.type && parsed.dimensions) {
      return renderMBTIResult(parsed);
    }

    // Holland career test
    if (parsed.code && parsed.primary && parsed.allScores) {
      return renderHollandResult(parsed);
    }

    // Enneagram
    if (parsed.type && parsed.name && parsed.wing !== undefined) {
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
    if (parsed.topStrengths) {
      return renderStrengthsResult(parsed);
    }

    // Learning style
    if (parsed.dominantStyle) {
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

  const renderScaleResult = (data: any) => {
    const score = data.standardScore ?? data.score ?? 0;
    const level = data.level ?? data.category ?? "未知";
    const desc = data.desc ?? data.description ?? "";
    const suggestions = data.suggestions ?? [];
    const symptoms = data.symptoms ?? [];

    const levelColor = level.includes("重度") ? "bg-destructive" :
      level.includes("中度") ? "bg-primary" :
      level.includes("轻度") ? "bg-accent" : "bg-success";

    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <div className={`w-20 h-20 rounded-full ${levelColor} flex items-center justify-center mx-auto mb-4`}>
            <span className="text-2xl font-bold text-white">{score}</span>
          </div>
          <Badge className={`${levelColor} text-white text-lg px-4 py-1 mb-3`}>{level}</Badge>
          {desc && <p className="text-muted-foreground mt-2">{desc}</p>}
        </Card>

        {data.detailedAnalysis && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" /> 详细分析
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.detailedAnalysis}</p>
          </Card>
        )}

        {data.dimensions && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-3">维度分析</h4>
            <div className="space-y-3">
              {Object.entries(data.dimensions).map(([key, dim]: [string, any]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{dim.name}</span>
                    <span className="text-muted-foreground">{dim.percentage ?? Math.round((dim.score / dim.max) * 100)}%</span>
                  </div>
                  <Progress value={dim.percentage ?? Math.round((dim.score / dim.max) * 100)} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {symptoms.length > 0 && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> 症状表现
            </h4>
            <ul className="space-y-1">
              {symptoms.map((s: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground">• {s}</li>
              ))}
            </ul>
          </Card>
        )}

        {suggestions.length > 0 && (
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-2">建议</h4>
            <ul className="space-y-1">
              {suggestions.map((s: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground">{s}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    );
  };

  const renderMBTIResult = (data: any) => (
    <div className="space-y-4">
      <Card className="p-6 text-center">
        <h3 className="text-3xl font-bold text-primary mb-2">{data.type}</h3>
        {data.name && <p className="text-lg text-foreground mb-1">{data.name}</p>}
        {data.desc && <p className="text-sm text-muted-foreground">{data.desc}</p>}
      </Card>
      {data.dimensions && (
        <Card className="p-5">
          <h4 className="font-semibold text-foreground mb-3">维度分析</h4>
          <div className="space-y-3">
            {Object.entries(data.dimensions).map(([key, dim]: [string, any]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{dim.label ?? key}</span>
                  <span className="text-muted-foreground">{dim.percentage ?? dim.score}%</span>
                </div>
                <Progress value={dim.percentage ?? dim.score ?? 50} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.traits && (
        <Card className="p-5">
          <h4 className="font-semibold text-foreground mb-2">性格特征</h4>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(data.traits) ? data.traits : data.traits.split(/[,，、]/)).map((t: string, i: number) => (
              <Badge key={i} variant="secondary">{t.trim()}</Badge>
            ))}
          </div>
        </Card>
      )}
      {data.careers && (
        <Card className="p-5">
          <h4 className="font-semibold text-foreground mb-2">适合职业</h4>
          <p className="text-sm text-muted-foreground">
            {Array.isArray(data.careers) ? data.careers.join("、") : data.careers}
          </p>
        </Card>
      )}
    </div>
  );

  const renderHollandResult = (data: any) => (
    <div className="space-y-4">
      <Card className="p-6 text-center">
        <h3 className="text-3xl font-bold text-primary mb-2">{data.code}</h3>
        <p className="text-lg text-foreground">{data.primary.name}</p>
        <p className="text-sm text-muted-foreground mt-1">{data.primary.desc}</p>
      </Card>
      {data.allScores && (
        <Card className="p-5">
          <h4 className="font-semibold text-foreground mb-3">各维度得分</h4>
          <div className="space-y-2">
            {Object.entries(data.allScores).map(([key, score]: [string, any]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{key}</span>
                  <span className="text-muted-foreground">{score}</span>
                </div>
                <Progress value={(score / 20) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      )}
      {[data.primary, data.secondary, data.tertiary].filter(Boolean).map((item: any, i: number) => (
        <Card key={i} className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={i === 0 ? "default" : "secondary"}>{i === 0 ? "主要" : i === 1 ? "次要" : "第三"}</Badge>
            <h4 className="font-semibold text-foreground">{item.name}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{item.desc}</p>
          {item.traits && <p className="text-sm"><span className="text-foreground font-medium">特质：</span><span className="text-muted-foreground">{item.traits}</span></p>}
          {item.careers && <p className="text-sm mt-1"><span className="text-foreground font-medium">推荐职业：</span><span className="text-muted-foreground">{item.careers}</span></p>}
        </Card>
      ))}
    </div>
  );

  const renderEnneagramResult = (data: any) => (
    <div className="space-y-4">
      <Card className="p-6 text-center">
        <h3 className="text-3xl font-bold text-primary mb-2">{data.type}号</h3>
        <p className="text-lg text-foreground">{data.name}</p>
        {data.wing && <Badge variant="secondary" className="mt-2">翼型: {data.wing}</Badge>}
      </Card>
      {data.desc && (
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{data.desc}</p>
        </Card>
      )}
      {data.traits && (
        <Card className="p-5">
          <h4 className="font-semibold text-foreground mb-2">核心特质</h4>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(data.traits) ? data.traits : data.traits.split(/[,，、]/)).map((t: string, i: number) => (
              <Badge key={i} variant="secondary">{t.trim()}</Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderAnimalResult = (data: any) => (
    <div className="space-y-4">
      <Card className="p-6 text-center">
        <div className="text-5xl mb-3">{data.primary.emoji ?? "🐾"}</div>
        <h3 className="text-2xl font-bold text-foreground mb-1">{data.primary.animal ?? data.primary.name}</h3>
        {data.primary.desc && <p className="text-sm text-muted-foreground">{data.primary.desc}</p>}
      </Card>
      {data.primary.traits && (
        <Card className="p-5">
          <h4 className="font-semibold text-foreground mb-2">性格特征</h4>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(data.primary.traits) ? data.primary.traits : data.primary.traits.split(/[,，、]/)).map((t: string, i: number) => (
              <Badge key={i} variant="secondary">{t.trim()}</Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderMentalAgeResult = (data: any) => (
    <div className="space-y-4">
      <Card className="p-6 text-center">
        <h3 className="text-4xl font-bold text-primary mb-2">{data.mentalAge}岁</h3>
        <p className="text-lg text-foreground">心理年龄</p>
        {data.desc && <p className="text-sm text-muted-foreground mt-2">{data.desc}</p>}
      </Card>
    </div>
  );

  const renderStrengthsResult = (data: any) => (
    <div className="space-y-4">
      <Card className="p-6">
        <h4 className="font-semibold text-foreground mb-3">你的核心优势</h4>
        <div className="space-y-3">
          {(data.topStrengths ?? []).map((s: any, i: number) => (
            <div key={i} className="flex items-start gap-3">
              <Badge className="flex-shrink-0">Top {i + 1}</Badge>
              <div>
                <p className="font-medium text-foreground">{s.name ?? s}</p>
                {s.desc && <p className="text-sm text-muted-foreground">{s.desc}</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderLearningResult = (data: any) => (
    <div className="space-y-4">
      <Card className="p-6 text-center">
        <h3 className="text-2xl font-bold text-primary mb-2">{data.dominantStyle}</h3>
        <p className="text-lg text-foreground">学习风格</p>
        {data.desc && <p className="text-sm text-muted-foreground mt-2">{data.desc}</p>}
      </Card>
      {data.scores && (
        <Card className="p-5">
          <h4 className="font-semibold text-foreground mb-3">各维度</h4>
          <div className="space-y-2">
            {Object.entries(data.scores).map(([key, val]: [string, any]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{key}</span>
                  <span className="text-muted-foreground">{val}</span>
                </div>
                <Progress value={typeof val === "number" ? (val / 20) * 100 : 50} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

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
