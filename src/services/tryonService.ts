// Try-On Service
// Client-side service for interacting with try-on API

import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';

export type TryOnJobStatus = 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface TryOnJob {
  id: string;
  user_id: string;
  human_image_path: string;
  garment_image_path: string;
  fal_request_id: string | null;
  status: TryOnJobStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface TryOnResult {
  id: string;
  job_id: string;
  user_id: string;
  result_image_path: string;
  result_thumb_path: string | null;
  created_at: string;
  imageUrl?: string;
}

export interface CreateTryOnResponse {
  success: boolean;
  jobId: string;
  falRequestId?: string;
  status: TryOnJobStatus;
  result?: {
    imageUrl: string;
  };
}

export interface CheckStatusResponse {
  jobId: string;
  status: TryOnJobStatus;
  errorMessage?: string;
  result?: TryOnResult;
}

export interface UserCredits {
  user_id: string;
  balance: number;
  updated_at: string;
}

/**
 * Upload image to Supabase Storage - working version
 */
export const uploadImage = async (
  bucket: 'human-images' | 'garment-images',
  uri: string,
  userId: string
): Promise<string> => {
  const fileName = `${Date.now()}.jpg`;
  const filePath = `${userId}/${fileName}`;

  console.log('Upload starting - bucket:', bucket, 'uri:', uri.substring(0, 100));

  try {
    // Ensure URI has proper format
    let fileUri = uri;
    if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
      fileUri = `file://${uri}`;
    }

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    console.log('File info:', fileInfo);
    
    if (!fileInfo.exists) {
      throw new Error(`File does not exist at path: ${fileUri}`);
    }

    // Get session
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    // Upload using FileSystem.uploadAsync - THIS WORKED BEFORE!
    const supabaseUrl = 'https://gclvocafkllnosnbuzvw.supabase.co';
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`;

    console.log('Uploading via FileSystem.uploadAsync...');

    const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true',
      },
    });

    console.log('Upload result:', uploadResult.status, uploadResult.body);

    if (uploadResult.status !== 200) {
      throw new Error(`Upload failed with status ${uploadResult.status}: ${uploadResult.body}`);
    }

    console.log('Upload successful!');
    return filePath;
  } catch (err: any) {
    console.error('Upload error details:', err);
    throw new Error(`Failed to upload image: ${err.message || 'Unknown error'}`);
  }
};

/**
 * Create a try-on job using fal.ai FASHN
 * Takes user photo + garment photo -> generates real try-on result
 */
export const createTryOnJob = async (
  humanImagePath: string,
  garmentImagePath: string,
  _modelPhotoUrl?: string // unused for now
): Promise<CreateTryOnResponse> => {
  // Get public URLs for images
  const supabaseUrl = 'https://gclvocafkllnosnbuzvw.supabase.co';
  const userPhotoUrl = `${supabaseUrl}/storage/v1/object/public/human-images/${humanImagePath}`;
  const garmentUrl = `${supabaseUrl}/storage/v1/object/public/garment-images/${garmentImagePath}`;

  console.log('Calling fal.ai FASHN try-on with:', { userPhotoUrl, garmentUrl });

  const response = await supabase.functions.invoke('imagen-tryon', {
    body: {
      userPhotoUrl,
      garmentUrl,
    },
  });

  if (response.error) {
    console.error('Create job error:', response.error);
    throw new Error(response.error.message || 'Failed to create try-on job');
  }

  const data = response.data;
  console.log('Response:', data);
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create try-on job');
  }

  return {
    success: true,
    jobId: `local-${Date.now()}`,
    status: 'COMPLETED',
    result: {
      imageUrl: data.resultImageUrl,
    },
  };
};

/**
 * Create a simple try-on job (fallback - no face swap)
 */
export const createSimpleTryOnJob = async (
  humanImagePath: string,
  garmentImagePath: string
): Promise<CreateTryOnResponse> => {
  // Get public URLs for images
  const supabaseUrl = 'https://gclvocafkllnosnbuzvw.supabase.co';
  const humanImageUrl = `${supabaseUrl}/storage/v1/object/public/human-images/${humanImagePath}`;
  const garmentImageUrl = `${supabaseUrl}/storage/v1/object/public/garment-images/${garmentImagePath}`;

  console.log('Calling simple-tryon with URLs:', { humanImageUrl, garmentImageUrl });

  const response = await supabase.functions.invoke('simple-tryon', {
    body: {
      humanImageUrl,
      garmentImageUrl,
    },
  });

  if (response.error) {
    console.error('Create job error:', response.error);
    throw new Error(response.error.message || 'Failed to create try-on job');
  }

  const data = response.data;
  console.log('Response:', data);
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create try-on job');
  }

  // Return in expected format
  return {
    success: true,
    jobId: `local-${Date.now()}`, // Local ID since we're not using DB
    status: 'COMPLETED',
    result: {
      imageUrl: data.resultImageUrl,
    },
  };
};

/**
 * Check job status - Real API only
 */
export const checkJobStatus = async (jobId: string): Promise<CheckStatusResponse> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.access_token) {
    throw new Error('Giriş yapmanız gerekiyor');
  }

  const response = await supabase.functions.invoke('check-job-status', {
    body: { jobId },
  });

  if (response.error) {
    console.error('Check status error:', response.error);
    throw new Error(response.error.message || 'Job durumu alınamadı');
  }

  return response.data as CheckStatusResponse;
};

/**
 * Get user's try-on jobs
 */
export const getUserJobs = async (): Promise<TryOnJob[]> => {
  const { data, error } = await supabase
    .from('tryon_jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get jobs error:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Get user's try-on results
 */
export const getUserResults = async (): Promise<TryOnResult[]> => {
  const { data, error } = await supabase
    .from('tryon_results')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get results error:', error);
    throw new Error(error.message);
  }

  // Generate signed URLs for each result
  const resultsWithUrls = await Promise.all(
    (data || []).map(async (result) => {
      const { data: signedUrl } = await supabase.storage
        .from('tryon-results')
        .createSignedUrl(result.result_image_path, 3600);
      
      return {
        ...result,
        imageUrl: signedUrl?.signedUrl,
      };
    })
  );

  return resultsWithUrls;
};

/**
 * Get user credits
 */
export const getUserCredits = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('user_credits')
    .select('balance')
    .single();

  if (error) {
    // If no record exists, user has default credits
    if (error.code === 'PGRST116') {
      return 1; // Default balance
    }
    console.error('Get credits error:', error);
    return 0;
  }

  return data?.balance || 0;
};

/**
 * Get signed URL for an image
 */
export const getSignedUrl = async (
  bucket: 'human-images' | 'garment-images' | 'tryon-results',
  path: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Get signed URL error:', error);
    return null;
  }

  return data?.signedUrl || null;
};

/**
 * Delete a try-on job and its result
 */
export const deleteTryOnJob = async (jobId: string): Promise<void> => {
  // First get the job to get the paths
  const { data: job } = await supabase
    .from('tryon_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (!job) return;

  // Delete result from storage if exists
  const { data: result } = await supabase
    .from('tryon_results')
    .select('result_image_path')
    .eq('job_id', jobId)
    .single();

  if (result?.result_image_path) {
    await supabase.storage
      .from('tryon-results')
      .remove([result.result_image_path]);
  }

  // Delete job (will cascade delete result record)
  const { error } = await supabase
    .from('tryon_jobs')
    .delete()
    .eq('id', jobId);

  if (error) {
    console.error('Delete job error:', error);
    throw new Error(error.message);
  }
};

