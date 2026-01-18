import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Brain, MessageCircle, TreePine, Heart, Sparkles, User, Search, Star, Smile, Book, Lightbulb, Laugh, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import chatIcon from "@/assets/chat-icon.png";
const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "欢迎来到荣格的房间";
  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setIsAuthenticated(!!session);
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
  const features = [{
    icon: Brain,
    title: "心理测试",
    description: "了解自己的性格与心理状态",
    color: "bg-gradient-primary",
    path: "/tests"
  }, {
    icon: MessageCircle,
    title: "守伴者",
    description: "智能陪伴，情绪陪伴助手",
    color: "bg-gradient-warm",
    path: "/chat"
  }, {
    icon: Search,
    title: "知识检索",
    description: "搜索权威知识，智能排序",
    color: "bg-gradient-primary",
    path: "/knowledge-search"
  }, {
    icon: TreePine,
    title: "心灵树洞",
    description: "匿名分享，温暖倾听",
    color: "bg-gradient-fresh",
    path: "/tree-hole"
  }, {
    icon: Heart,
    title: "心情日记",
    description: "记录每日情绪变化",
    color: "bg-gradient-warm",
    path: "/mood"
  }, {
    icon: Sparkles,
    title: "心灵沙盘",
    description: "互动沙盘，探索内心世界",
    color: "bg-gradient-fresh",
    path: "/sandtray"
  }, {
    icon: User,
    title: "个人中心",
    description: "我的数字形象与记录",
    color: "bg-gradient-primary",
    path: "/profile"
  }, {
    icon: Laugh,
    title: "娱乐中心",
    description: "笑话和脑筋急转弯，放松心情",
    color: "bg-gradient-warm",
    path: "/entertainment"
  }, {
    icon: Shield,
    title: "安全竞赛",
    description: "安全知识问答，学习自我保护",
    color: "bg-gradient-primary",
    path: "/safety-quiz"
  }];
  return <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-12 pb-20">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Star className="absolute top-20 left-10 w-8 h-8 text-accent/30 animate-float" style={{
          animationDelay: "0s"
        }} />
          <Heart className="absolute top-40 right-20 w-6 h-6 text-accent/40 animate-bounce-soft" style={{
          animationDelay: "0.5s"
        }} />
          <Sparkles className="absolute top-60 left-1/4 w-7 h-7 text-primary/30 animate-float" style={{
          animationDelay: "1s"
        }} />
          <Smile className="absolute bottom-40 right-10 w-8 h-8 text-success/40 animate-bounce-soft" style={{
          animationDelay: "1.5s"
        }} />
          <Book className="absolute top-32 right-1/3 w-6 h-6 text-primary/30 animate-float" style={{
          animationDelay: "0.7s"
        }} />
          <Lightbulb className="absolute bottom-32 left-1/3 w-7 h-7 text-accent/40 animate-bounce-soft" style={{
          animationDelay: "2s"
        }} />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center mb-8">
                <img src={chatIcon} alt="守伴者" className="w-32 h-32 rounded-full shadow-float animate-float" />
              </div>
              <div className="inline-block">
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">你的自我探索空间</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight min-h-[5rem] text-center">
                <span className="bg-gradient-primary bg-clip-text text-transparent block text-center">
                  {displayedText}
                  <span className="animate-pulse block">陪伴你成长的每一步，了解自己、管理情绪、轻松生活</span>
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">陪伴你成长的每一步，了解自己、管理情绪、轻松生活</p>
              <div className="flex gap-4 justify-center">
            {!isAuthenticated ? <Button size="lg" className="flex-1 max-w-xs bg-gradient-primary hover:opacity-90 transition-opacity shadow-elegant text-white" onClick={() => navigate("/auth")}>
                <User className="mr-2 h-5 w-5" />
                登录/注册
              </Button> : <>
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-soft" onClick={() => navigate("/chat")}>
                  开始聊天
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/tests")}>
                  心理测试
                </Button>
              </>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-6 text-center border-0 shadow-card hover:shadow-float transition-all duration-300">
              <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground mb-1">7+</div>
              <div className="text-sm text-muted-foreground">实用功能</div>
            </Card>
            <Card className="p-6 text-center border-0 shadow-card hover:shadow-float transition-all duration-300">
              <MessageCircle className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">在线陪伴</div>
            </Card>
            <Card className="p-6 text-center border-0 shadow-card hover:shadow-float transition-all duration-300">
              <Heart className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground mb-1">安全</div>
              <div className="text-sm text-muted-foreground">隐私保护</div>
            </Card>
            <Card className="p-6 text-center border-0 shadow-card hover:shadow-float transition-all duration-300">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground mb-1">智能</div>
              <div className="text-sm text-muted-foreground">AI驱动</div>
            </Card>
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
            return <Card key={feature.title} className="group cursor-pointer overflow-hidden border-0 shadow-card hover:shadow-float transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{
              animationDelay: `${index * 0.1}s`
            }} onClick={() => navigate(feature.path)}>
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
                </Card>;
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
                — 守伴者今日寄语
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>;
};
export default Home;