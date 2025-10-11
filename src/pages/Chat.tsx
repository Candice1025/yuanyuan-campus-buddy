import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Sparkles, Book, Heart, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import chatIcon from "@/assets/chat-icon.png";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "你好呀！我是元元，你的校园生活小帮手 🌟\n\n我可以帮你：\n✨ 解答学习问题（但不会直接给答案哦）\n💭 倾听你的烦恼\n📚 分享学习方法\n💡 激发学习灵感\n\n有什么我可以帮你的吗？",
      sender: "assistant",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { icon: Book, text: "学习帮助", color: "bg-primary" },
    { icon: Heart, text: "心情倾诉", color: "bg-accent" },
    { icon: Lightbulb, text: "灵感启发", color: "bg-success" },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // 模拟AI回复
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "我理解你的想法。让我们一起思考一下这个问题...\n\n作为学习小帮手，我会引导你找到答案，而不是直接告诉你。你觉得可以从哪个角度入手呢？",
        sender: "assistant",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <img src={chatIcon} alt="元元" className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">元元助手</h1>
            <p className="text-xs text-muted-foreground">在线 · 随时为你服务</p>
          </div>
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-slide-up ${
                message.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {message.sender === "assistant" && (
                <img
                  src={chatIcon}
                  alt="元元"
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
              )}
              {message.sender === "user" && (
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold flex-shrink-0">
                  我
                </div>
              )}
              <div
                className={`max-w-[70%] ${
                  message.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <Card
                  className={`p-4 ${
                    message.sender === "user"
                      ? "bg-gradient-primary text-white border-0"
                      : "bg-card"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </Card>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {message.timestamp.toLocaleTimeString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 animate-slide-up">
              <img
                src={chatIcon}
                alt="元元"
                className="w-10 h-10 rounded-full"
              />
              <Card className="p-4 bg-card">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                </div>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.text}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => setInput(action.text)}
                >
                  <div className={`w-4 h-4 rounded ${action.color} flex items-center justify-center mr-2`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  {action.text}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <Input
              placeholder="输入消息... (按Enter发送)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            💡 元元会引导你思考，但不会直接给出作业答案哦
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
