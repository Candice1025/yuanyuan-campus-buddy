import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AvatarConfig {
  face_type: string;
  hairstyle: string;
  eyes: string;
  nose: string;
  mouth: string;
  outfit: string;
}

const avatarOptions = {
  face_type: [
    { value: "oval", label: "鹅蛋脸", emoji: "😊" },
    { value: "round", label: "圆脸", emoji: "😄" },
    { value: "square", label: "方脸", emoji: "😐" },
    { value: "heart", label: "心形脸", emoji: "😍" }
  ],
  hairstyle: [
    { value: "short", label: "短发", emoji: "👦" },
    { value: "long", label: "长发", emoji: "👧" },
    { value: "ponytail", label: "马尾", emoji: "👱‍♀️" },
    { value: "bob", label: "波波头", emoji: "💇" }
  ],
  eyes: [
    { value: "normal", label: "普通", emoji: "👁️" },
    { value: "big", label: "大眼睛", emoji: "👀" },
    { value: "small", label: "小眼睛", emoji: "😌" },
    { value: "sparkle", label: "闪亮", emoji: "✨" }
  ],
  nose: [
    { value: "normal", label: "普通", emoji: "👃" },
    { value: "small", label: "小巧", emoji: "🤏" },
    { value: "button", label: "圆润", emoji: "⚪" }
  ],
  mouth: [
    { value: "smile", label: "微笑", emoji: "😊" },
    { value: "grin", label: "大笑", emoji: "😁" },
    { value: "neutral", label: "自然", emoji: "😐" },
    { value: "happy", label: "开心", emoji: "😄" }
  ],
  outfit: [
    { value: "casual", label: "休闲", emoji: "👕" },
    { value: "formal", label: "正式", emoji: "👔" },
    { value: "sporty", label: "运动", emoji: "🏃" },
    { value: "cute", label: "可爱", emoji: "🎀" }
  ]
};

const AvatarCustomize = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AvatarConfig>({
    face_type: "oval",
    hairstyle: "short",
    eyes: "normal",
    nose: "normal",
    mouth: "smile",
    outfit: "casual"
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Load existing avatar config
    const { data, error } = await supabase
      .from("avatar_configs")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setConfig({
        face_type: data.face_type,
        hairstyle: data.hairstyle,
        eyes: data.eyes,
        nose: data.nose,
        mouth: data.mouth,
        outfit: data.outfit
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("未登录");

      const { error } = await supabase
        .from("avatar_configs")
        .upsert({
          user_id: session.user.id,
          ...config
        });

      if (error) throw error;
      toast.success("数字形象已保存！");
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const getAvatarEmoji = () => {
    const face = avatarOptions.face_type.find(o => o.value === config.face_type)?.emoji || "😊";
    const hair = avatarOptions.hairstyle.find(o => o.value === config.hairstyle)?.emoji || "👦";
    const eye = avatarOptions.eyes.find(o => o.value === config.eyes)?.emoji || "👁️";
    return `${face}${hair}${eye}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">自定义数字形象</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>预览</CardTitle>
              <CardDescription>你的数字形象预览</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="text-8xl mb-4">{getAvatarEmoji()}</div>
              <div className="text-center text-sm text-muted-foreground space-y-1">
                <p>脸型: {avatarOptions.face_type.find(o => o.value === config.face_type)?.label}</p>
                <p>发型: {avatarOptions.hairstyle.find(o => o.value === config.hairstyle)?.label}</p>
                <p>眼睛: {avatarOptions.eyes.find(o => o.value === config.eyes)?.label}</p>
                <p>鼻子: {avatarOptions.nose.find(o => o.value === config.nose)?.label}</p>
                <p>嘴巴: {avatarOptions.mouth.find(o => o.value === config.mouth)?.label}</p>
                <p>服装: {avatarOptions.outfit.find(o => o.value === config.outfit)?.label}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customization Options */}
          <div className="space-y-4">
            {Object.entries(avatarOptions).map(([key, options]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {key === "face_type" && "脸型"}
                    {key === "hairstyle" && "发型"}
                    {key === "eyes" && "眼睛"}
                    {key === "nose" && "鼻子"}
                    {key === "mouth" && "嘴巴"}
                    {key === "outfit" && "服装"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {options.map((option) => (
                      <Button
                        key={option.value}
                        variant={config[key as keyof AvatarConfig] === option.value ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setConfig({ ...config, [key]: option.value })}
                      >
                        <span className="mr-2 text-xl">{option.emoji}</span>
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={handleSave} className="w-full" size="lg" disabled={saving}>
              {saving ? "保存中..." : "保存形象"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomize;
