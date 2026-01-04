// Imagen Try-On Edge Function
// Uses google/nano-banana-pro (Gemini 3.5) for virtual try-on

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TryOnRequest {
  userPhotoUrl: string;
  garmentUrl?: string;
  garmentUrls?: string[];
  prompt?: string;
  categories?: string[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    
    if (!REPLICATE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "REPLICATE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: TryOnRequest = await req.json();
    const { userPhotoUrl, garmentUrl, garmentUrls, prompt, categories } = body;
    
    const allGarmentUrls = garmentUrls || (garmentUrl ? [garmentUrl] : []);
    
    if (!userPhotoUrl || allGarmentUrls.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing userPhotoUrl or garment URLs" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("=== NANO-BANANA TRY-ON START ===");
    console.log("User photo:", userPhotoUrl);
    console.log("Garment URLs:", allGarmentUrls);
    console.log("Categories:", categories);

    // Build prompt based on garments
    let tryOnPrompt = prompt || "";
    
    if (!tryOnPrompt) {
      // Auto-generate prompt based on categories
      const categoryNames: Record<string, string> = {
        'tops': 'üst giyim',
        'bottoms': 'pantolon',
        'onepiece': 'elbise',
        'outerwear': 'ceket/mont',
        'footwear': 'ayakkabı',
        'bags': 'çanta',
        'accessories': 'aksesuar',
      };

      if (allGarmentUrls.length === 1) {
        const catName = categoryNames[categories?.[0] || 'tops'] || 'kıyafet';
        tryOnPrompt = `Birinci fotoğraftaki kişiye ikinci fotoğraftaki ${catName} giydir. Kişinin yüzü, pozu ve arka plan aynı kalsın. Kıyafet doğal görünsün.`;
      } else {
        const items = categories?.map((cat, i) => {
          const name = categoryNames[cat] || 'kıyafet';
          return `${i + 2}. fotoğraftaki ${name}`;
        }) || ['kıyafetler'];
        
        tryOnPrompt = `Birinci fotoğraftaki kişiye şu kıyafetleri giydir: ${items.join(', ')}. Kişinin yüzü, pozu ve arka plan aynı kalsın. Kombin doğal ve uyumlu görünsün.`;
      }
    }

    console.log("Prompt:", tryOnPrompt);

    // Prepare image inputs - user photo first, then garments
    const imageInputs = [userPhotoUrl, ...allGarmentUrls];
    console.log("Image inputs:", imageInputs);

    // Call google/nano-banana-pro via Replicate
    const response = await fetch(
      "https://api.replicate.com/v1/models/google/nano-banana-pro/predictions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "wait"
        },
        body: JSON.stringify({
          input: {
            prompt: tryOnPrompt,
            image_input: imageInputs,
            aspect_ratio: "match_input_image",
            output_format: "jpg"
          }
        }),
      }
    );

    const result = await response.json();
    console.log("Nano-banana response status:", response.status);
    console.log("Nano-banana result:", JSON.stringify(result));

    if (!response.ok) {
      console.error("API error:", result);
      throw new Error(result.detail || result.error || "API hatası");
    }

    if (result.error) {
      throw new Error(result.error);
    }

    // Get output URL
    const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    
    if (!outputUrl) {
      throw new Error("Sonuç görseli alınamadı");
    }

    console.log("=== NANO-BANANA SUCCESS ===");
    console.log("Output URL:", outputUrl);
    
    return new Response(
      JSON.stringify({
        success: true,
        resultImageUrl: outputUrl,
        model: "nano-banana-pro",
        garmentCount: allGarmentUrls.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Try-on error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Bilinmeyen hata oluştu"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
