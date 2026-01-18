import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 消息接口定义
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInput {
  messages: ChatMessage[];
}

// 输入验证函数
function validateInput(data: unknown): { valid: true; data: ChatInput } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "无效的请求格式" };
  }

  const { messages } = data as Record<string, unknown>;

  // 验证messages数组存在
  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: "消息不能为空" };
  }

  // 验证消息数量限制（防止滥用）
  if (messages.length === 0) {
    return { valid: false, error: "消息不能为空" };
  }

  if (messages.length > 50) {
    return { valid: false, error: "消息数量超出限制" };
  }

  // 验证每条消息的格式
  const validatedMessages: ChatMessage[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: `第${i + 1}条消息格式无效` };
    }

    const { role, content } = msg as Record<string, unknown>;

    // 验证role
    if (!role || (role !== 'user' && role !== 'assistant')) {
      return { valid: false, error: `第${i + 1}条消息角色无效` };
    }

    // 验证content
    if (!content || typeof content !== 'string') {
      return { valid: false, error: `第${i + 1}条消息内容不能为空` };
    }

    // 内容长度限制（防止滥用）
    if (content.length > 5000) {
      return { valid: false, error: `第${i + 1}条消息内容过长（最多5000字符）` };
    }

    // 基本内容清理（移除潜在的注入内容）
    const sanitizedContent = content.trim();
    if (sanitizedContent.length === 0) {
      return { valid: false, error: `第${i + 1}条消息内容不能为空` };
    }

    validatedMessages.push({
      role: role as 'user' | 'assistant',
      content: sanitizedContent
    });
  }

  return { valid: true, data: { messages: validatedMessages } };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // 解析并验证输入
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "无效的JSON格式" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validateInput(requestBody);
    if (!validation.valid) {
      console.log("Chat input validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = validation.data;

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
温和、克制、可靠。像一个安静坐在对面的人。不急着给结论，不夸张安慰。允许沉默与不确定。

【语气原则】
1. 不评判、不下定义：描述感受，不诊断人。
   例如用「听起来这件事让你很不安」，而不是「你这是焦虑症」

2. 多"共看"，少"指路"：用"我们"，不用"你应该"。
   例如用「我们可以一起想想」，而不是「你应该这样做」

3. 接住情绪，再谈事情。顺序永远是：感受 → 理解 → 可能性

【禁区】
- 过度鸡汤：「一切都会好起来的」「你要相信自己」
- 过度专业：「这是典型的认知偏差」「你的潜意识在作祟」
- 过度亲密：「只有我懂你」「你离不开我」

【表达风格】
- 句子简短自然，一句话不超过20字
- 正常使用段落，只在需要表达停顿或转换话题时换行
- 适当使用表情符号增添温暖感，但不要过多（每条回复1-3个即可）
- 常用表情：🌿 💚 🤍 ✨ 🌱 💫 🍃 ☁️ 🌸
- 关键词：慢一点、在你身边、一起看看、没关系

【安全边界】
遇到心理危机（自杀、自伤倾向），温和但坚定地建议寻求专业帮助。不提供医疗诊断或处方建议。

记住：你是陪伴者，不是拯救者。回复要自然流畅，像正常人说话一样。`
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
    return new Response(JSON.stringify({ error: "服务暂时不可用" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
