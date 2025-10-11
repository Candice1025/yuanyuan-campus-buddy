import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { items } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // 构建分析提示词
    const itemsList = items.map((item: any) => 
      `${item.category}类：${item.name}(${item.emoji})`
    ).join("、");

    const prompt = `你是一位温柔、富有共情力的心理咨询师，擅长通过沙盘游戏解读内心世界。

用户在心灵沙盘中选择并摆放了以下物件：
${itemsList}

请根据这些物件的象征意义和组合，生成一份温柔、诗意的心理解读报告。要求：

1. **内心情绪分析**（150字左右）
   - 分析这些物件反映的情绪状态（平静、焦虑、渴望、压抑等）
   - 用温柔的语气描述，不要说教

2. **人际关系倾向**（100字左右）
   - 从物件的类型和组合看出的人际模式（依赖、疏离、信任、控制等）

3. **潜在心理需求**（100字左右）
   - 这些物件背后隐藏的心理需求（安全感、表达欲、掌控感、自我接纳等）

4. **心灵寄语**（一句话）
   - 给出一句温暖、治愈的话语，像朋友般的鼓励

**语气风格要求：**
- 温柔、诗意、带一点神秘心理学感
- 禁止出现医学诊断、心理病名
- 只使用象征性解读
- 多用"你可能"、"似乎"、"也许"等柔和表达
- 用"🌿"、"🌊"、"🔮"、"💡"等emoji美化排版

**示例格式：**

🌿 **内心情绪**
[情绪分析内容]

🌊 **人际关系**
[人际分析内容]

🔮 **潜在需求**
[需求分析内容]

💡 **心灵寄语**
"[一句温暖的话]"

---
沙盘中的世界，往往映照着你心底的风景。感谢你和自己对话。`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI服务暂时不可用");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "解读生成失败，请重试";

    return new Response(
      JSON.stringify({ analysis }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("sandtray-analysis error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "未知错误" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
