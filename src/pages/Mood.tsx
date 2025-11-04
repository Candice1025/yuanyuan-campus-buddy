import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const moods = [
  { emoji: "😊", label: "开心", color: "bg-success", intensity: 8 },
  { emoji: "😌", label: "平静", color: "bg-primary", intensity: 6 },
  { emoji: "😔", label: "难过", color: "bg-accent", intensity: 4 },
  { emoji: "😰", label: "焦虑", color: "bg-warning", intensity: 3 },
  { emoji: "😤", label: "愤怒", color: "bg-destructive", intensity: 2 },
];

const Mood = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchMoodHistory(user.id);
      }
    });
  }, []);

  const fetchMoodHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(30);

    if (!error && data) {
      const chartData = data.map(entry => ({
        date: new Date(entry.created_at).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        intensity: entry.intensity,
        mood: entry.mood,
      }));
      setMoodHistory(chartData);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast({
        title: "请选择心情",
        description: "选择一个最符合你现在心情的选项",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录才能保存心情日记",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    
    const selectedMoodData = moods.find(m => m.label === selectedMood);
    const { error } = await supabase
      .from('mood_entries')
      .insert({
        user_id: user.id,
        mood: selectedMood,
        content: note || null,
        intensity: selectedMoodData?.intensity || 5
      });

    setIsLoading(false);

    if (error) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "打卡成功！",
      description: "你的心情已记录 ✨",
    });

    // 刷新历史数据
    if (user) {
      fetchMoodHistory(user.id);
    }

    // 清空表单
    setSelectedMood("");
    setNote("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">每日心情打卡</h1>
            <p className="text-sm text-muted-foreground">记录你的情绪变化</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              今天的心情如何？
            </h2>
            <div className="grid grid-cols-5 gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => setSelectedMood(mood.label)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedMood === mood.label
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-4xl">{mood.emoji}</span>
                  <span className="text-sm font-medium text-foreground">
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              想说点什么吗？（可选）
            </h3>
            <Textarea
              placeholder="记录今天发生的事情或你的感受..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-32"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {isLoading ? "保存中..." : "记录今天的心情"}
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            心情统计
          </h3>
          {moodHistory.length > 0 ? (
            <div className="space-y-4">
              <ChartContainer
                config={{
                  intensity: {
                    label: "心情指数",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      domain={[0, 10]}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="intensity"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span>开心 (8-10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span>平静 (6-7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                  <span>难过 (4-5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span>焦虑 (3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span>愤怒 (1-2)</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              开始打卡，追踪你的情绪变化趋势 📊
            </p>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Mood;
