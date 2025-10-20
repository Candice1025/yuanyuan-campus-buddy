import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Settings, Trophy, Calendar, Brain, Heart, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AvatarConfig {
  face_type: string;
  hairstyle: string;
  eyes: string;
  eyebrows: string;
  nose: string;
  mouth: string;
  skin_tone: string;
  outfit: string;
  accessories: string;
}

const avatarOptions = {
  face_type: [
    { value: "oval", emoji: "😊" },
    { value: "round", emoji: "😄" },
    { value: "square", emoji: "😐" },
    { value: "heart", emoji: "😍" }
  ],
  hairstyle: [
    { value: "short", emoji: "👦" },
    { value: "long", emoji: "👧" },
    { value: "ponytail", emoji: "👱‍♀️" },
    { value: "bob", emoji: "💇" },
    { value: "curly", emoji: "🦱" },
    { value: "bun", emoji: "🥖" }
  ],
  eyes: [
    { value: "normal", emoji: "👁️" },
    { value: "big", emoji: "👀" },
    { value: "small", emoji: "😌" },
    { value: "sparkle", emoji: "✨" }
  ],
  accessories: [
    { value: "none", emoji: "" },
    { value: "glasses", emoji: "👓" },
    { value: "hat", emoji: "🎩" },
    { value: "headband", emoji: "🎀" },
    { value: "earrings", emoji: "💎" },
    { value: "necklace", emoji: "📿" }
  ]
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    // Load avatar config
    const { data } = await supabase
      .from("avatar_configs")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setAvatarConfig(data);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("已退出登录");
    navigate("/auth");
  };

  const getAvatarEmoji = () => {
    if (!avatarConfig) return "👤";
    
    const face = avatarOptions.face_type.find(o => o.value === avatarConfig.face_type)?.emoji || "😊";
    const hair = avatarOptions.hairstyle.find(o => o.value === avatarConfig.hairstyle)?.emoji || "👦";
    const accessory = avatarConfig.accessories && avatarConfig.accessories !== "none" 
      ? (avatarOptions.accessories?.find(o => o.value === avatarConfig.accessories)?.emoji || "")
      : "";
    return `${face}${hair}${accessory}`;
  };

  const getSkinColor = () => {
    if (!avatarConfig || !avatarConfig.skin_tone) return "#FFE5D9";
    const skinToneOptions = [
      { value: "light", color: "#FFE5D9" },
      { value: "medium", color: "#E8B4A0" },
      { value: "tan", color: "#D4A373" },
      { value: "dark", color: "#8B6F47" }
    ];
    return skinToneOptions.find(o => o.value === avatarConfig.skin_tone)?.color || "#FFE5D9";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  const stats = [
    { label: "完成测试", value: 12, icon: Brain, color: "text-primary" },
    { label: "心情记录", value: 45, icon: Heart, color: "text-accent" },
    { label: "连续打卡", value: 7, icon: Calendar, color: "text-success" },
  ];

  const achievements = [
    { title: "初心者", desc: "完成首次测试", unlocked: true },
    { title: "探索家", desc: "完成5个不同测试", unlocked: true },
    { title: "坚持者", desc: "连续7天打卡", unlocked: true },
    { title: "分享达人", desc: "发布10条树洞", unlocked: false },
  ];

  const recentTests = [
    { name: "MBTI人格测试", date: "2天前", result: "INFP-T 调停者", color: "bg-primary" },
    { name: "压力值测试", date: "5天前", result: "轻度压力", color: "bg-accent" },
    { name: "学习风格测试", date: "1周前", result: "视觉型学习者", color: "bg-success" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground flex-1">个人中心</h1>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="退出登录">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Profile Card */}
      <section className="px-4 pt-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 shadow-float border-0 bg-gradient-primary text-white">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/40 cursor-pointer hover:scale-105 transition-transform shadow-lg"
                  onClick={() => navigate("/avatar")}
                  title="自定义形象"
                  style={{ backgroundColor: getSkinColor() }}
                >
                  {getAvatarEmoji()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-white flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{user?.email?.split("@")[0] || "用户"}</h2>
                <p className="text-primary-light mb-3">探索中的少年</p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => navigate("/avatar")}
                  className="mb-3"
                >
                  自定义形象
                </Button>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-light">成长等级</span>
                    <span className="font-semibold">Lv.5</span>
                  </div>
                  <Progress value={65} className="h-2 bg-white/20" />
                  <p className="text-xs text-primary-light">距离下一级还需350经验</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4 text-center shadow-card hover:shadow-soft transition-all">
                <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Achievements */}
      <section className="px-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">我的成就</h3>
            <Trophy className="w-5 h-5 text-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <Card
                key={achievement.title}
                className={`p-4 ${
                  achievement.unlocked
                    ? "shadow-card hover:shadow-soft"
                    : "opacity-50 bg-muted"
                } transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${
                      achievement.unlocked ? "bg-gradient-warm" : "bg-muted-foreground/20"
                    } flex items-center justify-center text-white flex-shrink-0`}
                  >
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {achievement.desc}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Tests */}
      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">最近测试</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tests")}
            >
              查看全部 →
            </Button>
          </div>
          <div className="space-y-3">
            {recentTests.map((test, index) => (
              <Card
                key={index}
                className="p-4 shadow-card hover:shadow-soft transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${test.color} flex items-center justify-center flex-shrink-0`}>
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1">{test.name}</h4>
                    <p className="text-sm text-muted-foreground">{test.date}</p>
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0">
                    {test.result}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mood Tracking Preview */}
      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 bg-gradient-fresh border-0 shadow-soft text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">心情追踪</h3>
                <p className="text-white/90 text-sm">记录你的情绪变化</p>
              </div>
              <Heart className="w-8 h-8" />
            </div>
            <div className="flex gap-2 mb-4">
              {["😊", "😌", "😐", "😔", "😄"].map((emoji, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl cursor-pointer hover:bg-white/30 transition-colors"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate("/mood")}
            >
              查看详细记录
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Profile;
