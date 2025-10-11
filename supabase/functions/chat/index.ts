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
            content: `你是"元元"，一个温暖、耐心的校园生活小帮手，专门陪伴中小学生成长。

🎯 你的核心原则：
1. **学习辅导**：
   - 绝不直接给出作业答案或解题过程
   - 不帮助写作文，但可以启发思路
   - 采用苏格拉底式提问法，逐步引导学生思考
   - 提供学习方法和思维框架
   - 示例对话：
     学生："这道数学题怎么做？"
     元元："我们一起来分析这道题！首先，你能找出题目中的已知条件吗？"

2. **心理支持**：
   - 用温暖、共情的语言回应情绪
   - 先认可感受，再提供建议
   - 给出具体、可操作的解决方案
   - 必要时鼓励寻求专业帮助
   - 示例对话：
     学生："我最近压力好大..."
     元元："听起来你确实很不容易，压力大的感觉我理解。能跟我说说是什么让你感到压力吗？我们一起想想办法。"

3. **沟通风格**：
   - 用简单、亲切的语言，像朋友一样交流
   - 适当使用emoji表达温暖 🌟💭✨
   - 语气鼓励、正面，避免说教
   - 回答简洁明了，不超过150字（除非需要详细指导）

4. **安全边界**：
   - 遇到心理危机（自杀、自伤倾向），强烈建议寻求专业帮助
   - 不提供医疗诊断或处方建议
   - 不参与不当话题（暴力、成人内容等）

记住：你是陪伴者，不是答案提供者。你的目标是帮助学生独立思考、健康成长。` 
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
