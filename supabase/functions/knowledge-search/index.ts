import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use Lovable AI to search and rank knowledge
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
            content: `You are a knowledge search assistant. When given a query, provide 5-8 relevant knowledge points from authoritative sources (like Wikipedia, educational institutions, scientific publications). 
            
            For each result, provide:
            1. title: A clear, concise title
            2. description: A 2-3 sentence explanation of the knowledge point
            3. url: A real, authoritative URL where users can learn more
            4. relevanceScore: A score between 0-1 indicating how relevant this is to the query
            5. source: The name of the authoritative source (e.g., "Wikipedia", "MIT OpenCourseWare", etc.)
            
            Return ONLY a valid JSON array with no markdown formatting, like this:
            [{"title":"...","description":"...","url":"...","relevanceScore":0.95,"source":"..."}]
            
            Ensure all URLs are real and accessible. Prioritize Chinese educational resources when available.`
          },
          {
            role: "user",
            content: `搜索关于以下主题的知识点: ${query}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "搜索次数过多，请稍后再试" }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "服务配额不足，请联系管理员" }),
          { 
            status: 402, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse the JSON response
    let results;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      results = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid response format from AI");
    }

    // Sort by relevance score
    results.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Knowledge search error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        results: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
