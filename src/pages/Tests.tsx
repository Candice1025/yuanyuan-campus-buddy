import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Brain, Smile, Heart, TrendingUp, BookOpen, ArrowLeft, Trophy, Star, Briefcase, Cake } from "lucide-react";
import mentalTestIcon from "@/assets/mental-test-icon.png";

const Tests = () => {
  const navigate = useNavigate();

  const tests = [
    {
      id: "mbti",
      title: "MBTI人格测试",
      description: "探索你独特的性格类型，发现真实的自己",
      icon: Brain,
      duration: "约8分钟",
      questions: 16,
      color: "bg-primary",
      badge: "热门",
      path: "/test/mbti"
    },
    {
      id: "stress",
      title: "压力值测试",
      description: "评估当前压力水平，获得专业缓解建议",
      icon: TrendingUp,
      duration: "约8分钟",
      questions: 20,
      color: "bg-accent",
      badge: "推荐",
      path: "/test/stress"
    },
    {
      id: "anxiety",
      title: "焦虑自测量表",
      description: "了解焦虑程度，及时关注心理健康",
      icon: Heart,
      duration: "约10分钟",
      questions: 20,
      color: "bg-success",
      path: "/test/anxiety"
    },
    {
      id: "depression",
      title: "抑郁自评量表",
      description: "筛查抑郁症状，获得专业帮助渠道",
      icon: Smile,
      duration: "约10分钟",
      questions: 20,
      color: "bg-primary",
      path: "/test/depression"
    },
    {
      id: "learning",
      title: "学习风格测试",
      description: "找到最适合你的学习方式，提升效率",
      icon: BookOpen,
      duration: "约6分钟",
      questions: 12,
      color: "bg-accent",
      badge: "新",
      path: "/test/learning"
    },
    {
      id: "animal",
      title: "动物性格测试",
      description: "测试你像哪种动物，发现性格特质",
      icon: Heart,
      duration: "约10分钟",
      questions: 15,
      color: "bg-success",
      badge: "趣味",
      path: "/test/animal-personality"
    },
    {
      id: "mental-age",
      title: "心理年龄测评",
      description: "你的心理年龄是多少岁？",
      icon: Cake,
      duration: "约8分钟",
      questions: 15,
      color: "bg-primary",
      badge: "热门",
      path: "/test/mental-age"
    },
    {
      id: "strengths",
      title: "盖洛普优势识别",
      description: "发现你的5大天赋优势主题",
      icon: Trophy,
      duration: "约12分钟",
      questions: 20,
      color: "bg-accent",
      badge: "专业",
      path: "/test/strengths-finder"
    },
    {
      id: "enneagram",
      title: "九型人格测试",
      description: "探索你的核心人格类型",
      icon: Star,
      duration: "约12分钟",
      questions: 15,
      color: "bg-primary",
      badge: "经典",
      path: "/test/enneagram"
    },
    {
      id: "holland",
      title: "霍兰德职业兴趣",
      description: "找到最适合你的职业方向",
      icon: Briefcase,
      duration: "约15分钟",
      questions: 24,
      color: "bg-success",
      badge: "职业",
      path: "/test/holland"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">心理测试中心</h1>
            <p className="text-sm text-muted-foreground">科学了解自己，健康快乐成长</p>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="px-4 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 bg-gradient-primary border-0 shadow-float overflow-hidden relative">
            <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white">
                  开始探索内心世界
                </h2>
                <p className="text-primary-light text-lg">
                  通过科学的心理测试，更好地认识自己，了解自己的优势和成长空间
                </p>
                <div className="flex gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">10</div>
                    <div className="text-sm text-primary-light">专业测试</div>
                  </div>
                  <div className="w-px bg-primary-light/30"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">10k+</div>
                    <div className="text-sm text-primary-light">已完成</div>
                  </div>
                  <div className="w-px bg-primary-light/30"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">98%</div>
                    <div className="text-sm text-primary-light">好评率</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <img 
                  src={mentalTestIcon} 
                  alt="心理测试" 
                  className="w-48 h-48 object-contain animate-float"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Tests Grid */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {tests.map((test, index) => {
            const Icon = test.icon;
            return (
              <Card
                key={test.id}
                className="group overflow-hidden border-0 shadow-card hover:shadow-float transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(test.path)}
              >
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 rounded-2xl ${test.color} flex items-center justify-center shadow-soft flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                              {test.title}
                            </h3>
                            {test.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {test.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">
                            {test.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          ⏱️ {test.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          📝 {test.questions}题
                        </span>
                      </div>
                      
                      <Button 
                        className="bg-gradient-primary hover:opacity-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(test.path);
                        }}
                      >
                        开始测试
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Tips Section */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <Card className="p-6 bg-muted/50 border-0">
            <h3 className="font-semibold text-foreground mb-3">💡 温馨提示</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 请在安静的环境中完成测试，确保结果准确性</li>
              <li>• 根据真实感受作答，没有对错之分</li>
              <li>• 测试结果仅供参考，如需专业帮助请咨询心理老师</li>
              <li>• 所有测试记录都会保密，请放心作答</li>
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Tests;
