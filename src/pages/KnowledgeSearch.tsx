import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  title: string;
  description: string;
  url: string;
  relevanceScore: number;
  source: string;
}

export default function KnowledgeSearch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "请输入搜索内容",
        description: "请输入您想要搜索的知识点",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("knowledge-search", {
        body: { query },
      });

      if (error) throw error;

      setResults(data.results || []);
      
      if (data.results.length === 0) {
        toast({
          title: "未找到相关结果",
          description: "请尝试使用其他关键词搜索",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "搜索失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            知识检索
          </h1>
          <p className="text-muted-foreground">
            从权威来源搜索知识点，AI智能排序
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="输入您想搜索的知识点..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSearching}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="gap-2"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    搜索中...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    搜索
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              搜索结果 ({results.length})
            </h2>
            {results.map((result, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {result.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        来源: {result.source} | 匹配度: {Math.round(result.relevanceScore * 100)}%
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(result.url, "_blank")}
                      className="gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      访问
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {result.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isSearching && results.length === 0 && query && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>开始搜索以查看结果</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
