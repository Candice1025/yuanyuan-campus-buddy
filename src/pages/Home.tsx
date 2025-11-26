import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Brain, MessageCircle, TreePine, Heart, Sparkles, User, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import chatIcon from "@/assets/chat-icon.png";

const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "你好，我是元元";

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Typewriter effect
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(timer);
      }
    }, 150);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "心理测试",
      description: "了解自己的性格与心理状态",
      color: "bg-gradient-primary",
      path: "/tests"
    },
    {
      icon: MessageCircle,
      title: "元元助手",
      description: "智能陪伴，学习好帮手",
      color: "bg-gradient-warm",
      path: "/chat"
    },
    {
      icon: Search,
      title: "知识检索",
      description: "搜索权威知识，智能排序",
      color: "bg-gradient-primary",
      path: "/knowledge-search"
    },
    {
      icon: TreePine,
      title: "心灵树洞",
      description: "匿名分享，温暖倾听",
      color: "bg-gradient-fresh",
      path: "/tree-hole"
    },
    {
      icon: Heart,
      title: "心情日记",
      description: "记录每日情绪变化",
      color: "bg-gradient-warm",
      path: "/mood"
    },
    {
      icon: Sparkles,
      title: "心灵沙盘",
      description: "互动沙盘，探索内心世界",
      color: "bg-gradient-fresh",
      path: "/sandtray"
    },
    {
      icon: User,
      title: "个人中心",
      description: "我的数字形象与记录",
      color: "bg-gradient-primary",
      path: "/profile"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-12 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-center mb-8">
                <img 
                  src={chatIcon} 
                  alt="元元" 
                  className="w-32 h-32 rounded-full shadow-float animate-float"
                />
              </div>
              <div className="inline-block">
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  你的校园生活小帮手
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight min-h-[5rem]">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {displayedText}
                  <span className="animate-pulse">|</span>
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                陪伴你成长的每一步，了解自己、管理情绪、快乐学习
              </p>
              <div className="flex gap-4 justify-center">
            {!isAuthenticated ? (
              <Button 
                size="lg" 
                className="flex-1 max-w-xs bg-gradient-primary hover:opacity-90 transition-opacity shadow-elegant text-white"
                onClick={() => navigate("/auth")}
              >
                <User className="mr-2 h-5 w-5" />
                登录/注册
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90 shadow-soft"
                  onClick={() => navigate("/chat")}
                >
                  开始聊天
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate("/tests")}
                >
                  心理测试
                </Button>
              </>
            )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              探索更多功能
            </h2>
            <p className="text-muted-foreground">
              发现适合你的成长工具
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group cursor-pointer overflow-hidden border-0 shadow-card hover:shadow-float transition-all duration-300 hover:-translate-y-2 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(feature.path)}
                >
                  <div className="p-6 space-y-4">
                    <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Daily Quote Section */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-primary border-0 shadow-float animate-fade-in">
            <div className="text-center space-y-4">
              <Sparkles className="w-10 h-10 text-white mx-auto animate-bounce-soft" />
              <blockquote className="text-2xl font-medium text-white">
                "每一天都是新的开始，相信自己的力量"
              </blockquote>
              <p className="text-primary-light">
                — 元元今日寄语
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
