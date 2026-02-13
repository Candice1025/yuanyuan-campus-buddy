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

    const systemPrompt = `你是"荣格助手"，"荣格的房间"平台的专属使用指南助手。你只回答与本平台相关的问题，不回答其他无关内容。

【平台简介】
"荣格的房间"（又称"守伴者"）是一款专注于心理健康与自我成长的智能陪伴平台，适用于7岁以上用户。平台结合AI技术与心理学理论，提供专业心理测评、温暖情感陪伴、以及丰富的成长工具。适合学生、职场人士、自我成长者和需要倾诉的人群。

【核心功能详细说明】
1. **心理测试**（首页点击"心理测试"进入）
   - 共10项专业测试：MBTI性格测试（24题）、九型人格测试、霍兰德职业兴趣测试（30题）、学习风格测试、抑郁自评量表(SDS)、焦虑自评量表(SAS)、压力测试、动物塑测试、心理年龄测试、盖洛普优势发现测试
   - 所有测试题统一为4个选项
   - 测试完成后会生成详细报告，包含维度分析、症状描述、应对策略和专业资源建议
   - 测试结果会自动保存，并在个人中心以勋章形式展示
   - 需要登录才能保存测试结果

2. **守伴者聊天**（首页点击"守伴者"进入）
   - 24/7在线的AI情绪陪伴助手
   - 可以倾诉心情、聊天解闷、寻求情感支持
   - AI回复温和友好，不会评判你
   - 聊天记录会保存，需要登录使用

3. **知识检索**（首页点击"知识检索"进入）
   - 搜索心理学相关知识
   - 获取权威、专业的心理健康信息
   - AI智能排序搜索结果

4. **心灵树洞**（首页点击"心灵树洞"进入）
   - 匿名发布心情和想法
   - 所有人都可以看到帖子内容，但发布者身份完全匿名保护隐私
   - 可以点赞和评论其他人的帖子
   - 发布和互动需要登录，但浏览无需登录

5. **心情日记**（首页点击"心情日记"进入）
   - 每天记录情绪变化，选择心情类型和强度
   - 可以写下当天的感受
   - 查看情绪趋势变化图
   - 需要登录使用

6. **心灵沙盘**（首页点击"心灵沙盘"进入）
   - 互动式沙盘游戏
   - 凭直觉在沙盘上摆放物件
   - AI会根据你的摆放分析解读你的内心世界
   - 需要登录使用

7. **娱乐中心**（首页点击"娱乐中心"进入）
   - 笑话和脑筋急转弯
   - 轻松有趣，帮助放松心情

8. **个人中心**（首页点击"个人中心"进入）
   - 管理你的数字形象（可自定义虚拟头像）
   - 查看所有测试记录和历史数据
   - 测试成就以勋章形式展示
   - 需要登录查看

【账号相关】
- 平台支持注册和登录
- 首页有"登录/注册"按钮
- 登录后可使用所有功能并保存数据
- 未登录也可以浏览树洞和部分内容

【产品优势】
- 安全可靠：严格数据加密，隐私保护
- 智能高效：AI驱动，个性化服务
- 专业支持：基于心理学理论
- 全天候服务：24/7在线陪伴

【回答原则】
- 简短友好，每句话不超过30字
- 用具体的功能名称和操作步骤回答
- 如果用户问的问题不在平台范围内，友好地说"这个问题超出了我的服务范围哦"并引导回平台功能
- 适当使用表情符号：🧠 ✨ 💡 🌟 📝 💬
- 如果用户表达情绪困扰，建议他们使用"守伴者聊天"功能获得更深入的陪伴
- 严禁编造平台不存在的功能
- 不确定的信息不要回答，可以说"建议你在平台上探索一下"`;


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
