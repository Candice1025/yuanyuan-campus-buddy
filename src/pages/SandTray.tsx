import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface SandItem {
  id: string;
  category: string;
  name: string;
  emoji: string;
  position?: { x: number; y: number };
}

const itemCategories = {
  人物: [
    { name: "婴儿", emoji: "👶" }, { name: "儿童", emoji: "🧒" }, { name: "少年", emoji: "👦" },
    { name: "少女", emoji: "👧" }, { name: "青年男", emoji: "👨" }, { name: "青年女", emoji: "👩" },
    { name: "老人", emoji: "👴" }, { name: "老妇", emoji: "👵" }, { name: "情侣", emoji: "💑" },
    { name: "家庭", emoji: "👨‍👩‍👧" }, { name: "母子", emoji: "👩‍👦" }, { name: "父女", emoji: "👨‍👧" },
    { name: "独行者", emoji: "🚶" }, { name: "跑步者", emoji: "🏃" }, { name: "舞者", emoji: "💃" },
    { name: "思考者", emoji: "🤔" }, { name: "哭泣者", emoji: "😢" }, { name: "微笑者", emoji: "😊" },
    { name: "王子", emoji: "🤴" }, { name: "公主", emoji: "👸" }, { name: "国王", emoji: "👑" },
  ],
  动物: [
    { name: "狗", emoji: "🐕" }, { name: "猫", emoji: "🐈" }, { name: "兔子", emoji: "🐰" },
    { name: "马", emoji: "🐎" }, { name: "狮子", emoji: "🦁" }, { name: "老虎", emoji: "🐯" },
    { name: "熊", emoji: "🐻" }, { name: "熊猫", emoji: "🐼" }, { name: "狼", emoji: "🐺" },
    { name: "狐狸", emoji: "🦊" }, { name: "鹿", emoji: "🦌" }, { name: "蛇", emoji: "🐍" },
    { name: "龙", emoji: "🐉" }, { name: "鸟", emoji: "🦅" }, { name: "天鹅", emoji: "🦢" },
    { name: "企鹅", emoji: "🐧" }, { name: "猫头鹰", emoji: "🦉" }, { name: "蝴蝶", emoji: "🦋" },
    { name: "鱼", emoji: "🐟" }, { name: "海豚", emoji: "🐬" }, { name: "鲸鱼", emoji: "🐋" },
    { name: "乌龟", emoji: "🐢" }, { name: "章鱼", emoji: "🐙" }, { name: "螃蟹", emoji: "🦀" },
  ],
  自然: [
    { name: "树", emoji: "🌳" }, { name: "松树", emoji: "🌲" }, { name: "棕榈树", emoji: "🌴" },
    { name: "枯树", emoji: "🌿" }, { name: "花", emoji: "🌸" }, { name: "玫瑰", emoji: "🌹" },
    { name: "向日葵", emoji: "🌻" }, { name: "郁金香", emoji: "🌷" }, { name: "莲花", emoji: "🪷" },
    { name: "草", emoji: "🌱" }, { name: "叶子", emoji: "🍃" }, { name: "枫叶", emoji: "🍁" },
    { name: "山", emoji: "⛰️" }, { name: "火山", emoji: "🌋" }, { name: "岛", emoji: "🏝️" },
    { name: "河", emoji: "〰️" }, { name: "瀑布", emoji: "💧" }, { name: "海浪", emoji: "🌊" },
    { name: "火", emoji: "🔥" }, { name: "闪电", emoji: "⚡" }, { name: "彩虹", emoji: "🌈" },
    { name: "太阳", emoji: "☀️" }, { name: "月亮", emoji: "🌙" }, { name: "星星", emoji: "⭐" },
    { name: "云", emoji: "☁️" }, { name: "雨", emoji: "🌧️" }, { name: "雪花", emoji: "❄️" },
  ],
  建筑: [
    { name: "房子", emoji: "🏠" }, { name: "小屋", emoji: "🛖" }, { name: "城堡", emoji: "🏰" },
    { name: "宫殿", emoji: "🏛️" }, { name: "塔", emoji: "🗼" }, { name: "桥", emoji: "🌉" },
    { name: "门", emoji: "🚪" }, { name: "窗", emoji: "🪟" }, { name: "墙", emoji: "🧱" },
    { name: "栅栏", emoji: "🚧" }, { name: "楼梯", emoji: "🪜" }, { name: "灯塔", emoji: "🗼" },
    { name: "教堂", emoji: "⛪" }, { name: "神庙", emoji: "🛕" }, { name: "摩天轮", emoji: "🎡" },
    { name: "学校", emoji: "🏫" }, { name: "医院", emoji: "🏥" }, { name: "图书馆", emoji: "📚" },
  ],
  物品: [
    { name: "钥匙", emoji: "🔑" }, { name: "锁", emoji: "🔒" }, { name: "宝箱", emoji: "💎" },
    { name: "皇冠", emoji: "👑" }, { name: "戒指", emoji: "💍" }, { name: "项链", emoji: "📿" },
    { name: "剑", emoji: "⚔️" }, { name: "盾牌", emoji: "🛡️" }, { name: "弓箭", emoji: "🏹" },
    { name: "书", emoji: "📖" }, { name: "信", emoji: "✉️" }, { name: "笔", emoji: "✒️" },
    { name: "蜡烛", emoji: "🕯️" }, { name: "灯笼", emoji: "🏮" }, { name: "钟表", emoji: "⏰" },
    { name: "沙漏", emoji: "⏳" }, { name: "镜子", emoji: "🪞" }, { name: "气球", emoji: "🎈" },
    { name: "礼物", emoji: "🎁" }, { name: "花束", emoji: "💐" }, { name: "信箱", emoji: "📮" },
  ],
  奇幻: [
    { name: "天使", emoji: "👼" }, { name: "恶魔", emoji: "👿" }, { name: "幽灵", emoji: "👻" },
    { name: "巫师", emoji: "🧙" }, { name: "仙女", emoji: "🧚" }, { name: "精灵", emoji: "🧝" },
    { name: "独角兽", emoji: "🦄" }, { name: "凤凰", emoji: "🔥" }, { name: "美人鱼", emoji: "🧜" },
    { name: "水晶球", emoji: "🔮" }, { name: "魔杖", emoji: "🪄" }, { name: "魔法书", emoji: "📜" },
    { name: "羽毛", emoji: "🪶" }, { name: "翅膀", emoji: "🕊️" }, { name: "光环", emoji: "✨" },
    { name: "宝石", emoji: "💎" }, { name: "星尘", emoji: "✨" }, { name: "月光", emoji: "🌙" },
  ],
  情感: [
    { name: "心", emoji: "❤️" }, { name: "破碎心", emoji: "💔" }, { name: "心锁", emoji: "🔐" },
    { name: "笑脸", emoji: "😊" }, { name: "哭脸", emoji: "😢" }, { name: "愤怒", emoji: "😡" },
    { name: "恐惧", emoji: "😨" }, { name: "惊讶", emoji: "😲" }, { name: "疑惑", emoji: "🤔" },
    { name: "拥抱", emoji: "🤗" }, { name: "祈祷", emoji: "🙏" }, { name: "安静", emoji: "🤫" },
  ],
};

