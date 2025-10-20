import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface SavedAvatar extends AvatarConfig {
  id: string;
  avatar_name: string;
  is_active: boolean;
}

const avatarOptions = {
  skin_tone: [
    { value: "light", label: "白皙", emoji: "🤍", color: "#FFE5D9" },
    { value: "medium", label: "自然", emoji: "🧡", color: "#E8B4A0" },
    { value: "tan", label: "小麦色", emoji: "🤎", color: "#D4A373" },
    { value: "dark", label: "深色", emoji: "💛", color: "#8B6F47" }
  ],
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
    { value: "bob", label: "波波头", emoji: "💇" },
    { value: "curly", label: "卷发", emoji: "🦱" },
    { value: "bun", label: "丸子头", emoji: "🥖" }
  ],
  eyebrows: [
    { value: "normal", label: "自然眉", emoji: "➖" },
    { value: "thick", label: "浓眉", emoji: "〰️" },
    { value: "thin", label: "细眉", emoji: "ー" },
    { value: "arched", label: "拱形眉", emoji: "⌒" }
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
    { value: "cute", label: "可爱", emoji: "🎀" },
    { value: "school", label: "校服", emoji: "🎒" },
    { value: "party", label: "派对", emoji: "🎉" }
  ],
  accessories: [
    { value: "none", label: "无", emoji: "⭕" },
    { value: "glasses", label: "眼镜", emoji: "👓" },
    { value: "hat", label: "帽子", emoji: "🎩" },
    { value: "headband", label: "发带", emoji: "🎀" },
    { value: "earrings", label: "耳环", emoji: "💎" },
    { value: "necklace", label: "项链", emoji: "📿" }
  ]
};

