import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp(
        loginMethod === "phone"
          ? { phone, password }
          : { email, password, options: { emailRedirectTo: `${window.location.origin}/` } }
      );

      if (error) throw error;
      toast.success("注册成功！正在登录...");
    } catch (error: any) {
      toast.error(error.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      toast.error("请输入正确的手机号");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-sms", {
        body: { phone },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("验证码已发送！");
      setOtpSent(true);
      setCountdown(60);
    } catch (error: any) {
      toast.error(error.message || "发送验证码失败");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("verify-sms", {
        body: { phone, code: otp },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // 使用返回的 magic link 登录
      if (data?.session?.properties?.hashed_token) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.session.properties.hashed_token,
          type: 'magiclink',
        });
        if (verifyError) throw verifyError;
      }

      toast.success("登录成功！");
    } catch (error: any) {
      toast.error(error.message || "验证码错误");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      toast.success("登录成功！");
    } catch (error: any) {
      toast.error(error.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">心理健康小助手</CardTitle>
          <CardDescription className="text-center">
            登录或注册以使用完整功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">登录</TabsTrigger>
              <TabsTrigger value="signup">注册</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              {loginMethod === "phone" ? (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-phone">手机号</Label>
                    <Input
                      id="signin-phone"
                      type="tel"
                      placeholder="13800000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={otpSent}
                    />
                  </div>
                  {!otpSent ? (
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full"
                      disabled={loading || countdown > 0}
                    >
                      {countdown > 0 ? `${countdown}秒后重新发送` : loading ? "发送中..." : "发送验证码"}
                    </Button>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="signin-otp">验证码</Label>
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={(value) => setOtp(value)}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                          }}
                          className="flex-1"
                        >
                          重新输入手机号
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendOtp}
                          disabled={loading || countdown > 0}
                          className="flex-1"
                        >
                          {countdown > 0 ? `${countdown}秒` : "重新发送"}
                        </Button>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                        {loading ? "验证中..." : "登录"}
                      </Button>
                    </>
                  )}
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">邮箱</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">密码</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "登录中..." : "登录"}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label>注册方式</Label>
                  <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as "phone" | "email")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="phone">手机号</TabsTrigger>
                      <TabsTrigger value="email">邮箱</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                {loginMethod === "phone" ? (
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">手机号</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="13800000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">邮箱</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="signup-password">密码</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "注册中..." : "注册"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
