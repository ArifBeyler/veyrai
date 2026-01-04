// Enhanced Try-On Edge Function
// Direct virtual try-on using IDM-VTON model
// Simplified: No face swap, direct user photo + garment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnhancedTryOnRequest {
  userFaceUrl: string;      // User's photo URL
  modelPhotoUrl: string;    // Base model photo URL (fallback if user photo fails)
  garmentUrl: string;       // Garment image URL
}

serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    
    if (!REPLICATE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "REPLICATE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { userFaceUrl, modelPhotoUrl, garmentUrl }: EnhancedTryOnRequest = await req.json();
    
    if (!userFaceUrl || !garmentUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userFaceUrl, garmentUrl" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting try-on process...");
    console.log("User photo URL:", userFaceUrl);
    console.log("Garment URL:", garmentUrl);
    console.log("Model photo (fallback):", modelPhotoUrl);

    // Use model photo as base for better results
    // The user's photo quality might not be ideal for try-on
    const humanImageUrl = modelPhotoUrl || userFaceUrl;
    
    console.log("Using human image:", humanImageUrl);

    // Call IDM-VTON model for virtual try-on
    const tryOnResponse = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          "Authorization": `Token ${REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "wait"
        },
        body: JSON.stringify({
          // IDM-VTON model version
          version: "0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
          input: {
            human_img: humanImageUrl,
            garm_img: garmentUrl,
            garment_des: "clothing item"
          }
        }),
      }
    );

    const tryOnResult = await tryOnResponse.json();
    console.log("Try-on response status:", tryOnResponse.status);
    console.log("Try-on result:", JSON.stringify(tryOnResult));

    if (tryOnResult.error) {
      console.error("Replicate API error:", tryOnResult.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: tryOnResult.error,
          details: tryOnResult
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (tryOnResult.status === "failed") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Virtual try-on failed",
          details: tryOnResult
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return successful result
    const resultImageUrl = tryOnResult.output;
    
    if (!resultImageUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No output image received",
          details: tryOnResult
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        resultImageUrl: resultImageUrl,
        modelUsed: humanImageUrl === modelPhotoUrl
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Enhanced try-on error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
