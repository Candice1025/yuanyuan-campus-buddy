import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 腾讯云短信签名
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "无效的手机号码" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 初始化 Supabase 客户端（使用 service role 绕过 RLS）
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 生成 6 位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 存储验证码到数据库
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后过期
    const { error: dbError } = await supabase
      .from("verification_codes")
      .insert({
        phone,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "验证码存储失败" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 腾讯云短信配置
    const secretId = Deno.env.get("TENCENT_SECRET_ID")!;
    const secretKey = Deno.env.get("TENCENT_SECRET_KEY")!;
    const sdkAppId = Deno.env.get("TENCENT_SMS_SDK_APP_ID")!;
    const signName = Deno.env.get("TENCENT_SMS_SIGN_NAME")!;
    const templateId = Deno.env.get("TENCENT_SMS_TEMPLATE_ID")!;

    // 构建请求参数
    const endpoint = "sms.tencentcloudapi.com";
    const service = "sms";
    const version = "2021-01-11";
    const action = "SendSms";
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().split("T")[0];

    const payload = JSON.stringify({
      PhoneNumberSet: [`+86${phone}`],
      SmsSdkAppId: sdkAppId,
      SignName: signName,
      TemplateId: templateId,
      TemplateParamSet: [code, "5"], // 验证码和有效期（分钟）
    });

    // 计算签名
    const hashedRequestPayload = await sha256(payload);
    const canonicalRequest = `POST\n/\n\ncontent-type:application/json\nhost:${endpoint}\n\ncontent-type;host\n${hashedRequestPayload}`;
    const hashedCanonicalRequest = await sha256(canonicalRequest);
    const credentialScope = `${date}/${service}/tc3_request`;
    const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;
    
    const secretDate = await hmacSha256(`TC3${secretKey}`, date);
    const secretService = await hmacSha256(secretDate, service);
    const secretSigning = await hmacSha256(secretService, "tc3_request");
    const signature = await hmacSha256(secretSigning, stringToSign);

    const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=content-type;host, Signature=${signature}`;

    // 发送短信
    const response = await fetch(`https://${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Host": endpoint,
        "X-TC-Action": action,
        "X-TC-Version": version,
        "X-TC-Timestamp": timestamp.toString(),
        "X-TC-Region": "ap-guangzhou",
        "Authorization": authorization,
      },
      body: payload,
    });

    const result = await response.json();

    if (result.Response?.Error) {
      console.error("Tencent SMS error:", result.Response.Error);
      return new Response(
        JSON.stringify({ error: "短信发送失败：" + result.Response.Error.Message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("SMS sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, message: "验证码已发送" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-sms error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "未知错误" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
