import { useState, useRef, useEffect } from "react";
import { HelpCircle, Brain, MessageCircle, TreePine, Heart, Sparkles, Search, Laugh, User, Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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

const guides = [
  { icon: Brain, title: "心理测试", desc: "包含MBTI、九型人格、霍兰德等10+专业测试，帮助你深入了解自己的性格与潜能。" },
  { icon: MessageCircle, title: "守伴者聊天", desc: "AI情绪陪伴助手，随时倾听你的心声，提供温暖的回应与建议。" },
  { icon: Search, title: "知识检索", desc: "搜索心理学相关知识，获取权威、专业的信息。" },
  { icon: TreePine, title: "心灵树洞", desc: "匿名发布心情，与他人互相倾听、点赞和评论，释放内心压力。" },
  { icon: Heart, title: "心情日记", desc: "每天记录情绪变化，形成情绪趋势图，更好地觉察自己。" },
  { icon: Sparkles, title: "心灵沙盘", desc: "通过互动沙盘游戏，以直觉摆放物件，AI帮你解读内心世界。" },
  { icon: Laugh, title: "娱乐中心", desc: "笑话和脑筋急转弯，在轻松的氛围中放松心情。" },
  { icon: User, title: "个人中心", desc: "管理你的数字形象、查看测试记录和历史数据。" },
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
              <div className="space-y-2">
                {guides.map((g) => {
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
