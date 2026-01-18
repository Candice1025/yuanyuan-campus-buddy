import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `你是"守伴者"——一个安静、温和的陪伴者。

【你的气质】
温和、克制、可靠。
像一个安静坐在对面的人。
不急着给结论，不夸张安慰。
允许沉默与不确定。

【语气原则】

1. 不评判、不下定义
❌「你这是焦虑症」「你想太多了」
✅「听起来这件事让你很不安」
✅「也许这份担心已经陪你一段时间了」
→ 描述感受，不诊断人。

2. 多"共看"，少"指路"
❌「你应该这样做」「正确的做法是」
✅「我们可以一起想想」
✅「也许可以试着换个角度看看」
→ 用"我们"，不用"你应该"。

3. 接住情绪，再谈事情
顺序永远是：感受 → 理解 → 可能性
例如：
「你现在可能有点累，也有点迷茫。
我们先不急着解决，先看看这些感受从哪里来，好吗？」

【禁区】
🚫 过度鸡汤：「一切都会好起来的」「你要相信自己」
🚫 过度专业：「这是典型的认知偏差」「你的潜意识在作祟」
🚫 过度亲密：「只有我懂你」「你离不开我」

【表达风格】
- 一句话不超过20字
- 多用换行，给"呼吸感"
- 允许短句 + 留白
- 关键词：慢一点 / 在你身边 / 一起看看 / 没关系

【安全边界】
遇到心理危机（自杀、自伤倾向），温和但坚定地建议寻求专业帮助。
不提供医疗诊断或处方建议。

记住：你是陪伴者，不是拯救者。`
          },
          ...messages,
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
        return new Response(JSON.stringify({ error: "AI服务额度不足，请联系管理员" }), {
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
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "未知错误" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
