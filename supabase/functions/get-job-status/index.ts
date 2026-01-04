// Supabase Edge Function: Get Try-On Job Status
// ==============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-hash',
}

interface GetJobStatusRequest {
  job_id: string
  device_hash: string
}

interface JobStatusResponse {
  success: boolean
  job?: {
    id: string
    status: 'queued' | 'processing' | 'completed' | 'failed'
    output_url?: string
    thumbnail_url?: string
    error_message?: string
    created_at: string
    completed_at?: string
  }
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request
    const url = new URL(req.url)
    const job_id = url.searchParams.get('job_id')
    const device_hash = req.headers.get('x-device-hash')

    if (!job_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'job_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get device
    const { data: device } = await supabase
      .from('devices')
      .select('id')
      .eq('device_hash', device_hash)
      .single()

    if (!device) {
      return new Response(
        JSON.stringify({ success: false, error: 'Device not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get job
    const { data: job, error: jobError } = await supabase
      .from('tryon_jobs')
      .select('*')
      .eq('id', job_id)
      .eq('device_id', device.id)
      .single()

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ success: false, error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate signed URLs if output exists
    let output_url: string | undefined
    let thumbnail_url: string | undefined

    if (job.output_path) {
      const { data: signedUrl } = await supabase
        .storage
        .from('tryon-outputs')
        .createSignedUrl(job.output_path, 3600) // 1 hour expiry
      
      output_url = signedUrl?.signedUrl
    }

    if (job.thumbnail_path) {
      const { data: signedUrl } = await supabase
        .storage
        .from('tryon-outputs')
        .createSignedUrl(job.thumbnail_path, 3600)
      
      thumbnail_url = signedUrl?.signedUrl
    }

    const response: JobStatusResponse = {
      success: true,
      job: {
        id: job.id,
        status: job.status,
        output_url,
        thumbnail_url,
        error_message: job.error_message,
        created_at: job.created_at,
        completed_at: job.completed_at,
      },
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error getting job status:', error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

