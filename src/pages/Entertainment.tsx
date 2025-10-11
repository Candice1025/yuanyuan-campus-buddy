import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Music, Laugh, Coffee, CloudRain, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const entertainmentItems = [
  {
    icon: Music,
    title: "白噪音学习",
    description: "雨声、咖啡厅等背景音帮助集中注意力",
    color: "bg-primary",
    coming: false,
  },
  {
    icon: Laugh,
    title: "冷笑话专区",
    description: "每日更新幽默内容，放松心情",
    color: "bg-accent",
    coming: false,
  },
  {
    icon: Coffee,
    title: "解压小游戏",
    description: "简单有趣的小游戏帮你放松",
    color: "bg-success",
    coming: true,
  },
  {
    icon: CloudRain,
    title: "冥想放松",
    description: "引导式冥想，缓解压力",
    color: "bg-secondary",
    coming: true,
  },
];

const Entertainment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleItemClick = (item: typeof entertainmentItems[0]) => {
    if (item.coming) {
      toast({
        title: "即将推出",
        description: `${item.title}功能正在开发中，敬请期待！`,
      });
      return;
    }

    // 根据不同的功能进行导航或操作
    switch (item.title) {
      case "白噪音学习":
        toast({
          title: "白噪音播放",
          description: "功能开发中，即将上线 🎵",
        });
        break;
      case "冷笑话专区":
        toast({
          title: "冷笑话",
          description: "为什么程序员喜欢黑夜？因为黑夜好debug（调试）😄",
        });
        break;
      default:
        break;
    }
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
            <h1 className="text-xl font-bold text-foreground">娱乐中心</h1>
            <p className="text-sm text-muted-foreground">放松心情，快乐学习</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entertainmentItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden"
                onClick={() => handleItemClick(item)}
              >
                {item.coming && (
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                    即将推出
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6 p-6 bg-gradient-primary text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">每日推荐</h3>
              <p className="text-sm opacity-90">
                学习累了？试试听听雨声，让大脑休息一下再继续吧！适度休息能让学习效率更高 🌟
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Entertainment;
