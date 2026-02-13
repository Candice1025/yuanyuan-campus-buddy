import { useState } from "react";
import { HelpCircle, X, Brain, MessageCircle, TreePine, Heart, Sparkles, Search, Laugh, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";

const guides = [
  {
    icon: Brain,
    title: "心理测试",
    desc: "包含MBTI、九型人格、霍兰德等10+专业测试，帮助你深入了解自己的性格与潜能。",
  },
  {
    icon: MessageCircle,
    title: "守伴者聊天",
    desc: "AI情绪陪伴助手，随时倾听你的心声，提供温暖的回应与建议。",
  },
  {
    icon: Search,
    title: "知识检索",
    desc: "搜索心理学相关知识，获取权威、专业的信息。",
  },
  {
    icon: TreePine,
    title: "心灵树洞",
    desc: "匿名发布心情，与他人互相倾听、点赞和评论，释放内心压力。",
  },
  {
    icon: Heart,
    title: "心情日记",
    desc: "每天记录情绪变化，形成情绪趋势图，更好地觉察自己。",
  },
  {
    icon: Sparkles,
    title: "心灵沙盘",
    desc: "通过互动沙盘游戏，以直觉摆放物件，AI帮你解读内心世界。",
  },
  {
    icon: Laugh,
    title: "娱乐中心",
    desc: "笑话和脑筋急转弯，在轻松的氛围中放松心情。",
  },
  {
    icon: User,
    title: "个人中心",
    desc: "管理你的数字形象、查看测试记录和历史数据。",
  },
];

const JungAssistant = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-primary shadow-float flex items-center justify-center hover:scale-110 transition-transform duration-300"
        style={{ animation: "slow-float 4s ease-in-out infinite" }}
        aria-label="荣格助手"
      >
        <HelpCircle className="w-7 h-7 text-white" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="relative">
            <DrawerTitle className="text-xl font-bold text-center">
              🧠 荣格助手 · 使用指南
            </DrawerTitle>
            <DrawerDescription className="text-center text-muted-foreground">
              欢迎来到荣格的房间！以下是各功能的介绍，点击即可开始探索。
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-6 overflow-y-auto space-y-3">
            {guides.map((g) => {
              const Icon = g.icon;
              return (
                <div
                  key={g.title}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{g.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 text-center">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                我知道了 ✨
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default JungAssistant;
