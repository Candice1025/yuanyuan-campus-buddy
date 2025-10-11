import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, MessageCircle, Send, TreePine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import treeHoleIcon from "@/assets/tree-hole-icon.png";

interface Post {
  id: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  mood: string;
}

const TreeHole = () => {
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      content: "今天考试考砸了，感觉很沮丧...但是想想明天又是新的一天！加油！",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      likes: 24,
      comments: 8,
      mood: "加油"
    },
    {
      id: "2",
      content: "终于理解了那道数学题！原来解题的关键在于换个角度思考。感谢元元的引导！",
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      likes: 42,
      comments: 15,
      mood: "开心"
    },
    {
      id: "3",
      content: "最近压力有点大，但是看到大家都在努力，我也不能放弃！一起加油吧！",
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      likes: 56,
      comments: 23,
      mood: "奋斗"
    }
  ]);

  const moods = ["开心", "难过", "焦虑", "压力大", "兴奋", "平静", "迷茫", "感恩"];

  const handlePost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      content: newPost,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      mood: "分享"
    };

    setPosts([post, ...posts]);
    setNewPost("");
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <TreePine className="w-6 h-6 text-success" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">心灵树洞</h1>
            <p className="text-sm text-muted-foreground">匿名分享，温暖倾听</p>
          </div>
        </div>
      </header>

      {/* Banner */}
      <section className="px-4 pt-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 bg-gradient-fresh border-0 shadow-soft overflow-hidden relative">
            <div className="relative z-10 flex items-center gap-4">
              <img 
                src={treeHoleIcon} 
                alt="树洞" 
                className="w-20 h-20 object-contain animate-float"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">
                  这里是安全的倾诉空间
                </h2>
                <p className="text-white/90 text-sm">
                  所有分享都是匿名的，请放心表达真实的感受
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Post Input */}
      <section className="px-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-4 shadow-card">
            <Textarea
              placeholder="写下你的心声... (匿名发布，无需担心)"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px] resize-none border-0 focus-visible:ring-0"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex gap-2 flex-wrap">
                {moods.slice(0, 4).map(mood => (
                  <Badge
                    key={mood}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {mood}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={handlePost}
                disabled={!newPost.trim()}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Send className="w-4 h-4 mr-2" />
                发布
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Posts List */}
      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto space-y-4">
          {posts.map((post, index) => (
            <Card
              key={post.id}
              className="p-5 shadow-card hover:shadow-soft transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-fresh flex items-center justify-center text-white text-sm font-medium">
                        匿
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {post.timestamp.toLocaleString("zh-CN", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {post.mood}
                      </Badge>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className="hover:text-accent hover:bg-accent/10"
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    {post.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-primary hover:bg-primary/10"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.comments}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-4 bg-muted/50 border-0">
            <p className="text-sm text-muted-foreground text-center">
              💚 在这里，每个声音都值得被听见。互相理解，互相支持。
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default TreeHole;
