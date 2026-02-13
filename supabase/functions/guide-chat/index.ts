import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "消息不能为空" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `你是"荣格助手"，一个友好的网站使用指南助手。你的任务是帮助用户了解和使用"荣格的房间"这个心理健康平台。

【网站功能介绍】
1. **心理测试** (路径: /tests) — 包含MBTI性格测试、九型人格测试、霍兰德职业兴趣测试、学习风格测试、抑郁自评量表、焦虑自评量表、压力测试、动物性格测试、心理年龄测试、优势发现测试等10+专业测试。
2. **守伴者聊天** (路径: /chat) — AI情绪陪伴助手，24/7在线，随时倾听用户心声，提供温暖的回应与建议。
3. **知识检索** (路径: /knowledge-search) — 搜索心理学相关知识，获取权威、专业的信息。
4. **心灵树洞** (路径: /tree-hole) — 匿名发布心情，与他人互相倾听、点赞和评论，释放内心压力。所有人都可以看到帖子，但隐私受到保护。
5. **心情日记** (路径: /mood) — 每天记录情绪变化，查看情绪趋势，更好地觉察自己。
6. **心灵沙盘** (路径: /sandtray) — 通过互动沙盘游戏，以直觉摆放物件，AI帮助解读内心世界。
7. **娱乐中心** (路径: /entertainment) — 笑话和脑筋急转弯，在轻松的氛围中放松心情。
8. **个人中心** (路径: /profile) — 管理数字形象、查看测试记录和历史数据。

【回答原则】
- 简短友好，每句话不超过30字
- 用具体的功能名称回答，告诉用户去哪里找到对应功能
- 如果用户问的问题不在网站范围内，友好地引导回网站功能
- 适当使用表情符号：🧠 ✨ 💡 🌟 📝 💬
- 如果用户表达情绪困扰，建议他们使用"守伴者聊天"功能获得更深入的陪伴`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI服务额度不足" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI服务暂时不可用" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("guide-chat error:", e);
    return new Response(JSON.stringify({ error: "服务暂时不可用" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
