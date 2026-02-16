import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const TestHistory = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<
    Array<{
      id: string;
      test_name: string;
      result: string;
      created_at: string;
      test_type: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data } = await supabase
        .from("test_results")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setTests(data ?? []);
      setLoading(false);
    };
    load();
  }, [navigate]);

  const getTestColor = (testType: string) => {
    const colors: Record<string, string> = {
      mbti: "bg-primary", learning: "bg-success", stress: "bg-accent",
      depression: "bg-destructive", anxiety: "bg-warning"
    };
    return colors[testType] || "bg-primary";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  const formatTestResult = (result: string) => {
    try {
      const parsed = JSON.parse(result);
      if (parsed.primary?.name) return parsed.primary.name;
      if (parsed.mentalAge !== undefined) return `心理年龄 ${parsed.mentalAge}岁`;
      if (parsed.code) return parsed.code;
      if (parsed.type && parsed.name) return `${parsed.type}号 ${parsed.name}`;
      if (typeof parsed === "object") {
        if (parsed.name) return parsed.name;
        if (parsed.result) return parsed.result;
        if (parsed.category) return parsed.category;
        return "查看详情";
      }
      return result;
    } catch {
      return result;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">全部测试记录</h1>
        </div>
      </header>

      <section className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">加载中...</div>
          ) : tests.length > 0 ? (
            <div className="space-y-3">
              {tests.map((test) => {
                const badgeText = formatTestResult(test.result);
                return (
                  <Card key={test.id} className="p-4 shadow-card hover:shadow-soft transition-all cursor-pointer" onClick={() => navigate(`/test-result/${test.id}`)}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${getTestColor(test.test_type)} flex items-center justify-center flex-shrink-0`}>
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1">{test.test_name}</h4>
                        <p className="text-sm text-muted-foreground">{formatDate(test.created_at)}</p>
                      </div>
                      <Badge variant="secondary" title={badgeText} className="flex-shrink-0 max-w-40 truncate">
                        {badgeText}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">还没有测试记录</p>
              <Button onClick={() => navigate("/tests")}>开始测试</Button>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default TestHistory;
