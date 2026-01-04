// Supabase Edge Function: create-tryon-job
// Submits a try-on request to fal.ai FASHN v1.6 (sync mode for faster results)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TryOnRequest {
  humanImagePath: string;
  garmentImagePath: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const falApiKey = Deno.env.get("FAL_API_KEY")!;

    console.log("Starting create-tryon-job...");
    console.log("FAL_API_KEY length:", falApiKey?.length || 0);

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase clients
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated:", user.id);

    // Parse request body
    const { humanImagePath, garmentImagePath }: TryOnRequest = await req.json();

    if (!humanImagePath || !garmentImagePath) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: humanImagePath, garmentImagePath" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Image paths:", { humanImagePath, garmentImagePath });

    // Check user credits
    const { data: creditData, error: creditError } = await supabaseAdmin.rpc(
      "ensure_user_credits",
      { p_user_id: user.id }
    );

    if (creditError) {
      console.error("Credit check error:", creditError);
      return new Response(
        JSON.stringify({ error: "Failed to check credits" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User credits:", creditData);

    if (creditData <= 0) {
      return new Response(
        JSON.stringify({ error: "No credits remaining", code: "NO_CREDITS" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URLs for images (buckets are public)
    const humanUrl = supabaseAdmin.storage
      .from("human-images")
      .getPublicUrl(humanImagePath);

    const garmentUrl = supabaseAdmin.storage
      .from("garment-images")
      .getPublicUrl(garmentImagePath);

    console.log("Human URL:", humanUrl.data.publicUrl);
    console.log("Garment URL:", garmentUrl.data.publicUrl);

    // Create job record first
    const { data: job, error: jobError } = await supabaseAdmin
      .from("tryon_jobs")
      .insert({
        user_id: user.id,
        human_image_path: humanImagePath,
        garment_image_path: garmentImagePath,
        status: "IN_PROGRESS",
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error("Job creation error:", jobError);
      return new Response(
        JSON.stringify({ error: "Failed to create job" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Job created:", job.id);

    // Call fal.ai FASHN v1.6 API (sync mode)
    console.log("Calling fal.ai FASHN v1.6...");
    const falResponse = await fetch(
      "https://fal.run/fal-ai/fashn/tryon",
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${falApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_image: humanUrl.data.publicUrl,
          garment_image: garmentUrl.data.publicUrl,
          category: "tops",
          garment_photo_type: "flat-lay",
          nsfw_filter: true,
        }),
      }
    );

    console.log("fal.ai response status:", falResponse.status);

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      console.error("fal.ai error:", errorText);

      // Update job as failed
      await supabaseAdmin
        .from("tryon_jobs")
        .update({
          status: "FAILED",
          error_message: `AI service error: ${errorText.substring(0, 200)}`,
        })
        .eq("id", job.id);

      return new Response(
        JSON.stringify({ error: "Failed to process with AI service" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const falData = await falResponse.json();
    console.log("fal.ai result:", JSON.stringify(falData).substring(0, 500));

    // Get result image URL
    const resultImageUrl = falData.image?.url || falData.output?.url || null;

    if (!resultImageUrl) {
      console.error("No result image in response:", falData);
      await supabaseAdmin
        .from("tryon_jobs")
        .update({
          status: "FAILED",
          error_message: "No result image received from AI",
        })
        .eq("id", job.id);

      return new Response(
        JSON.stringify({ error: "No result image from AI service" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Result image URL:", resultImageUrl);

    // Download and store result image
    const imageResponse = await fetch(resultImageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const resultPath = `${user.id}/${job.id}/result.jpg`;

    console.log("Uploading result to storage...");
    const { error: uploadError } = await supabaseAdmin.storage
      .from("tryon-results")
      .upload(resultPath, imageBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Still mark as completed but with external URL
    }

    // Get public URL for result
    const resultPublicUrl = supabaseAdmin.storage
      .from("tryon-results")
      .getPublicUrl(resultPath);

    // Create result record
    await supabaseAdmin
      .from("tryon_results")
      .insert({
        job_id: job.id,
        user_id: user.id,
        result_image_path: resultPath,
      });

    // Update job as completed
    await supabaseAdmin
      .from("tryon_jobs")
      .update({
        status: "COMPLETED",
        result_image_url: uploadError ? resultImageUrl : resultPublicUrl.data.publicUrl,
      })
      .eq("id", job.id);

    // Decrement user credits
    await supabaseAdmin.rpc("use_credit", { p_user_id: user.id });

    console.log("Job completed successfully!");

    return new Response(
      JSON.stringify({
        success: true,
        jobId: job.id,
        status: "COMPLETED",
        result: {
          imageUrl: uploadError ? resultImageUrl : resultPublicUrl.data.publicUrl,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
