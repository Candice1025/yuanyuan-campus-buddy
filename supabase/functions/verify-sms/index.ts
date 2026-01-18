import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 输入验证Schema
interface VerifySmsInput {
  phone: string;
  code: string;
}

function validateInput(data: unknown): { valid: true; data: VerifySmsInput } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "无效的请求格式" };
  }

  const { phone, code } = data as Record<string, unknown>;

  // 验证手机号
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: "手机号不能为空" };
  }

  // 手机号格式验证（中国大陆11位手机号）
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone.trim())) {
    return { valid: false, error: "无效的手机号码格式" };
  }

  // 验证码验证
  if (!code || typeof code !== 'string') {
    return { valid: false, error: "验证码不能为空" };
  }

  // 验证码格式（6位数字）
  const codeRegex = /^\d{6}$/;
  if (!codeRegex.test(code.trim())) {
    return { valid: false, error: "验证码格式无效，应为6位数字" };
  }

  return { 
    valid: true, 
    data: { 
      phone: phone.trim(), 
      code: code.trim() 
    } 
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
      console.log("Input validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { phone, code } = validation.data;

    // 初始化 Supabase 客户端（使用 service role 绕过 RLS）
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 查询验证码
    const { data: codes, error: queryError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (queryError) {
      console.error("Query error:", queryError);
      return new Response(
        JSON.stringify({ error: "验证失败" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!codes || codes.length === 0) {
      return new Response(
        JSON.stringify({ error: "验证码错误或已过期" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 标记验证码为已使用
    const { error: updateError } = await supabase
      .from("verification_codes")
      .update({ used: true })
      .eq("id", codes[0].id);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    // 检查用户是否存在
    const email = `${phone}@phone.local`; // 使用手机号生成唯一邮箱
    const { data: existingUser, error: getUserError } = await supabase.auth.admin.listUsers();

    if (getUserError) {
      console.error("Get user error:", getUserError);
    }

    const userExists = existingUser?.users.some(u => u.email === email);

    if (!userExists) {
      // 创建新用户（手机号注册）
      const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        phone,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { phone },
      });

      if (signUpError) {
        console.error("Sign up error:", signUpError);
        return new Response(
          JSON.stringify({ error: "用户创建失败" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("New user created");
    }

    // 生成访问令牌
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === email);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "用户不存在" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 使用 Supabase Admin API 生成会话
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
    });

    if (sessionError || !sessionData) {
      console.error("Session generation error:", sessionError);
      return new Response(
        JSON.stringify({ error: "登录失败" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user,
        session: sessionData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("verify-sms error:", error);
    return new Response(
      JSON.stringify({ error: "服务暂时不可用" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
