import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 物件接口定义
interface SandtrayItem {
  name: string;
  category: string;
  emoji: string;
}

interface SandtrayInput {
  items: SandtrayItem[];
}

// 输入验证函数
function validateInput(data: unknown): { valid: true; data: SandtrayInput } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "无效的请求格式" };
  }

  const { items } = data as Record<string, unknown>;

  // 验证items数组存在
  if (!items || !Array.isArray(items)) {
    return { valid: false, error: "物件列表不能为空" };
  }

  // 验证物件数量限制
  if (items.length === 0) {
    return { valid: false, error: "请至少选择一个物件" };
  }

  if (items.length > 50) {
    return { valid: false, error: "物件数量超出限制（最多50个）" };
  }

  // 验证每个物件的格式
  const validatedItems: SandtrayItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    if (!item || typeof item !== 'object') {
      return { valid: false, error: `第${i + 1}个物件格式无效` };
    }

    const { name, category, emoji } = item as Record<string, unknown>;

    // 验证name
    if (!name || typeof name !== 'string') {
      return { valid: false, error: `第${i + 1}个物件名称无效` };
    }
    if (name.length > 100) {
      return { valid: false, error: `第${i + 1}个物件名称过长` };
    }

    // 验证category
    if (!category || typeof category !== 'string') {
      return { valid: false, error: `第${i + 1}个物件分类无效` };
    }
    if (category.length > 50) {
      return { valid: false, error: `第${i + 1}个物件分类名过长` };
    }

    // 验证emoji
    if (!emoji || typeof emoji !== 'string') {
      return { valid: false, error: `第${i + 1}个物件图标无效` };
    }
    if (emoji.length > 10) {
      return { valid: false, error: `第${i + 1}个物件图标过长` };
    }

    validatedItems.push({
      name: name.trim().slice(0, 100),
      category: category.trim().slice(0, 50),
      emoji: emoji.trim().slice(0, 10)
    });
  }

  return { valid: true, data: { items: validatedItems } };
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
      console.log("Sandtray input validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { items } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // 构建分析提示词
    const itemsList = items.map((item) => 
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
      JSON.stringify({ error: "服务暂时不可用" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
