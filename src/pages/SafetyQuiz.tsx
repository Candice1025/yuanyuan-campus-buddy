import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Home, AlertTriangle, CloudRain, Heart, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "campus", name: "校园安全", icon: BookOpen },
  { id: "home", name: "居家安全", icon: Home },
  { id: "emergency", name: "应急安全", icon: AlertTriangle },
  { id: "disaster", name: "灾害知识", icon: CloudRain },
  { id: "values", name: "核心价值观", icon: Heart },
  { id: "rules", name: "中小学生守则", icon: Shield }
];

const questions = {
  campus: [
    {
      question: "在校园内发现可疑人员，你应该怎么办？",
      options: ["主动上前盘问", "立即报告老师或保安", "跟随观察", "不理会"],
      answer: 1
    },
    {
      question: "上下楼梯时，正确的做法是？",
      options: ["快速奔跑", "靠右侧慢行", "推挤前进", "三五成群并排走"],
      answer: 1
    },
    {
      question: "课间活动时，不应该做什么？",
      options: ["在走廊追逐打闹", "到操场活动", "在教室休息", "与同学交流"],
      answer: 0
    },
    {
      question: "校园内哪些区域属于危险区域？",
      options: ["图书馆", "实验室化学品存放处", "操场", "教室"],
      answer: 1
    },
    {
      question: "体育课前应该做什么准备？",
      options: ["直接开始运动", "做好热身运动", "吃大量食物", "喝大量冷水"],
      answer: 1
    }
  ],
  home: [
    {
      question: "独自在家时，有陌生人敲门应该怎么办？",
      options: ["马上开门", "不理睬", "透过猫眼观察，不随意开门", "大声呵斥"],
      answer: 2
    },
    {
      question: "使用燃气灶时，应该注意什么？",
      options: ["用完后立即关闭阀门", "可以长时间离开", "同时使用多个灶眼", "不需要开窗通风"],
      answer: 0
    },
    {
      question: "发现家中煤气泄漏，正确的做法是？",
      options: ["开灯检查", "立即开窗通风并关闭阀门", "使用明火", "打开电扇"],
      answer: 1
    },
    {
      question: "电器着火时，首先应该怎么做？",
      options: ["用水扑灭", "切断电源", "用手拍打", "不管它"],
      answer: 1
    },
    {
      question: "使用家电时，以下哪项是错误的？",
      options: ["湿手触摸电器", "使用前检查插头", "用完后拔掉插头", "不超负荷用电"],
      answer: 0
    }
  ],
  emergency: [
    {
      question: "我国火警电话号码是？",
      options: ["110", "119", "120", "122"],
      answer: 1
    },
    {
      question: "发生地震时在室内应该怎么做？",
      options: ["跳楼逃生", "乘坐电梯", "躲在坚固的桌下或墙角", "站在窗边"],
      answer: 2
    },
    {
      question: "遇到交通事故应拨打什么电话？",
      options: ["110", "119", "120", "122"],
      answer: 3
    },
    {
      question: "发现有人溺水，正确的救援方法是？",
      options: ["立即跳水救人", "大声呼救并寻求帮助", "在岸边观望", "自己游过去拉"],
      answer: 1
    },
    {
      question: "发生火灾逃生时，应该？",
      options: ["乘坐电梯", "用湿毛巾捂住口鼻，低姿势前进", "打开所有门窗", "往楼上跑"],
      answer: 1
    }
  ],
  disaster: [
    {
      question: "台风来临前，应该做什么准备？",
      options: ["外出游玩", "关好门窗，准备食物和水", "在室外活动", "不需要准备"],
      answer: 1
    },
    {
      question: "雷雨天气时，不应该做什么？",
      options: ["躲在室内", "在大树下避雨", "远离金属物体", "关闭电器"],
      answer: 1
    },
    {
      question: "发生洪水时，正确的逃生方法是？",
      options: ["往低处跑", "向高处转移", "在水中游泳", "等待救援不动"],
      answer: 1
    },
    {
      question: "地震发生后，如果被困在废墟中应该？",
      options: ["大声呼喊", "保存体力，有规律地敲击物体", "乱动尝试挖开", "放弃求生"],
      answer: 1
    },
    {
      question: "遇到沙尘暴天气，应该如何防护？",
      options: ["出门不戴口罩", "戴口罩、护目镜，减少外出", "在室外长时间停留", "开窗通风"],
      answer: 1
    }
  ],
  values: [
    {
      question: "社会主义核心价值观在国家层面的价值要求是？",
      options: ["富强、民主、文明、和谐", "自由、平等、公正、法治", "爱国、敬业、诚信、友善", "以上都是"],
      answer: 0
    },
    {
      question: "社会主义核心价值观在社会层面的价值要求是？",
      options: ["富强、民主、文明、和谐", "自由、平等、公正、法治", "爱国、敬业、诚信、友善", "团结、友爱、互助、奉献"],
      answer: 1
    },
    {
      question: "社会主义核心价值观在公民层面的价值要求是？",
      options: ["富强、民主、文明、和谐", "自由、平等、公正、法治", "爱国、敬业、诚信、友善", "勤劳、勇敢、善良、正直"],
      answer: 2
    },
    {
      question: "作为学生，践行社会主义核心价值观，应该从哪里做起？",
      options: ["只需要考试考好", "从日常小事做起，做到诚信友善", "不需要特别做什么", "只在学校表现好"],
      answer: 1
    },
    {
      question: "\"爱国\"作为公民层面的价值要求，我们应该如何做？",
      options: ["只在国庆节升国旗", "热爱祖国，尊重国旗国歌", "只要不犯法就行", "爱国与我无关"],
      answer: 1
    }
  ],
  rules: [
    {
      question: "中小学生守则要求学生做到的第一条是？",
      options: ["诚实守信", "爱党爱国爱人民", "勤劳节俭", "遵守法律"],
      answer: 1
    },
    {
      question: "作为中小学生，在学校应该怎样对待老师？",
      options: ["见面不打招呼", "尊敬师长，问候老师", "只听话不提问", "随意顶撞"],
      answer: 1
    },
    {
      question: "中小学生守则中关于学习的要求是？",
      options: ["应付考试就行", "勤奋学习，上课认真听讲", "只学自己喜欢的", "考试及格即可"],
      answer: 1
    },
    {
      question: "作为中小学生，应该如何对待同学？",
      options: ["只和成绩好的交朋友", "团结同学，互帮互助", "只考虑自己", "欺负弱小同学"],
      answer: 1
    },
    {
      question: "中小学生守则中关于劳动的要求是？",
      options: ["劳动是大人的事", "主动分担家务，参加劳动", "只学习不劳动", "让父母代劳"],
      answer: 1
    }
  ]
};

const SafetyQuiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentCategory, setCurrentCategory] = useState("campus");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuestions = questions[currentCategory as keyof typeof questions];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(index);
    setAnsweredQuestions(prev => prev + 1);
    
    if (index === currentQuestion.answer) {
      setScore(prev => prev + 1);
      toast({
        title: "回答正确！",
        description: "太棒了，继续加油！",
      });
    } else {
      toast({
        title: "回答错误",
        description: `正确答案是：${currentQuestion.options[currentQuestion.answer]}`,
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnsweredQuestions(0);
    setShowResult(false);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnsweredQuestions(0);
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🏆 安全知识竞赛
          </h1>
          <p className="text-muted-foreground">
            学习安全知识，守护美好生活
          </p>
        </div>

        <Tabs value={currentCategory} onValueChange={handleCategoryChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8 h-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="gap-1 py-3 flex-col h-auto"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="animate-fade-in">
              {!showResult ? (
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                      <CardTitle className="text-2xl">
                        题目 {currentQuestionIndex + 1}/{currentQuestions.length}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        得分: {score}/{answeredQuestions}
                      </div>
                    </div>
                    <CardDescription className="text-lg font-medium text-foreground">
                      {currentQuestion.question}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === currentQuestion.answer;
                        const showAnswer = selectedAnswer !== null;
                        
                        let buttonClass = "w-full justify-start text-left h-auto py-4 px-6 ";
                        if (showAnswer) {
                          if (isCorrect) {
                            buttonClass += "bg-success/20 hover:bg-success/20 border-success text-success";
                          } else if (isSelected && !isCorrect) {
                            buttonClass += "bg-destructive/20 hover:bg-destructive/20 border-destructive text-destructive";
                          }
                        } else if (isSelected) {
                          buttonClass += "bg-primary/10 border-primary";
                        }

                        return (
                          <Button
                            key={index}
                            variant="outline"
                            className={buttonClass}
                            onClick={() => handleAnswerSelect(index)}
                            disabled={selectedAnswer !== null}
                          >
                            <span className="mr-3 font-semibold">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span className="flex-1">{option}</span>
                            {showAnswer && isCorrect && (
                              <CheckCircle2 className="w-5 h-5 ml-2" />
                            )}
                            {showAnswer && isSelected && !isCorrect && (
                              <XCircle className="w-5 h-5 ml-2" />
                            )}
                          </Button>
                        );
                      })}
                    </div>

                    {selectedAnswer !== null && (
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={handleNext}
                          size="lg"
                          className="gap-2"
                        >
                          {currentQuestionIndex < currentQuestions.length - 1 ? "下一题" : "查看结果"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-card">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                        <Shield className="w-10 h-10 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-3xl mb-2">测试完成！</CardTitle>
                    <CardDescription className="text-lg">
                      {category.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center space-y-4">
                      <div className="text-5xl font-bold text-primary">
                        {score}/{currentQuestions.length}
                      </div>
                      <p className="text-xl text-muted-foreground">
                        正确率: {((score / currentQuestions.length) * 100).toFixed(0)}%
                      </p>
                      
                      <div className="bg-muted/50 rounded-lg p-6 mt-6">
                        <p className="text-lg font-semibold mb-2">
                          {score === currentQuestions.length 
                            ? "🎉 太棒了！全部答对！" 
                            : score >= currentQuestions.length * 0.8
                            ? "👍 很好！继续保持！"
                            : score >= currentQuestions.length * 0.6
                            ? "💪 不错！还需努力！"
                            : "📚 加油！多学习安全知识！"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center pt-4">
                      <Button
                        onClick={handleRestart}
                        variant="outline"
                        size="lg"
                      >
                        重新测试
                      </Button>
                      <Button
                        onClick={() => navigate("/")}
                        size="lg"
                      >
                        返回首页
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default SafetyQuiz;
