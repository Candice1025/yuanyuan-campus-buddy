import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  MessageCircle,
  TreePine,
  Heart,
  Sparkles,
  Search,
  Shield,
  Zap,
  Users,
  Target,
  Award,
  Clock,
  ArrowLeft,
  CheckCircle,
  Star,
  Smile,
  BookOpen,
  Palette,
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const coreFeatures = [
    {
      icon: Brain,
      title: "心理测试中心",
      description: "涵盖MBTI、九型人格、霍兰德职业测试等10+专业测试，科学评估帮助你深入了解自己",
      highlights: ["专业量表", "详细报告", "成长建议"],
    },
    {
      icon: MessageCircle,
      title: "AI智能陪伴",
      description: "24小时在线的智能伙伴，倾听你的心声，提供温暖陪伴与专业建议",
      highlights: ["情感支持", "智能对话", "隐私保护"],
    },
    {
      icon: TreePine,
      title: "心灵树洞",
      description: "匿名分享空间，释放心中压力，获得社区温暖回应与支持",
      highlights: ["匿名发布", "温暖互动", "情绪疏导"],
    },
    {
      icon: Heart,
      title: "心情日记",
      description: "记录每日情绪变化，追踪心理健康趋势，形成个人成长档案",
      highlights: ["情绪追踪", "可视化分析", "自我觉察"],
    },
    {
      icon: Sparkles,
      title: "心灵沙盘",
      description: "创新互动沙盘疗愈，通过艺术表达探索内心世界，释放潜意识",
      highlights: ["艺术疗愈", "AI解读", "深度探索"],
    },
    {
      icon: Search,
      title: "知识检索",
      description: "整合权威心理健康知识库，智能搜索获取专业解答与资源",
      highlights: ["权威来源", "智能推荐", "持续更新"],
    },
  ];

  const advantages = [
    {
      icon: Shield,
      title: "安全可靠",
      description: "严格数据加密，隐私保护",
    },
    {
      icon: Zap,
      title: "智能高效",
      description: "AI驱动，个性化服务",
    },
    {
      icon: Users,
      title: "专业支持",
      description: "心理学理论支撑",
    },
    {
      icon: Clock,
      title: "全天候服务",
      description: "24/7在线陪伴",
    },
  ];

  const targetUsers = [
    {
      icon: BookOpen,
      title: "学生群体",
      description: "应对学业压力、人际关系、职业规划等挑战",
    },
    {
      icon: Target,
      title: "职场人士",
      description: "缓解工作压力、提升情绪管理能力",
    },
    {
      icon: Smile,
      title: "自我成长者",
      description: "探索内心世界、追求个人发展",
    },
    {
      icon: Heart,
      title: "需要倾诉者",
      description: "寻找情感支持、温暖陪伴",
    },
  ];

  const testimonials = [
    {
      content: "守伴者让我更好地了解了自己，MBTI测试报告非常详细，对我的职业选择帮助很大！",
      author: "小明",
      role: "大学生",
    },
    {
      content: "工作压力大的时候，和AI聊聊天真的能缓解很多，感觉有人在倾听。",
      author: "阿华",
      role: "职场新人",
    },
    {
      content: "心灵树洞让我能够释放压力，看到别人的鼓励真的很温暖。",
      author: "小雨",
      role: "高中生",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <h1 className="text-lg font-semibold text-foreground">产品介绍</h1>
          <Button size="sm" className="bg-gradient-primary" onClick={() => navigate("/")}>
            开始使用
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Star className="absolute top-20 left-10 w-8 h-8 text-accent/30 animate-float" />
          <Heart className="absolute top-40 right-20 w-6 h-6 text-accent/40 animate-bounce-soft" />
          <Sparkles className="absolute bottom-20 left-1/4 w-7 h-7 text-primary/30 animate-float" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center mb-6">
              <img
                alt="守伴者"
                className="w-28 h-28 rounded-full shadow-float animate-float"
                src="/lovable-uploads/5ea5249d-d43c-4d5b-9c8c-a1474573f409.png"
              />
            </div>
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              你的自我探索空间
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                守伴者
              </span>
              <br />
              <span className="text-2xl md:text-3xl text-muted-foreground font-normal mt-2 block">
                陪伴你成长的每一步
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              守伴者是一款专注于心理健康与自我成长的智能陪伴平台。
              我们结合AI技术与心理学理论，为你提供专业的心理测评、温暖的情感陪伴、
              以及丰富的成长工具，帮助你更好地了解自己、管理情绪、积极生活。
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90 shadow-soft"
                onClick={() => navigate("/")}
              >
                立即体验
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/tests")}>
                探索测试
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Vision */}
      <section className="px-4 py-16 bg-card">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">产品愿景</h2>
            <p className="text-muted-foreground">我们相信每个人都值得被理解和陪伴</p>
          </div>
          <Card className="p-8 border-0 shadow-card bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">使命</h3>
                <p className="text-muted-foreground text-sm">
                  让每个人都能获得专业、温暖的心理支持服务
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-warm flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">愿景</h3>
                <p className="text-muted-foreground text-sm">
                  成为最懂你的心理健康伙伴，陪伴每个人健康成长
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-fresh flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">价值观</h3>
                <p className="text-muted-foreground text-sm">
                  专业、温暖、尊重、隐私保护
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">核心功能</h2>
            <p className="text-muted-foreground">六大模块，全方位守护你的心理健康</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="p-6 border-0 shadow-card hover:shadow-float transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {feature.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {feature.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="px-4 py-16 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">产品优势</h2>
            <p className="text-muted-foreground">为什么选择守伴者</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {advantages.map((advantage, index) => {
              const Icon = advantage.icon;
              return (
                <Card
                  key={advantage.title}
                  className="p-6 text-center border-0 shadow-card hover:shadow-float transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-warm flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{advantage.title}</h3>
                  <p className="text-sm text-muted-foreground">{advantage.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">适用人群</h2>
            <p className="text-muted-foreground">守伴者适合每一个追求成长的你</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetUsers.map((user, index) => {
              const Icon = user.icon;
              return (
                <Card
                  key={user.title}
                  className="p-6 border-0 shadow-card hover:shadow-float transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-full bg-gradient-fresh flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{user.title}</h3>
                    <p className="text-sm text-muted-foreground">{user.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">用户心声</h2>
            <p className="text-muted-foreground">来自用户的真实反馈</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-6 border-0 shadow-card hover:shadow-float transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="text-foreground italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-white font-medium">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="p-10 bg-gradient-primary border-0 shadow-float text-center">
            <div className="space-y-6">
              <Palette className="w-12 h-12 text-white mx-auto animate-bounce-soft" />
              <h2 className="text-3xl font-bold text-white">开启你的自我探索之旅</h2>
              <p className="text-white/90 max-w-xl mx-auto">
                守伴者将与你同行，帮助你更好地了解自己、管理情绪、实现成长。
                立即开始，让改变从今天发生。
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => navigate("/")}
                >
                  立即体验
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => navigate("/chat")}
                >
                  开始聊天
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <img
              alt="守伴者"
              className="w-8 h-8 rounded-full"
              src="/lovable-uploads/5ea5249d-d43c-4d5b-9c8c-a1474573f409.png"
            />
            <span className="font-semibold text-foreground">守伴者</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 守伴者 - 陪伴你成长的每一步
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
