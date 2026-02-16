import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LearningTest = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    checkAuth();
  }, []);

  // VARK学习风格测试问题
  const questions = [
    {
      id: 0,
      question: "学习新内容时，你更喜欢：",
      options: [
        { value: "V", label: "A. 看图表、视频或示意图" },
        { value: "A", label: "B. 听老师讲解或音频材料" },
        { value: "R", label: "C. 阅读文字资料和笔记" },
        { value: "K", label: "D. 动手实践或做实验" }
      ]
    },
    {
      id: 1,
      question: "记忆知识点时，你倾向于：",
      options: [
        { value: "V", label: "A. 绘制思维导图或流程图" },
        { value: "A", label: "B. 大声朗读或与人讨论" },
        { value: "R", label: "C. 反复阅读和做笔记" },
        { value: "K", label: "D. 通过实践操作来记忆" }
      ]
    },
    {
      id: 2,
      question: "课堂上，你最容易理解：",
      options: [
        { value: "V", label: "A. 老师在黑板上画的图和演示" },
        { value: "A", label: "B. 老师的口头讲解" },
        { value: "R", label: "C. 课本和讲义上的文字" },
        { value: "K", label: "D. 实验演示和动手活动" }
      ]
    },
    {
      id: 3,
      question: "复习考试时，你更喜欢：",
      options: [
        { value: "V", label: "A. 看彩色标注的笔记和图表" },
        { value: "A", label: "B. 听录音或给别人讲解" },
        { value: "R", label: "C. 阅读教材和总结资料" },
        { value: "K", label: "D. 做练习题和模拟实践" }
      ]
    },
    {
      id: 4,
      question: "解决数学题时，你习惯：",
      options: [
        { value: "V", label: "A. 画图辅助理解题意" },
        { value: "A", label: "B. 念题目或与人讨论思路" },
        { value: "R", label: "C. 仔细阅读题目和步骤" },
        { value: "K", label: "D. 边写边算，动手演练" }
      ]
    },
    {
      id: 5,
      question: "学习历史事件时，你更容易记住：",
      options: [
        { value: "V", label: "A. 历史地图和人物画像" },
        { value: "A", label: "B. 老师讲的故事和音频资料" },
        { value: "R", label: "C. 课文和历史文献" },
        { value: "K", label: "D. 参观博物馆或角色扮演" }
      ]
    },
    {
      id: 6,
      question: "做小组项目时，你更擅长：",
      options: [
        { value: "V", label: "A. 制作海报和PPT" },
        { value: "A", label: "B. 口头汇报和讨论" },
        { value: "R", label: "C. 撰写报告和文档" },
        { value: "K", label: "D. 动手制作和实验操作" }
      ]
    },
    {
      id: 7,
      question: "遇到不懂的问题，你会：",
      options: [
        { value: "V", label: "A. 找视频教程或图解" },
        { value: "A", label: "B. 问老师或同学" },
        { value: "R", label: "C. 查阅参考书和资料" },
        { value: "K", label: "D. 自己尝试操作一遍" }
      ]
    },
    {
      id: 8,
      question: "记住新单词时，你喜欢：",
      options: [
        { value: "V", label: "A. 看单词卡片和图片" },
        { value: "A", label: "B. 听单词发音和造句" },
        { value: "R", label: "C. 反复抄写和拼读" },
        { value: "K", label: "D. 在实际对话中使用" }
      ]
    },
    {
      id: 9,
      question: "上课走神时，你容易被吸引的是：",
      options: [
        { value: "V", label: "A. 窗外的景色或教室装饰" },
        { value: "A", label: "B. 周围的声音或音乐" },
        { value: "R", label: "C. 书本上的其他内容" },
        { value: "K", label: "D. 手里的东西或身体不适" }
      ]
    },
    {
      id: 10,
      question: "完成作业时，你的习惯是：",
      options: [
        { value: "V", label: "A. 需要整洁的环境和清晰的资料" },
        { value: "A", label: "B. 喜欢听音乐或与人交流" },
        { value: "R", label: "C. 喜欢安静地阅读和写作" },
        { value: "K", label: "D. 需要走动或变换姿势" }
      ]
    },
    {
      id: 11,
      question: "学习科学知识时，你觉得最有帮助的是：",
      options: [
        { value: "V", label: "A. 图表、模型和动画" },
        { value: "A", label: "B. 老师的讲解和讨论" },
        { value: "R", label: "C. 教科书和科学文章" },
        { value: "K", label: "D. 实验操作和实地考察" }
      ]
    }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Save test result before showing results
      if (userId) {
        const result = getResult();
        try {
          await supabase.from("test_results").insert({
            user_id: userId,
            test_type: "learning",
            test_name: "学习风格测试",
            result: JSON.stringify(result)
          });
        } catch (error) {
          console.error("Error saving test result:", error);
          toast.error("保存测试结果失败");
        }
      }
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getResult = () => {
    const counts = { V: 0, A: 0, R: 0, K: 0 };
    Object.values(answers).forEach((answer) => {
      counts[answer as keyof typeof counts]++;
    });

    // 找出得分最高的学习风格
    const maxScore = Math.max(...Object.values(counts));
    const dominantStyle = Object.entries(counts).find(([_, score]) => score === maxScore)?.[0] || "V";

    const results: Record<string, any> = {
      V: {
        name: "视觉学习者",
        desc: "通过图像和视觉材料学习效果最佳",
        color: "bg-primary",
        icon: "👁️",
        strengths: ["善于记忆图表和图像", "喜欢用颜色标注", "空间感知能力强", "擅长视觉化思考"],
        tips: [
          "📊 多使用思维导图和流程图",
          "🎨 用不同颜色标注重点",
          "📹 观看教学视频和动画",
          "🖼️ 将概念转化为图像"
        ]
      },
      A: {
        name: "听觉学习者",
        desc: "通过听讲和讨论学习效果最佳",
        color: "bg-success",
        icon: "👂",
        strengths: ["擅长口头交流", "记忆力强", "善于倾听", "语言表达能力好"],
        tips: [
          "🎧 多听音频课程和讲座",
          "💬 参与小组讨论和学习",
          "📢 大声朗读和复述",
          "🎵 用韵律和节奏辅助记忆"
        ]
      },
      R: {
        name: "读写学习者",
        desc: "通过阅读和写作学习效果最佳",
        color: "bg-accent",
        icon: "📚",
        strengths: ["阅读理解能力强", "善于文字表达", "逻辑思维清晰", "喜欢做笔记"],
        tips: [
          "📝 多做笔记和总结",
          "📖 广泛阅读相关资料",
          "✍️ 用写作来整理思路",
          "📋 制作清单和大纲"
        ]
      },
      K: {
        name: "动觉学习者",
        desc: "通过实践和体验学习效果最佳",
        color: "bg-primary",
        icon: "🤸",
        strengths: ["动手能力强", "善于实践操作", "身体协调性好", "喜欢探索"],
        tips: [
          "🔬 多做实验和实践活动",
          "🏃 学习时适当走动",
          "🎯 通过游戏和活动学习",
          "👐 使用实物模型和教具"
        ]
      }
    };

    return { ...results[dominantStyle], type: dominantStyle, scores: counts };
  };

  if (showResult) {
    const result = getResult();
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/tests")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">测试结果</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className={`p-8 ${result.color} border-0 shadow-float text-white text-center mb-8 animate-fade-in`}>
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <div className="text-6xl mb-4">{result.icon}</div>
            <h2 className="text-4xl font-bold mb-3">{result.name}</h2>
            <p className="text-xl opacity-90">{result.desc}</p>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up">
            <h3 className="text-xl font-semibold text-foreground mb-4">得分分布</h3>
            <div className="space-y-3">
              {Object.entries(result.scores as Record<string, number>).map(([style, score]) => {
                const percentage = (score / questions.length) * 100;
                const styleNames: Record<string, string> = {
                  V: "视觉", A: "听觉", R: "读写", K: "动觉"
                };
                return (
                  <div key={style}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{styleNames[style]}</span>
                      <span className="text-muted-foreground">{score}/{questions.length}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4">你的优势</h3>
            <div className="grid grid-cols-2 gap-3">
              {result.strengths.map((strength: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-card mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4">学习建议</h3>
            <div className="space-y-3 text-muted-foreground">
              {result.tips.map((tip: string, index: number) => (
                <p key={index}>{tip}</p>
              ))}
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/tests")}
            >
              返回测试中心
            </Button>
            <Button
              className="flex-1 bg-gradient-primary"
              onClick={() => navigate("/")}
            >
              回到首页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/tests")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">学习风格测试</h1>
              <p className="text-sm text-muted-foreground">
                问题 {currentQuestion + 1} / {questions.length}
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8 shadow-card mb-8 animate-fade-in">
          <h2 className="text-2xl font-semibold text-foreground mb-8">
            {currentQ.question}
          </h2>
          
          <RadioGroup
            value={answers[currentQuestion]}
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            {currentQ.options.map((option) => (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-primary hover:bg-primary/5 ${
                  answers[currentQuestion] === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => handleAnswer(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label
                  htmlFor={option.value}
                  className="flex-1 cursor-pointer text-base"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一题
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion]}
            className="flex-1 bg-gradient-primary"
          >
            {currentQuestion === questions.length - 1 ? "查看结果" : "下一题"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LearningTest;