const SandTray = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stage, setStage] = useState<"intro" | "placing" | "result">("intro");
  const [selectedItems, setSelectedItems] = useState<SandItem[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ category: string; item: { name: string; emoji: string } } | null>(null);
  const sandTrayRef = useRef<HTMLDivElement>(null);
  const [avatarImage, setAvatarImage] = useState<string>("");
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const handleDragStart = (category: string, item: { name: string; emoji: string }) => {
    setDraggedItem({ category, item });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || !sandTrayRef.current) return;

    const rect = sandTrayRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newItem: SandItem = {
      id: `${Date.now()}-${Math.random()}`,
      category: draggedItem.category,
      name: draggedItem.item.name,
      emoji: draggedItem.item.emoji,
      position: { x, y },
    };

    setSelectedItems([...selectedItems, newItem]);
    setDraggedItem(null);
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const handleAnalyze = async () => {
    if (selectedItems.length < 1) {
      toast({
        title: "沙盘为空",
        description: "请至少摆放1个物件",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sandtray-analysis`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ items: selectedItems }),
      });

      if (!response.ok) {
        throw new Error("分析失败");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setStage("result");
      setShowResult(true);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "分析失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateAvatar = async () => {
    setIsGeneratingAvatar(true);

    try {
      const AVATAR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-avatar`;
      
      const response = await fetch(AVATAR_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ items: selectedItems, analysis }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "生成失败");
      }

      const data = await response.json();
      setAvatarImage(data.imageUrl);
      
      toast({
        title: "3D形象生成成功",
        description: "已为你创建独特的心灵形象",
      });
    } catch (error) {
      console.error("Avatar generation error:", error);
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleRestart = () => {
    setSelectedItems([]);
    setStage("intro");
    setShowResult(false);
    setAnalysis("");
    setAvatarImage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">心灵沙盘</h1>
            <p className="text-sm text-muted-foreground">探索内心的风景</p>
          </div>
        </div>
      </header>

      {/* 引导页 */}
      {stage === "intro" && (
        <main className="max-w-4xl mx-auto px-4 py-12">
          <Card className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">欢迎来到心灵沙盘</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              闭上眼，深呼吸，想象你的一天开始在这里——一个没有评判的世界。
              <br />
              <br />
              在接下来的旅程中，你将选择最多8个物件，摆放在你的沙盘里。
              每一个选择，都是你内心世界的投射。
              <br />
              <br />
              请放松，跟随直觉，选择那些触动你心灵的物件。
            </p>
            <Button
              onClick={() => setStage("placing")}
              className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6"
            >
              开始构建我的世界
            </Button>
          </Card>
        </main>
      )}

      {/* 摆放阶段 */}
      {stage === "placing" && (
        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：模型柜 */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  物件柜 ({selectedItems.length}个)
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  拖拽物件到沙盘中，可重复摆放
                </p>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {Object.entries(itemCategories).map(([category, items]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        {category}
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {items.map((item, idx) => (
                          <div
                            key={`${item.name}-${idx}`}
                            draggable
                            onDragStart={() => handleDragStart(category, item)}
                            className="p-3 rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105 flex flex-col items-center gap-1 cursor-move"
                          >
                            <span className="text-2xl">{item.emoji}</span>
                            <span className="text-xs text-foreground text-center">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* 右侧：沙盘 */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  我的沙盘世界
                </h3>
                <div 
                  ref={sandTrayRef}
                  className="relative w-full aspect-[4/3] bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border-4 border-amber-300/50 overflow-hidden"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {selectedItems.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-muted-foreground text-center px-4">
                        拖拽左侧物件到这里，开始构建你的世界
                        <br />
                        <span className="text-sm">每个物件都承载着一段故事</span>
                      </p>
                    </div>
                  ) : (
                    selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="absolute cursor-pointer hover:scale-125 transition-transform hover:z-10"
                        style={{
                          left: `${item.position?.x}%`,
                          top: `${item.position?.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        onClick={() => handleRemoveItem(item.id)}
                        title="点击移除"
                      >
                        <div className="text-4xl drop-shadow-lg">{item.emoji}</div>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  💡 拖拽物件到沙盘 | 点击沙盘中的物件可移除
                </p>
              </Card>

              <div className="flex gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={selectedItems.length < 1 || isAnalyzing}
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                >
                  {isAnalyzing ? "正在解读..." : "完成并解读我的沙盘"}
                </Button>
                <Button variant="outline" onClick={handleRestart}>
                  清空沙盘
                </Button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 结果对话框 */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">你的内心风景</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center py-4">
              {selectedItems.map((item) => (
                <div key={item.id} className="text-center">
                  <div className="text-3xl">{item.emoji}</div>
                  <div className="text-xs text-muted-foreground">{item.name}</div>
                </div>
              ))}
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-foreground">
                {analysis}
              </div>
            </div>
            
            {avatarImage && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">你的心灵形象</h3>
                <img 
                  src={avatarImage} 
                  alt="心灵3D形象" 
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}
            
            <div className="flex flex-col gap-3 pt-4">
              {!avatarImage && (
                <Button 
                  onClick={handleGenerateAvatar}
                  disabled={isGeneratingAvatar}
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGeneratingAvatar ? "正在生成3D形象..." : "生成我的3D心灵形象"}
                </Button>
              )}
              <div className="flex gap-4">
                <Button onClick={handleRestart} className="flex-1">
                  重新开始
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  返回首页
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SandTray;
