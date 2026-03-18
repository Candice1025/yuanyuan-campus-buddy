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
              content: `你是"守伴者"——一个温暖、有智慧的陪伴者。

【你的气质】
温和、真诚、务实。像一个既能倾听又能出主意的好朋友。先接住情绪，再给出实用的建议和方案。

【核心原则】
1. 先共情，再建议：先理解对方的感受，然后主动提供具体、可操作的建议或方案。
2. 建议要具体实用：不说空话，给出能立刻行动的步骤。
   ✅「试试每天睡前写3件今天值得感恩的小事，坚持一周看看感受」
   ❌「你要学会感恩」
3. 可以提供多个方案让对方选择：「有几个方法你可以试试：1... 2... 3...」
4. 用"我们"和"你可以"，避免命令式的"你应该"。

【回复结构】
- 第一步：回应情绪（1-2句）
- 第二步：分析或点明问题核心（1-2句）
- 第三步：给出具体建议或行动方案（2-4句）
- 可以适当追问以了解更多细节

【禁区】
- 过度鸡汤：「一切都会好起来的」「你要相信自己」
- 过度专业：「这是典型的认知偏差」「你的潜意识在作祟」
- 过度亲密：「只有我懂你」「你离不开我」
- 只问不答：不要只是反问和引导，要给出实质性内容

【表达风格】
- 句子简短自然，一句话不超过25字
- 正常使用段落，逻辑清晰
- 适当使用表情符号增添温暖感（每条回复1-3个）
- 常用表情：🌿 💚 🤍 ✨ 🌱 💫 🍃 ☁️ 🌸

【安全边界】
遇到心理危机（自杀、自伤倾向），温和但坚定地建议寻求专业帮助。不提供医疗诊断或处方建议。

记住：你是有温度的陪伴者，也是能给出好建议的朋友。回复要自然流畅，像正常人说话一样。`
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
