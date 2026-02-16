import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trophy, Calendar, Brain, Heart, LogOut, User, Edit, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [uploading, setUploading] = useState(false);
  const [recentTests, setRecentTests] = useState<
    Array<{
      id: string;
      test_name: string;
      result: string;
      created_at: string;
      test_type: string;
    }>
  >([]);
  const [totalTests, setTotalTests] = useState(0);
  const [moodCount, setMoodCount] = useState(0);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [treeHolePostsCount, setTreeHolePostsCount] = useState(0);
  const [uniqueTestTypes, setUniqueTestTypes] = useState(0);

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
    await loadProfile(session.user.id);
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      setUsername(data.username || "");
      setNewUsername(data.username || "");
      setAvatarUrl(data.avatar_url);
    }

    // Load test results (recent + total count)
    const {
      data: testData,
      error: testError,
      count,
    } = await supabase
      .from("test_results")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!testError && testData) {
      setRecentTests(testData);
      setTotalTests(count ?? testData.length);
      
      // Calculate unique test types
      const uniqueTypes = new Set(testData.map(t => t.test_type));
      // Need to fetch all test types for accurate count
      const { data: allTests } = await supabase
        .from("test_results")
        .select("test_type")
        .eq("user_id", userId);
      if (allTests) {
        const allUniqueTypes = new Set(allTests.map(t => t.test_type));
        setUniqueTestTypes(allUniqueTypes.size);
      }
    } else {
      setRecentTests([]);
      setTotalTests(0);
    }

    // Load mood entries count
    const { count: moodEntriesCount } = await supabase
      .from("mood_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    setMoodCount(moodEntriesCount ?? 0);

    // Calculate consecutive days from mood entries
    const { data: moodData } = await supabase
      .from("mood_entries")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (moodData && moodData.length > 0) {
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get unique dates
      const uniqueDates = [...new Set(moodData.map(m => {
        const d = new Date(m.created_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }))].sort((a, b) => b - a);
      
      // Check if today or yesterday has entry
      const todayTime = today.getTime();
      const yesterdayTime = todayTime - 24 * 60 * 60 * 1000;
      
      if (uniqueDates[0] === todayTime || uniqueDates[0] === yesterdayTime) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const expectedDate = uniqueDates[i - 1] - 24 * 60 * 60 * 1000;
          if (uniqueDates[i] === expectedDate) {
            streak++;
          } else {
            break;
          }
        }
      }
      setConsecutiveDays(streak);
    }

    // Load tree hole posts count
    const { count: postsCount } = await supabase
      .from("tree_hole_posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    setTreeHolePostsCount(postsCount ?? 0);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ username: newUsername })
      .eq("id", user.id);

    if (error) {
      toast.error("更新失败，请重试");
    } else {
      setUsername(newUsername);
      setEditDialogOpen(false);
      toast.success("资料已更新");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    
    // 文件大小验证 (最大 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("文件大小不能超过5MB");
      return;
    }
    
    // 文件类型验证
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("只支持 JPG、PNG、WebP 和 GIF 格式");
      return;
    }
    
    // 文件扩展名验证
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!fileExt || !allowedExts.includes(fileExt)) {
      toast.error("文件扩展名无效");
      return;
    }
    
    // 安全化文件名
    const sanitizedExt = fileExt.replace(/[^a-z0-9]/gi, '');
    const filePath = `${user.id}/avatar.${sanitizedExt}`;

    setUploading(true);

    try {
      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("avatars").remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(urlData.publicUrl);
      toast.success("头像已更新");
    } catch (error) {
      toast.error("上传失败，请重试");
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("已退出登录");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  const stats = [
    { label: "完成测试", value: totalTests, icon: Brain, color: "text-primary" },
    { label: "心情记录", value: moodCount, icon: Heart, color: "text-accent" },
    { label: "连续打卡", value: consecutiveDays, icon: Calendar, color: "text-success" },
  ];

  const getTestColor = (testType: string) => {
    const colors: Record<string, string> = {
      mbti: "bg-primary",
      learning: "bg-success",
      stress: "bg-accent",
      depression: "bg-destructive",
      anxiety: "bg-warning"
    };
    return colors[testType] || "bg-primary";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "今天";
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    return `${Math.floor(diffDays / 30)}个月前`;
  };

  const formatTestResult = (result: string, testType: string) => {
    try {
      const parsed = JSON.parse(result);
      
      // 动物性格测试
      if (parsed.primary && parsed.primary.name) {
        return parsed.primary.name;
      }
      
      // 心理年龄测试
      if (parsed.mentalAge !== undefined) {
        return `心理年龄 ${parsed.mentalAge}岁`;
      }
      
      // 霍兰德测试
      if (parsed.code) {
        return parsed.code;
      }
      
      // 九型人格测试
      if (parsed.type && parsed.name) {
        return `${parsed.type}号 ${parsed.name}`;
      }
      
      // 其他复杂对象
      if (typeof parsed === 'object') {
        // 尝试提取常见字段
        if (parsed.name) return parsed.name;
        if (parsed.result) return parsed.result;
        if (parsed.category) return parsed.category;
        return '查看详情';
      }
      
      return result;
    } catch {
      // 非JSON格式，直接返回原始结果
      return result;
    }
  };

  const achievements = [
    { title: "初心者", desc: "完成首次测试", unlocked: totalTests >= 1 },
    { title: "探索家", desc: "完成5个不同类型测试", unlocked: uniqueTestTypes >= 5 },
    { title: "坚持者", desc: "连续7天打卡", unlocked: consecutiveDays >= 7 },
    { title: "分享达人", desc: "发布10条树洞", unlocked: treeHolePostsCount >= 10 },
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
                <div className="relative group">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-white/40 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-2 border-white/40 shadow-lg bg-white/20">
                      👤
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-white flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{username || user?.email?.split("@")[0] || "用户"}</h2>
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>编辑资料</DialogTitle>
                        <DialogDescription>修改你的用户名</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">用户名</Label>
                          <Input
                            id="username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="输入你的名字"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setEditDialogOpen(false)}
                        >
                          取消
                        </Button>
                        <Button onClick={handleUpdateProfile}>保存</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-primary-light mb-3">探索中的少年</p>
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
              onClick={() => navigate("/test-history")}
            >
              查看全部 →
            </Button>
          </div>
          {recentTests.length > 0 ? (
            <div className="space-y-3">
              {recentTests.map((test) => {
                const badgeText = formatTestResult(test.result, test.test_type);

                return (
                  <Card
                    key={test.id}
                    className="p-4 shadow-card hover:shadow-soft transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${getTestColor(test.test_type)} flex items-center justify-center flex-shrink-0`}
                      >
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1">{test.test_name}</h4>
                        <p className="text-sm text-muted-foreground">{formatDate(test.created_at)}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        title={badgeText}
                        className="flex-shrink-0 max-w-40 truncate"
                      >
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
              <Button onClick={() => navigate("/tests")}>
                开始测试
              </Button>
            </Card>
          )}
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
