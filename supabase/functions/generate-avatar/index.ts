import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 接口定义
interface SandtrayItem {
  name: string;
  category?: string;
  emoji?: string;
}

interface AvatarConfig {
  skin_tone?: string;
  face_type?: string;
  hairstyle?: string;
  eyebrows?: string;
  eyes?: string;
  nose?: string;
  mouth?: string;
  outfit?: string;
  accessories?: string;
}

interface GenerateAvatarInput {
  items?: SandtrayItem[];
  config?: AvatarConfig;
}

// 允许的配置值
const ALLOWED_VALUES = {
  skin_tone: ['porcelain', 'fair', 'light', 'light-medium', 'medium', 'medium-tan', 'tan', 'olive', 'brown', 'deep-brown', 'dark'],
  face_type: ['oval', 'round', 'square', 'heart', 'diamond', 'oblong', 'triangle'],
  hairstyle: ['short', 'medium', 'long', 'ponytail', 'bun', 'bob', 'pixie', 'wavy', 'straight', 'curly', 'braids', 'mohawk', 'afro'],
  eyebrows: ['natural', 'thick', 'thin', 'arched', 'straight', 'angled', 'rounded', 'soft', 's-shaped', 'high-arch'],
  eyes: ['normal', 'big', 'small', 'almond', 'round', 'upturned', 'downturned', 'hooded', 'monolid', 'deep-set', 'close-set', 'wide-set', 'sparkle'],
  nose: ['normal', 'small', 'button', 'straight', 'upturned', 'roman', 'hawk', 'snub', 'wide', 'narrow'],
  mouth: ['smile', 'grin', 'neutral', 'happy', 'slight-smile', 'full-smile', 'closed', 'open', 'smirk', 'pursed', 'wide', 'small'],
  outfit: ['casual', 'formal', 'sporty', 'cute', 'school', 'party', 'hoodie', 'tshirt', 'sweater', 'jacket', 'dress', 'suit', 'uniform'],
  accessories: ['none', 'glasses', 'sunglasses', 'hat', 'cap', 'beanie', 'headband', 'bow', 'earrings', 'necklace', 'scarf', 'bandana', 'hairclip']
};

