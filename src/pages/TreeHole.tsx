import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, MessageCircle, Send, TreePine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 检查用户登录状态
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // 加载帖子
    fetchPosts();

    // 监听实时更新
    const channel = supabase
      .channel('tree_hole_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tree_hole_posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('tree_hole_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    setPosts(data.map(post => ({
      id: post.id,
      content: post.content,
      timestamp: new Date(post.created_at),
      likes: post.likes,
      comments: post.comments_count,
      mood: post.mood
    })));
  };

  const moods = ["开心", "难过", "焦虑", "压力大", "兴奋", "平静", "迷茫", "感恩"];

  const handlePost = async () => {
    if (!newPost.trim()) return;

    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录才能发布内容",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from('tree_hole_posts')
      .insert({
        content: newPost,
        mood: selectedMood || "分享",
        user_id: user.id
      });

    setIsLoading(false);

    if (error) {
      toast({
        title: "发布失败",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "发布成功",
      description: "你的心声已匿名发布"
    });

    setNewPost("");
    setSelectedMood("");
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录才能点赞",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    // 检查是否已点赞
    const { data: existingLike } = await supabase
      .from('tree_hole_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingLike) {
      // 取消点赞
      const { error } = await supabase
        .from('tree_hole_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (!error) {
        await supabase
          .from('tree_hole_posts')
          .update({ likes: Math.max(0, posts.find(p => p.id === postId)!.likes - 1) })
          .eq('id', postId);
        
        fetchPosts();
      }
    } else {
      // 添加点赞
      const { error } = await supabase
        .from('tree_hole_likes')
        .insert({ post_id: postId, user_id: user.id });

      if (!error) {
        await supabase
          .from('tree_hole_posts')
          .update({ likes: posts.find(p => p.id === postId)!.likes + 1 })
          .eq('id', postId);
        
        fetchPosts();
      }
    }
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
                    variant={selectedMood === mood ? "default" : "secondary"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setSelectedMood(selectedMood === mood ? "" : mood)}
                  >
                    {mood}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={handlePost}
                disabled={!newPost.trim() || isLoading}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? "发布中..." : "发布"}
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
