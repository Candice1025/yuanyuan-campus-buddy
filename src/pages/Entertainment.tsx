import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Laugh, Lightbulb, RefreshCw } from "lucide-react";

const jokes = [
  "为什么程序员总是分不清万圣节和圣诞节？\n因为 Oct 31 == Dec 25！",
  "一个程序员去面包店：'给我拿10个面包。如果有鸡蛋，拿12个。'\n结果他拿回来12个面包。\n老板问：'为什么拿12个？'\n程序员：'因为你有鸡蛋啊！'",
  "为什么程序员喜欢黑暗？\n因为光会产生 bug！",
  "医生：你需要多运动\n程序员：我每天都在跑程序啊！",
  "老师：小明，你为什么上课睡觉？\n小明：因为这是我的'休眠模式'",
  "问：什么动物最容易摔倒？\n答：狐狸，因为它狡猾（脚滑）！"
];

const riddles = [
  {
    question: "什么东西越洗越脏？",
    answer: "水"
  },
  {
    question: "什么门永远关不上？",
    answer: "球门"
  },
  {
    question: "什么车可以不用加油？",
    answer: "风车"
  },
  {
    question: "什么书谁也没见过？",
    answer: "天书"
  },
  {
    question: "什么动物的屁股杀伤力最大？",
    answer: "臭鼬"
  },
  {
    question: "铅笔姓什么？",
    answer: "萧，因为削（萧）铅笔"
  }
];

const Entertainment = () => {
  const navigate = useNavigate();
  const [currentJoke, setCurrentJoke] = useState(0);
  const [currentRiddle, setCurrentRiddle] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const nextJoke = () => {
    setCurrentJoke((prev) => (prev + 1) % jokes.length);
  };

  const nextRiddle = () => {
    setCurrentRiddle((prev) => (prev + 1) % riddles.length);
    setShowAnswer(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🎉 娱乐中心
          </h1>
          <p className="text-muted-foreground">
            放松一下，笑一笑，动动脑筋
          </p>
        </div>

        <Tabs defaultValue="jokes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="jokes" className="gap-2">
              <Laugh className="w-4 h-4" />
              笑话
            </TabsTrigger>
            <TabsTrigger value="riddles" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              脑筋急转弯
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jokes" className="animate-fade-in">
            <Card className="border-0 shadow-card">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                    <Laugh className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <CardTitle>每日笑话</CardTitle>
                <CardDescription>让我们开怀一笑吧！</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="min-h-[200px] flex items-center justify-center">
                  <p className="text-lg text-foreground text-center whitespace-pre-line leading-relaxed px-4">
                    {jokes[currentJoke]}
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={nextJoke}
                    size="lg"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    换一个
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="riddles" className="animate-fade-in">
            <Card className="border-0 shadow-card">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Lightbulb className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <CardTitle>脑筋急转弯</CardTitle>
                <CardDescription>动动脑筋，开发智力！</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="min-h-[200px] space-y-6">
                  <div className="text-center space-y-4">
                    <div className="bg-muted/50 rounded-lg p-6">
                      <p className="text-xl font-semibold text-foreground">
                        {riddles[currentRiddle].question}
                      </p>
                    </div>
                    
                    {showAnswer ? (
                      <div className="bg-primary/10 rounded-lg p-6 animate-fade-in">
                        <p className="text-lg text-primary font-semibold">
                          答案：{riddles[currentRiddle].answer}
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowAnswer(true)}
                        variant="outline"
                        size="lg"
                      >
                        显示答案
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={nextRiddle}
                    size="lg"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    下一题
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Entertainment;