// 输入验证函数
function validateInput(data: unknown): { valid: true; data: GenerateAvatarInput } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "无效的请求格式" };
  }

  const { items, config } = data as Record<string, unknown>;

  // 必须提供items或config
  if (!items && !config) {
    return { valid: false, error: "请提供头像配置或沙盘物件" };
  }

  const result: GenerateAvatarInput = {};

  // 验证config
  if (config) {
    if (typeof config !== 'object') {
      return { valid: false, error: "头像配置格式无效" };
    }

    const configObj = config as Record<string, unknown>;
    const validatedConfig: AvatarConfig = {};

    for (const [key, allowedValues] of Object.entries(ALLOWED_VALUES)) {
      const value = configObj[key];
      if (value !== undefined) {
        if (typeof value !== 'string') {
          return { valid: false, error: `配置项 ${key} 值无效` };
        }
        if (!allowedValues.includes(value)) {
          return { valid: false, error: `配置项 ${key} 值不在允许范围内` };
        }
        (validatedConfig as Record<string, string>)[key] = value;
      }
    }

    result.config = validatedConfig;
  }

  // 验证items
  if (items) {
    if (!Array.isArray(items)) {
      return { valid: false, error: "物件列表格式无效" };
    }

    if (items.length === 0) {
      return { valid: false, error: "物件列表不能为空" };
    }

    if (items.length > 50) {
      return { valid: false, error: "物件数量超出限制（最多50个）" };
    }

    const validatedItems: SandtrayItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!item || typeof item !== 'object') {
        return { valid: false, error: `第${i + 1}个物件格式无效` };
      }

      const { name, category, emoji } = item as Record<string, unknown>;

      if (!name || typeof name !== 'string') {
        return { valid: false, error: `第${i + 1}个物件名称无效` };
      }

      if (name.length > 100) {
        return { valid: false, error: `第${i + 1}个物件名称过长` };
      }

      validatedItems.push({
        name: name.trim().slice(0, 100),
        category: typeof category === 'string' ? category.trim().slice(0, 50) : undefined,
        emoji: typeof emoji === 'string' ? emoji.trim().slice(0, 10) : undefined
      });
    }

    result.items = validatedItems;
  }

  return { valid: true, data: result };
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
      console.log("Avatar input validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { items, config } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let prompt = "";

    // 检查是avatar定制还是沙盘分析
    if (config) {
      // Avatar定制模式
      const skinToneMap: Record<string, string> = {
        'porcelain': 'porcelain white skin',
        'fair': 'fair skin',
        'light': 'light skin',
        'light-medium': 'light to medium skin',
        'medium': 'medium skin tone',
        'medium-tan': 'medium tan skin',
        'tan': 'tan skin',
        'olive': 'olive skin',
        'brown': 'brown skin',
        'deep-brown': 'deep brown skin',
        'dark': 'dark skin'
      };

      const faceMap: Record<string, string> = {
        'oval': 'oval face shape',
        'round': 'round face',
        'square': 'square face',
        'heart': 'heart-shaped face',
        'diamond': 'diamond face shape',
        'oblong': 'oblong face',
        'triangle': 'triangle face shape'
      };

      const hairMap: Record<string, string> = {
        'short': 'short hair',
        'medium': 'medium length hair',
        'long': 'long hair',
        'ponytail': 'ponytail hairstyle',
        'bun': 'hair bun',
        'bob': 'bob haircut',
        'pixie': 'pixie cut',
        'wavy': 'wavy hair',
        'straight': 'straight hair',
        'curly': 'curly hair',
        'braids': 'braided hair',
        'mohawk': 'mohawk hairstyle',
        'afro': 'afro hairstyle'
      };

      const eyebrowMap: Record<string, string> = {
        'natural': 'natural eyebrows',
        'thick': 'thick eyebrows',
        'thin': 'thin eyebrows',
        'arched': 'arched eyebrows',
        'straight': 'straight eyebrows',
        'angled': 'angled eyebrows',
        'rounded': 'rounded eyebrows',
        'soft': 'soft eyebrows',
        's-shaped': 'S-shaped eyebrows',
        'high-arch': 'high-arched eyebrows'
      };

      const eyeMap: Record<string, string> = {
        'normal': 'normal eyes',
        'big': 'big eyes',
        'small': 'small eyes',
        'almond': 'almond-shaped eyes',
        'round': 'round eyes',
        'upturned': 'upturned eyes',
        'downturned': 'downturned eyes',
        'hooded': 'hooded eyes',
        'monolid': 'monolid eyes',
        'deep-set': 'deep-set eyes',
        'close-set': 'close-set eyes',
        'wide-set': 'wide-set eyes',
        'sparkle': 'sparkling eyes'
      };

      const noseMap: Record<string, string> = {
        'normal': 'normal nose',
        'small': 'small nose',
        'button': 'button nose',
        'straight': 'straight nose',
        'upturned': 'upturned nose',
        'roman': 'roman nose',
        'hawk': 'hawk nose',
        'snub': 'snub nose',
        'wide': 'wide nose',
        'narrow': 'narrow nose'
      };

      const mouthMap: Record<string, string> = {
        'smile': 'gentle smile',
        'grin': 'big grin',
        'neutral': 'neutral expression',
        'happy': 'happy expression',
        'slight-smile': 'slight smile',
        'full-smile': 'full smile',
        'closed': 'closed mouth',
        'open': 'open mouth smile',
        'smirk': 'smirk',
        'pursed': 'pursed lips',
        'wide': 'wide mouth',
        'small': 'small mouth'
      };

      const outfitMap: Record<string, string> = {
        'casual': 'casual clothing',
        'formal': 'formal attire',
        'sporty': 'sporty outfit',
        'cute': 'cute outfit',
        'school': 'school uniform',
        'party': 'party outfit',
        'hoodie': 'hoodie',
        'tshirt': 't-shirt',
        'sweater': 'sweater',
        'jacket': 'jacket',
        'dress': 'dress',
        'suit': 'suit',
        'uniform': 'uniform'
      };

      const accessoryMap: Record<string, string> = {
        'none': 'no accessories',
        'glasses': 'glasses',
        'sunglasses': 'sunglasses',
        'hat': 'hat',
        'cap': 'baseball cap',
        'beanie': 'beanie hat',
        'headband': 'headband',
        'bow': 'bow',
        'earrings': 'earrings',
        'necklace': 'necklace',
        'scarf': 'scarf',
        'bandana': 'bandana',
        'hairclip': 'hair clip'
      };

      prompt = `Create a cute illustration-style character portrait with the following features:
- ${skinToneMap[config.skin_tone || 'light'] || 'light skin'}
- ${faceMap[config.face_type || 'oval'] || 'oval face shape'}
- ${hairMap[config.hairstyle || 'short'] || 'short hair'}
- ${eyebrowMap[config.eyebrows || 'natural'] || 'natural eyebrows'}
- ${eyeMap[config.eyes || 'normal'] || 'normal eyes'}
- ${noseMap[config.nose || 'normal'] || 'normal nose'}
- ${mouthMap[config.mouth || 'smile'] || 'gentle smile'}
- ${outfitMap[config.outfit || 'casual'] || 'casual clothing'}
${config.accessories && config.accessories !== 'none' ? `- ${accessoryMap[config.accessories] || config.accessories}` : ''}

Style: Modern illustration art, cute and friendly, clean lines, soft pastel colors, suitable for children and teenagers. The character should be facing forward in portrait view, with a warm and welcoming expression. High quality digital illustration with professional finish, white or light background. Full color, detailed but simple, kawaii-inspired aesthetic.`;

    } else if (items) {
      // 沙盘分析模式
      const itemsList = items.map((item) => item.name).join("、");
      prompt = `Create a mystical 3D character avatar that represents a person's inner world. 
Based on their sand tray therapy selection: ${itemsList}.
The avatar should be ethereal, dream-like, and symbolic, incorporating elements from nature, fantasy, and emotion.
Style: 3D rendered, soft lighting, magical realism, detailed textures.
The character should feel peaceful, introspective, and emotionally expressive.
Ultra high resolution, cinematic quality.`;
    } else {
      throw new Error("Invalid request: missing config or items");
    }

    console.log("Generating avatar");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "请求过于频繁，请稍后再试" }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "生成额度不足，请联系管理员" }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("Avatar generation error:", e);
    return new Response(
      JSON.stringify({ error: "服务暂时不可用" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
