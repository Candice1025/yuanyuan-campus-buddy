import { useState, useRef, useEffect } from "react";
import { HelpCircle, Brain, MessageCircle, TreePine, Heart, Sparkles, Search, Laugh, User, Send, Loader2, ChevronDown, ChevronUp, Shield, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { toast } from "@/hooks/use-toast";



const guideCategories = [
  {
    label: "🧩 核心功能",
    items: [
      { icon: Brain, title: "心理测试", desc: "包含MBTI、九型人格、霍兰德等10+专业测试。所有题目均为4选1，完成后自动生成详细报告并保存勋章。" },
      { icon: MessageCircle, title: "守伴者聊天", desc: "24/7在线的AI情绪陪伴助手，随时倾听你的心声。聊天记录自动保存，需登录使用。" },
      { icon: Search, title: "知识检索", desc: "输入关键词即可搜索心理学相关知识，AI智能排序结果，获取权威专业信息。" },
    ],
  },
  {
    label: "💚 心灵空间",
    items: [
      { icon: TreePine, title: "心灵树洞", desc: "匿名发布心情想法，所有人可见但身份完全保密。支持点赞和评论互动，浏览无需登录。" },
      { icon: Heart, title: "心情日记", desc: "选择心情类型和强度，写下当天感受。系统会生成情绪趋势变化图，帮你觉察情绪规律。" },
      { icon: Sparkles, title: "心灵沙盘", desc: "凭直觉在沙盘上摆放物件，AI会根据你的摆放位置和选择深度解读你的内心世界。" },
    ],
  },
  {
    label: "🎯 更多体验",
    items: [
      { icon: Laugh, title: "娱乐中心", desc: "收录笑话和脑筋急转弯，帮你在紧张学习或工作之余放松心情，无需登录即可使用。" },
      { icon: User, title: "个人中心", desc: "自定义虚拟头像形象，查看所有历史测试记录，已完成的测试会以勋章形式展示成就。" },
    ],
  },
  {
    label: "ℹ️ 帮助与安全",
    items: [
      { icon: Shield, title: "隐私与安全", desc: "所有数据严格加密存储，树洞发布完全匿名。你的个人信息和测试结果仅自己可见。" },
      { icon: BookOpen, title: "新手入门", desc: "首次使用建议：先注册登录 → 做一个心理测试了解自己 → 去树洞看看大家的分享 → 和守伴者聊聊天。" },
      { icon: Clock, title: "使用小贴士", desc: "测试不限次数可重复做；心情日记坚持记录效果更好；遇到困扰随时找守伴者倾诉，它不会评判你。" },
    ],
  },
];

type Msg = { role: "user" | "assistant"; content: string };

const GUIDE_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guide-chat`;

const JungAssistant = () => {
  const [open, setOpen] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(GUIDE_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "请求失败");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      toast({ title: "发送失败", description: e.message || "请稍后再试", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-primary shadow-float flex items-center justify-center hover:scale-110 transition-transform duration-300"
        style={{ animation: "slow-float 4s ease-in-out infinite" }}
        aria-label="荣格助手"
      >
        <HelpCircle className="w-7 h-7 text-white" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-bold text-center">
              🧠 荣格助手
            </DrawerTitle>
            <DrawerDescription className="text-center text-muted-foreground text-xs">
              查看使用指南，或直接向我提问
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 space-y-3">
            {/* Collapsible guides */}
            <button
              onClick={() => setShowGuides(!showGuides)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm font-medium text-foreground"
            >
              <span>📖 功能指南</span>
              {showGuides ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showGuides && (
              <div className="space-y-3">
                {guideCategories.map((cat) => (
                  <div key={cat.label}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5 px-1">{cat.label}</p>
                    <div className="space-y-1.5">
                      {cat.items.map((g) => {
                        const Icon = g.icon;
                        return (
                          <div key={g.title} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground text-sm">{g.title}</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat messages */}
            {messages.length > 0 && (
              <div className="space-y-2 pt-2">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground px-3 py-2 rounded-2xl rounded-bl-md text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="px-4 py-3 border-t border-border flex gap-2">
            <Input
              placeholder="有什么想问的？例如：怎么做心理测试？"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="text-sm"
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="shrink-0 bg-gradient-primary hover:opacity-90"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default JungAssistant;
