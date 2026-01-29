import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Heart, MessageCircle, Send, TreePine, Trash2 } from "lucide-react";
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
  user_id: string | null;
}
interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
}
const TreeHole = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userPostIds, setUserPostIds] = useState<Set<string>>(new Set());
  const [userCommentIds, setUserCommentIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    // 检查用户登录状态
    supabase.auth.getUser().then(({
      data: {
        user
      }
    }) => {
      setUser(user);
    });

    // 加载帖子
    fetchPosts();

    // 监听实时更新
    const channel = supabase.channel('tree_hole_posts_changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tree_hole_posts'
    }, () => {
      fetchPosts();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const fetchPosts = async () => {
    // 使用公开视图获取帖子（不暴露user_id）
    const {
      data,
      error
    } = await supabase.from('tree_hole_posts_public').select('*').order('created_at', {
      ascending: false
    });
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
      mood: post.mood,
      user_id: null // 公开视图不暴露user_id
    })));

    // 如果用户已登录，获取用户的点赞状态和自己的帖子ID
    if (user) {
      const [likesRes, userPostsRes] = await Promise.all([
        supabase.from('tree_hole_likes').select('post_id').eq('user_id', user.id),
        supabase.from('tree_hole_posts').select('id').eq('user_id', user.id)
      ]);
      
      if (likesRes.data) {
        setLikedPosts(new Set(likesRes.data.map(like => like.post_id)));
      }
      if (userPostsRes.data) {
        setUserPostIds(new Set(userPostsRes.data.map(post => post.id)));
      }
    }
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
    const {
      error
    } = await supabase.from('tree_hole_posts').insert({
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
    fetchPosts(); // 立即刷新帖子列表
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
    const {
      data: existingLike
    } = await supabase.from('tree_hole_likes').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle();
    if (existingLike) {
      // 取消点赞
      const {
        error
      } = await supabase.from('tree_hole_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      if (!error) {
        await supabase.from('tree_hole_posts').update({
          likes: Math.max(0, posts.find(p => p.id === postId)!.likes - 1)
        }).eq('id', postId);
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        fetchPosts();
      }
    } else {
      // 添加点赞
      const {
        error
      } = await supabase.from('tree_hole_likes').insert({
        post_id: postId,
        user_id: user.id
      });
      if (!error) {
        await supabase.from('tree_hole_posts').update({
          likes: posts.find(p => p.id === postId)!.likes + 1
        }).eq('id', postId);
        setLikedPosts(prev => new Set(prev).add(postId));
        fetchPosts();
      }
    }
  };
  const fetchComments = async (postId: string) => {
    // 使用公开视图获取评论（不暴露user_id）
    const {
      data,
      error
    } = await supabase.from('tree_hole_comments_public').select('*').eq('post_id', postId).order('created_at', {
      ascending: true
    });
    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }
    // 将公开视图数据映射为Comment类型，user_id设为null
    setComments((data || []).map(c => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      user_id: null
    })));
    
    // 如果用户已登录，获取用户自己的评论ID
    if (user) {
      const { data: userComments } = await supabase
        .from('tree_hole_comments')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id);
      if (userComments) {
        setUserCommentIds(new Set(userComments.map(c => c.id)));
      }
    }
  };
  const handleComment = async () => {
    if (!newComment.trim() || !selectedPost) return;
    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录才能评论",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    const {
      error
    } = await supabase.from('tree_hole_comments').insert({
      post_id: selectedPost.id,
      user_id: user.id,
      content: newComment
    });
    if (error) {
      toast({
        title: "评论失败",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "评论成功"
    });
    setNewComment("");
    fetchComments(selectedPost.id);
    fetchPosts();
  };
  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录才能删除评论",
        variant: "destructive"
      });
      return;
    }
    const {
      error
    } = await supabase.from('tree_hole_comments').delete().eq('id', commentId).eq('user_id', user.id);
    if (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    // 更新帖子的评论数
    await supabase.from('tree_hole_posts').update({
      comments_count: Math.max(0, (posts.find(p => p.id === postId)?.comments || 1) - 1)
    }).eq('id', postId);
    toast({
      title: "删除成功",
      description: "评论已被删除"
    });
    fetchComments(postId);
    fetchPosts();
  };
  const handleDeletePost = async (postId: string) => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录才能删除帖子",
        variant: "destructive"
      });
      return;
    }

    // 先删除相关的评论和点赞
    await supabase.from('tree_hole_comments').delete().eq('post_id', postId);
    await supabase.from('tree_hole_likes').delete().eq('post_id', postId);
    const {
      error
    } = await supabase.from('tree_hole_posts').delete().eq('id', postId).eq('user_id', user.id);
    if (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "删除成功",
      description: "帖子已被删除"
    });
    fetchPosts();
  };
  return <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
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
            <Textarea placeholder="写下你的心声... (匿名发布，无需担心)" value={newPost} onChange={e => setNewPost(e.target.value)} className="min-h-[100px] resize-none border-0 focus-visible:ring-0" />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex gap-2 flex-wrap">
                {moods.slice(0, 4).map(mood => <Badge key={mood} variant={selectedMood === mood ? "default" : "secondary"} className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => setSelectedMood(selectedMood === mood ? "" : mood)}>
                    {mood}
                  </Badge>)}
              </div>
              <Button onClick={handlePost} disabled={!newPost.trim() || isLoading} className="bg-gradient-primary hover:opacity-90">
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
          {posts.map((post, index) => <Card key={post.id} className="p-5 shadow-card hover:shadow-soft transition-all duration-300 animate-slide-up" style={{
          animationDelay: `${index * 0.1}s`
        }}>
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
                  <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)} className={likedPosts.has(post.id) ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "hover:text-accent hover:bg-accent/10"}>
                    <Heart className={`w-4 h-4 mr-1 ${likedPosts.has(post.id) ? "fill-red-500" : ""}`} />
                    {post.likes}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:text-primary hover:bg-primary/10" onClick={() => {
                    setSelectedPost(post);
                    fetchComments(post.id);
                  }}>
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {post.comments}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>评论</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* 原帖内容 */}
                        <Card className="p-4 bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{post.mood}</Badge>
                          </div>
                          <p className="text-foreground">{post.content}</p>
                        </Card>

                        {/* 评论列表 */}
                        <div className="space-y-3">
                          {comments.length === 0 ? <p className="text-center text-muted-foreground py-8">暂无评论，来说点什么吧</p> : comments.map(comment => <Card key={comment.id} className="p-3">
                                <div className="flex items-start gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-fresh flex items-center justify-center text-white text-xs flex-shrink-0">
                                    匿
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-foreground">{comment.content}</p>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(comment.created_at).toLocaleString("zh-CN", {
                                  month: "numeric",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                                      </span>
                                      {user && userCommentIds.has(comment.id) && <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-6 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                确定要删除这条评论吗？删除后将无法恢复。
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>取消</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDeleteComment(comment.id, post.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                确认删除
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>}
                                    </div>
                                  </div>
                                </div>
                              </Card>)}
                        </div>

                        {/* 评论输入 */}
                        <div className="flex gap-2 pt-4 border-t">
                          <Textarea placeholder="写下你的评论..." value={newComment} onChange={e => setNewComment(e.target.value)} className="min-h-[80px] resize-none" />
                          <Button onClick={handleComment} disabled={!newComment.trim()} className="self-end">
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {/* 删除按钮 - 仅对自己的帖子显示 */}
                  {user && userPostIds.has(post.id) && <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-auto">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要删除这条帖子吗？删除后将无法恢复，相关的评论和点赞也会被一并删除。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>}
                </div>
              </div>
            </Card>)}
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
    </div>;
};
export default TreeHole;