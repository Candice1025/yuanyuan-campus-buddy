import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Sparkles, Book, Heart, Lightbulb, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import chatIcon from "@/assets/chat-icon.png";
interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}
const Chat = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    content: "你好呀！我是元元，你的校园生活小帮手 🌟\n\n我可以帮你：\n✨ 解答学习问题（但不会直接给答案哦）\n💭 倾听你的烦恼\n📚 分享学习方法\n💡 激发学习灵感\n\n有什么我可以帮你的吗？",
    sender: "assistant",
    timestamp: new Date()
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // 检查用户登录状态并加载历史消息
    supabase.auth.getUser().then(async ({
      data: {
        user
      }
    }) => {
      setUser(user);
      if (user) {
        // 加载历史聊天记录
        const {
          data: chatHistory
        } = await supabase.from('chat_messages').select('*').eq('user_id', user.id).order('created_at', {
          ascending: true
        }).limit(50);
        if (chatHistory && chatHistory.length > 0) {
          const historicalMessages = chatHistory.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender as "user" | "assistant",
            timestamp: new Date(msg.created_at)
          }));
          setMessages(prev => [...prev, ...historicalMessages]);
        }
      }
    });
  }, []);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const quickActions = [{
    icon: Book,
    text: "学习帮助",
    color: "bg-primary"
  }, {
    icon: Heart,
    text: "心情倾诉",
    color: "bg-accent"
  }, {
    icon: Lightbulb,
    text: "灵感启发",
    color: "bg-success"
  }];
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

      // 只发送最近的对话历史（最多10条消息），排除第一条欢迎消息
      const recentMessages = [...messages.slice(1), userMessage].slice(-10);
      const chatMessages = recentMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content
      }));
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          messages: chatMessages
        })
      });
      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "请求过于频繁",
            description: "请稍后再试",
            variant: "destructive"
          });
          setIsTyping(false);
          return;
        }
        if (response.status === 402) {
          toast({
            title: "服务暂时不可用",
            description: "AI服务额度不足",
            variant: "destructive"
          });
          setIsTyping(false);
          return;
        }
        throw new Error("Failed to get response");
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let assistantContent = "";
      let assistantMessageId = (Date.now() + 1).toString();
      let textBuffer = "";
      while (true) {
        const {
          done,
          value
        } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, {
          stream: true
        });
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
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.sender === "assistant" && last?.id === assistantMessageId) {
                  return prev.map(m => m.id === assistantMessageId ? {
                    ...m,
                    content: assistantContent
                  } : m);
                }
                return [...prev, {
                  id: assistantMessageId,
                  content: assistantContent,
                  sender: "assistant",
                  timestamp: new Date()
                }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
      setIsTyping(false);

      // 保存聊天记录到数据库
      if (user) {
        await supabase.from('chat_messages').insert([{
          user_id: user.id,
          content: userMessage.content,
          sender: 'user'
        }, {
          user_id: user.id,
          content: assistantContent,
          sender: 'assistant'
        }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "发送失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
      setIsTyping(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleDeleteMessage = async (messageId: string) => {
    try {
      // 从UI中删除消息
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      // 从数据库中删除消息
      if (user) {
        const {
          error
        } = await supabase.from('chat_messages').delete().eq('id', messageId).eq('user_id', user.id);
        if (error) throw error;
        toast({
          title: "删除成功",
          description: "消息已删除"
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "删除失败",
        description: "请重试",
        variant: "destructive"
      });
    }
  };
  const handleClearAllMessages = async () => {
    try {
      if (user) {
        const {
          error
        } = await supabase.from('chat_messages').delete().eq('user_id', user.id);
        if (error) throw error;
      }

      // 清空UI中的所有消息，保留初始欢迎消息
      setMessages([{
        id: "1",
        content: "你好呀！我是元元，你的校园生活小帮手 🌟\n\n我可以帮你：\n✨ 解答学习问题（但不会直接给答案哦）\n💭 倾听你的烦恼\n📚 分享学习方法\n💡 激发学习灵感\n\n有什么我可以帮你的吗？",
        sender: "assistant",
        timestamp: new Date()
      }]);
      toast({
        title: "清空成功",
        description: "所有聊天记录已清空"
      });
    } catch (error) {
      console.error("Clear all error:", error);
      toast({
        title: "清空失败",
        description: "请重试",
        variant: "destructive"
      });
    }
  };
  return <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <img src={chatIcon} alt="元元" className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">守伴者</h1>
            <p className="text-xs text-muted-foreground">在线 · 随时为你服务</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClearAllMessages} title="清空聊天记录">
            <Trash2 className="w-5 h-5 text-muted-foreground hover:text-destructive" />
          </Button>
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map(message => <div key={message.id} className={`flex gap-3 animate-slide-up group ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
              {message.sender === "assistant" && <img src={chatIcon} alt="元元" className="w-10 h-10 rounded-full flex-shrink-0" />}
              {message.sender === "user" && <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold flex-shrink-0">
                  我
                </div>}
              <div className={`max-w-[70%] ${message.sender === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <div className="flex items-start gap-2">
                  <Card className={`p-4 ${message.sender === "user" ? "bg-gradient-primary text-white border-0" : "bg-card"}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </Card>
                  {message.id !== "1" && <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteMessage(message.id)}>
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>}
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {message.timestamp.toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit"
              })}
                </p>
              </div>
            </div>)}
          
          {isTyping && <div className="flex gap-3 animate-slide-up">
              <img src={chatIcon} alt="元元" className="w-10 h-10 rounded-full" />
              <Card className="p-4 bg-card">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{
                animationDelay: "0.1s"
              }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{
                animationDelay: "0.2s"
              }}></span>
                </div>
              </Card>
            </div>}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map(action => {
            const Icon = action.icon;
            return <Button key={action.text} variant="outline" size="sm" className="flex-shrink-0" onClick={() => setInput(action.text)}>
                  <div className={`w-4 h-4 rounded ${action.color} flex items-center justify-center mr-2`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  {action.text}
                </Button>;
          })}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <Input placeholder="输入消息... (按Enter发送)" value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress} className="flex-1" />
            <Button onClick={handleSend} disabled={!input.trim()} className="bg-gradient-primary hover:opacity-90">
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            💡 元元会引导你思考，但不会直接给出作业答案哦
          </p>
        </div>
      </div>
    </div>;
};
export default Chat;