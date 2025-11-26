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
  "问：什么动物最容易摔倒？\n答：狐狸，因为它狡猾（脚滑）！",
  "小明：'老师，我以后再也不调皮了。'\n老师：'你说了多少次了？'\n小明：'我也记不清了，内存不够了。'",
  "妈妈：'你怎么又在玩手机？'\n孩子：'我在学习啊！'\n妈妈：'学什么？'\n孩子：'学习如何躲避你的检查。'",
  "为什么学生总是很饿？\n因为他们是学生（学'剩'）！",
  "老师：'同学们，谁能用\"一边...一边...\"造句？'\n小明：'我妈一边打我，一边骂我。'\n老师：'......能不能说点积极的？'\n小明：'我爸一边喝酒，一边夸我。'",
  "问：什么东西越生气越大？\n答：脾气！",
  "同学：'你周末干嘛去了？'\n我：'在家躺着。'\n同学：'就这样？'\n我：'不然呢？躺着还要收费吗？'",
  "小红：'你知道吗？我发现了一个秘密！'\n小明：'什么秘密？'\n小红：'就是...我不告诉你！'",
  "老师：'请用\"果然\"造句。'\n学生：'我先吃水果，然后再吃饭。'\n老师：'......'",
  "为什么鱼不能说话？\n因为它在水里会被呛到！",
  "问：什么人一年只工作一天？\n答：圣诞老人！",
  "小明：'爸爸，为什么白天看不见星星？'\n爸爸：'因为星星去上班了。'\n小明：'那月亮呢？'\n爸爸：'月亮是夜班的。'",
  "老师：'小明，你的作文怎么和小红的一模一样？'\n小明：'因为我们写的是同一件事啊！'\n老师：'什么事？'\n小明：'抄作业这件事。'",
  "为什么猴子不喜欢平行线？\n因为平行线没有相交（香蕉）！",
  "问：什么老鼠用两只脚走路？\n答：米老鼠！\n问：什么鸭子用两只脚走路？\n答：所有的鸭子都用两只脚走路！"
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
  },
  {
    question: "什么东西天气越热，它爬得越高？",
    answer: "温度计"
  },
  {
    question: "什么东西有头无脚？",
    answer: "砖头"
  },
  {
    question: "什么东西越多越便宜？",
    answer: "照相（相片多了就不值钱了）"
  },
  {
    question: "一个人从飞机上掉下来，为什么没摔死？",
    answer: "飞机还没起飞"
  },
  {
    question: "什么东西最喜欢晒太阳？",
    answer: "太阳镜"
  },
  {
    question: "什么动物被打死后还会跳？",
    answer: "跳蚤"
  },
  {
    question: "一只鸡，一只鹅，放冰箱里，鸡冻死了，鹅却活着，为什么？",
    answer: "是企鹅"
  },
  {
    question: "什么东西往上升永远不会下降？",
    answer: "年龄"
  },
  {
    question: "用什么可以解开所有的谜？",
    answer: "答案"
  },
  {
    question: "什么英文字母最多人喜欢听？",
    answer: "CD"
  },
  {
    question: "什么东西每天都会来，却永远不会到？",
    answer: "明天"
  },
  {
    question: "小王与父母头一次出国旅行，由于语言不通，他的父母显得不知所措，小王也不懂外语，却象在自己国家里一样未曾感到丝毫不便，为什么？",
    answer: "小王是婴儿"
  },
  {
    question: "什么东西放在火中不会燃烧，放在水中不会下沉？",
    answer: "冰块"
  },
  {
    question: "一个不会游泳的人掉进了水里却没有淹死，为什么？",
    answer: "穿着救生衣"
  },
  {
    question: "什么动物的屁最臭？",
    answer: "黄鼠狼，因为黄鼠狼放屁（放臭屁）"
  },
  {
    question: "什么事每人每天都必须认真地做？",
    answer: "睡觉"
  },
  {
    question: "什么人始终不敢洗澡？",
    answer: "泥人"
  },
  {
    question: "小明的爸爸找了人座位坐下，小明也在同一个房间找个地方坐下来，小明的爸爸却不能坐在小明的位置上，小明坐在哪儿，为什么？",
    answer: "小明坐在爸爸的腿上"
  },
  {
    question: "什么官不仅不领工资，还要自掏腰包？",
    answer: "新郎官"
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
