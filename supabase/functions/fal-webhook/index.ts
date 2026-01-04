// Supabase Edge Function: fal-webhook
// Handles webhook callbacks from fal.ai when job completes

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FalWebhookPayload {
  request_id: string;
  status: "OK" | "ERROR";
  payload?: {
    image: {
      url: string;
      width: number;
      height: number;
      content_type: string;
    };
  };
  error?: string;
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
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET")!;

    // Parse URL parameters
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    const jobId = url.searchParams.get("job_id");

    // Verify webhook secret
    if (secret !== webhookSecret) {
      console.error("Invalid webhook secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "Missing job_id parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse webhook payload
    const payload: FalWebhookPayload = await req.json();
    console.log("Webhook received:", JSON.stringify(payload));

    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get job from DB
    const { data: job, error: jobError } = await supabaseAdmin
      .from("tryon_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      console.error("Job not found:", jobId);
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle success
    if (payload.status === "OK" && payload.payload?.image?.url) {
      try {
        // Download image from fal.ai
        const imageResponse = await fetch(payload.payload.image.url);
        const imageBlob = await imageResponse.blob();
        const imageBuffer = await imageBlob.arrayBuffer();

        // Upload to Supabase Storage
        const resultPath = `${job.user_id}/${job.id}/result.jpg`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from("tryon-results")
          .upload(resultPath, imageBuffer, {
            contentType: payload.payload.image.content_type || "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error("Failed to upload result image");
        }

        // Create result record
        await supabaseAdmin
          .from("tryon_results")
          .insert({
            job_id: job.id,
            user_id: job.user_id,
            result_image_path: resultPath,
          });

        // Update job status to COMPLETED
        await supabaseAdmin
          .from("tryon_jobs")
          .update({ status: "COMPLETED" })
          .eq("id", job.id);

        console.log("Job completed successfully:", job.id);

      } catch (error) {
        console.error("Error processing result:", error);
        
        // Update job status to FAILED
        await supabaseAdmin
          .from("tryon_jobs")
          .update({
            status: "FAILED",
            error_message: "Failed to process result image",
          })
          .eq("id", job.id);
      }

    } else {
      // Handle failure
      await supabaseAdmin
        .from("tryon_jobs")
        .update({
          status: "FAILED",
          error_message: payload.error || "Unknown error from AI service",
        })
        .eq("id", job.id);

      console.log("Job failed:", job.id, payload.error);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