const AvatarCustomize = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAvatars, setSavedAvatars] = useState<SavedAvatar[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newAvatarName, setNewAvatarName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [config, setConfig] = useState<AvatarConfig>({
    face_type: "oval",
    hairstyle: "short",
    eyes: "normal",
    eyebrows: "normal",
    nose: "normal",
    mouth: "smile",
    skin_tone: "light",
    outfit: "casual",
    accessories: "none"
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

    // Load current avatar config
    const { data } = await supabase
      .from("avatar_configs")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setConfig({
        face_type: data.face_type,
        hairstyle: data.hairstyle,
        eyes: data.eyes,
        eyebrows: data.eyebrows || "normal",
        nose: data.nose,
        mouth: data.mouth,
        skin_tone: data.skin_tone || "light",
        outfit: data.outfit,
        accessories: data.accessories || "none"
      });
    }

    // Load saved avatars
    await loadSavedAvatars();
    setLoading(false);
  };

  const loadSavedAvatars = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("saved_avatars")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setSavedAvatars(data);
    }
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

  const handleSaveAsPreset = async () => {
    if (!newAvatarName.trim()) {
      toast.error("请输入形象名称");
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("未登录");

      const { error } = await supabase
        .from("saved_avatars")
        .insert({
          user_id: session.user.id,
          avatar_name: newAvatarName,
          ...config
        });

      if (error) throw error;
      
      toast.success("形象已保存为预设！");
      setNewAvatarName("");
      setShowSaveDialog(false);
      await loadSavedAvatars();
    } catch (error: any) {
      toast.error(error.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadPreset = (avatar: SavedAvatar) => {
    setConfig({
      face_type: avatar.face_type,
      hairstyle: avatar.hairstyle,
      eyes: avatar.eyes,
      eyebrows: avatar.eyebrows,
      nose: avatar.nose,
      mouth: avatar.mouth,
      skin_tone: avatar.skin_tone,
      outfit: avatar.outfit,
      accessories: avatar.accessories
    });
    toast.success(`已加载形象：${avatar.avatar_name}`);
  };

  const handleDeletePreset = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("saved_avatars")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      
      toast.success("形象已删除");
      await loadSavedAvatars();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    } finally {
      setDeleteId(null);
    }
  };

  const getAvatarEmoji = (cfg: AvatarConfig = config) => {
    const face = avatarOptions.face_type.find(o => o.value === cfg.face_type)?.emoji || "😊";
    const hair = avatarOptions.hairstyle.find(o => o.value === cfg.hairstyle)?.emoji || "👦";
    const accessory = avatarOptions.accessories.find(o => o.value === cfg.accessories)?.emoji || "";
    return `${face}${hair}${accessory !== "⭕" ? accessory : ""}`;
  };

  const getSkinColor = () => {
    return avatarOptions.skin_tone.find(o => o.value === config.skin_tone)?.color || "#FFE5D9";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-success/10 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              自定义数字形象
            </h1>
          </div>
          <div className="flex gap-2">
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  保存为预设
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>保存形象预设</DialogTitle>
                  <DialogDescription>
                    给这个形象起个名字，方便以后快速切换
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="avatar-name">形象名称</Label>
                    <Input
                      id="avatar-name"
                      placeholder="例如：活力少年、清新校园..."
                      value={newAvatarName}
                      onChange={(e) => setNewAvatarName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveAsPreset} disabled={saving}>
                    {saving ? "保存中..." : "保存"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "保存中..." : "保存并应用"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Preview Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>形象预览</CardTitle>
                <CardDescription>实时查看你的数字形象</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-8">
                <div 
                  className="w-48 h-48 rounded-full flex items-center justify-center text-9xl mb-6 shadow-float transition-all hover:scale-105"
                  style={{ backgroundColor: getSkinColor() }}
                >
                  {getAvatarEmoji()}
                </div>
                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                    <span className="text-muted-foreground">肤色</span>
                    <span className="font-medium">{avatarOptions.skin_tone.find(o => o.value === config.skin_tone)?.label}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                    <span className="text-muted-foreground">脸型</span>
                    <span className="font-medium">{avatarOptions.face_type.find(o => o.value === config.face_type)?.label}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                    <span className="text-muted-foreground">发型</span>
                    <span className="font-medium">{avatarOptions.hairstyle.find(o => o.value === config.hairstyle)?.label}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                    <span className="text-muted-foreground">服装</span>
                    <span className="font-medium">{avatarOptions.outfit.find(o => o.value === config.outfit)?.label}</span>
                  </div>
                  {config.accessories !== "none" && (
                    <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                      <span className="text-muted-foreground">配饰</span>
                      <span className="font-medium">{avatarOptions.accessories.find(o => o.value === config.accessories)?.label}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Saved Presets */}
            {savedAvatars.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">保存的形象</CardTitle>
                  <CardDescription>点击快速切换</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {savedAvatars.map((avatar) => (
                      <div
                        key={avatar.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
                        onClick={() => handleLoadPreset(avatar)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getAvatarEmoji(avatar)}</div>
                          <span className="font-medium">{avatar.avatar_name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(avatar.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Customization Options */}
          <div className="lg:col-span-2 space-y-4">
            {Object.entries(avatarOptions).map(([key, options]) => (
              <Card key={key} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">
                      {key === "skin_tone" && "🎨"}
                      {key === "face_type" && "😊"}
                      {key === "hairstyle" && "💇"}
                      {key === "eyebrows" && "👁️"}
                      {key === "eyes" && "👀"}
                      {key === "nose" && "👃"}
                      {key === "mouth" && "😄"}
                      {key === "outfit" && "👕"}
                      {key === "accessories" && "💎"}
                    </span>
                    {key === "skin_tone" && "肤色"}
                    {key === "face_type" && "脸型"}
                    {key === "hairstyle" && "发型"}
                    {key === "eyebrows" && "眉毛"}
                    {key === "eyes" && "眼睛"}
                    {key === "nose" && "鼻子"}
                    {key === "mouth" && "嘴巴"}
                    {key === "outfit" && "服装"}
                    {key === "accessories" && "配饰"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {options.map((option) => {
                      const isSelected = config[key as keyof AvatarConfig] === option.value;
                      return (
                        <Button
                          key={option.value}
                          variant={isSelected ? "default" : "outline"}
                          className={`h-auto py-3 px-2 flex flex-col items-center gap-2 transition-all hover:scale-105 ${
                            isSelected ? 'ring-2 ring-primary shadow-md' : ''
                          }`}
                          onClick={() => setConfig({ ...config, [key]: option.value })}
                        >
                          <span className="text-3xl">{option.emoji}</span>
                          <span className="text-xs font-medium">{option.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个保存的形象吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePreset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AvatarCustomize;