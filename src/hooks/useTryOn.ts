// useTryOn Hook
// React Query based hook for try-on operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  uploadImage,
  createTryOnJob,
  checkJobStatus,
  getUserJobs,
  getUserResults,
  getUserCredits,
  deleteTryOnJob,
  TryOnJob,
  TryOnResult,
  TryOnJobStatus,
  CheckStatusResponse,
} from '../services/tryonService';
import { sendJobCompletedNotification, sendJobFailedNotification } from '../services/pushNotifications';

const QUERY_KEYS = {
  jobs: ['tryon-jobs'],
  results: ['tryon-results'],
  credits: ['user-credits'],
  jobStatus: (id: string) => ['job-status', id],
};

/**
 * Hook to get user's try-on jobs
 */
export const useTryOnJobs = () => {
  return useQuery({
    queryKey: QUERY_KEYS.jobs,
    queryFn: getUserJobs,
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Hook to get user's try-on results
 */
export const useTryOnResults = () => {
  return useQuery({
    queryKey: QUERY_KEYS.results,
    queryFn: getUserResults,
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Hook to get user credits
 */
export const useUserCredits = () => {
  return useQuery({
    queryKey: QUERY_KEYS.credits,
    queryFn: getUserCredits,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook to create a new try-on job
 * Now supports multiple garments for outfit creation
 */
export const useCreateTryOn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      humanImageUri,
      garmentImageUris,
      garmentCategories,
      styleNote,
      userId,
      modelPhotoUrl,
    }: {
      humanImageUri: string;
      garmentImageUris: string[];
      garmentCategories?: string[];
      styleNote?: string;
      userId: string;
      modelPhotoUrl?: string;
    }) => {
      // Upload human image
      const humanImagePath = await uploadImage('human-images', humanImageUri, userId);
      
      // Upload all garment images
      const garmentImagePaths = await Promise.all(
        garmentImageUris.map(uri => uploadImage('garment-images', uri, userId))
      );

      // Create the job with multiple garments
      return createTryOnJob(humanImagePath, garmentImagePaths, garmentCategories, styleNote, modelPhotoUrl);
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.credits });
    },
  });
};

/**
 * Hook to delete a try-on job
 */
export const useDeleteTryOn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTryOnJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.results });
    },
  });
};

/**
 * Hook to poll job status until completion
 */
export const useJobPolling = (jobId: string | null, enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<TryOnJobStatus | null>(null);
  const [result, setResult] = useState<TryOnResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const errorCountRef = useRef(0);
  const MAX_ERRORS = 5;

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const poll = useCallback(async () => {
    if (!jobId || !mountedRef.current) return;

    try {
      const response = await checkJobStatus(jobId);
      
      if (!mountedRef.current) return;

      // Reset error count on success
      errorCountRef.current = 0;
      setStatus(response.status);

      if (response.status === 'COMPLETED') {
        setResult(response.result || null);
        stopPolling();
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.results });
        
        // Send notification
        await sendJobCompletedNotification(jobId);
      } else if (response.status === 'FAILED') {
        setError(response.errorMessage || 'İşlem başarısız oldu');
        stopPolling();
        
        // Send notification
        await sendJobFailedNotification(jobId);
      }
    } catch (err: any) {
      console.error('Polling error:', err);
      errorCountRef.current++;
      
      // Stop after MAX_ERRORS consecutive errors
      if (errorCountRef.current >= MAX_ERRORS) {
        setError(err.message || 'Bağlantı hatası. Lütfen tekrar deneyin.');
        setStatus('FAILED');
        stopPolling();
      }
    }
  }, [jobId, queryClient, stopPolling]);

  const startPolling = useCallback(() => {
    if (!jobId || intervalRef.current) return;

    setIsPolling(true);
    setError(null);

    // Initial poll
    poll();

    // Poll every 3 seconds
    intervalRef.current = setInterval(poll, 3000);
  }, [jobId, poll]);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled && jobId) {
      startPolling();
    }

    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [enabled, jobId, startPolling, stopPolling]);

  return {
    status,
    result,
    error,
    isPolling,
    startPolling,
    stopPolling,
  };
};

/**
 * Combined hook for the full try-on flow
 * Uses sync mode - result returns immediately from create (NO POLLING)
 * Now supports multiple garments for outfit creation
 */
export const useTryOnFlow = () => {
  const createTryOn = useCreateTryOn();
  const { data: credits, isLoading: isLoadingCredits } = useUserCredits();
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<TryOnResult | null>(null);
  const [syncStatus, setSyncStatus] = useState<TryOnJobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTryOn = useCallback(
    async (
      humanImageUri: string,
      garmentImageUris: string | string[],
      userId: string,
      modelPhotoUrl?: string,
      garmentCategories?: string[],
      styleNote?: string
    ) => {
      try {
        setSyncResult(null);
        setSyncStatus('IN_PROGRESS');
        setError(null);
        
        // Normalize to array
        const uris = Array.isArray(garmentImageUris) ? garmentImageUris : [garmentImageUris];
        
        const response = await createTryOn.mutateAsync({
          humanImageUri,
          garmentImageUris: uris,
          garmentCategories,
          styleNote,
          userId,
          modelPhotoUrl,
        });
        
        setCurrentJobId(response.jobId);
        
        // Sync mode - result comes immediately
        if (response.status === 'COMPLETED' && response.result?.imageUrl) {
          console.log('Sync result received:', response.result.imageUrl);
          setSyncResult({ imageUrl: response.result.imageUrl } as TryOnResult);
          setSyncStatus('COMPLETED');
        } else if (response.status === 'FAILED') {
          setSyncStatus('FAILED');
          setError('İşlem başarısız oldu');
        } else {
          // Unexpected state
          setSyncStatus(response.status);
        }
        
        return { jobId: response.jobId, result: response.result };
      } catch (err: any) {
        console.error('Try-on error:', err);
        setSyncStatus('FAILED');
        setError(err.message || 'Bir hata oluştu');
        throw err;
      }
    },
    [createTryOn]
  );

  const reset = useCallback(() => {
    setCurrentJobId(null);
    setSyncResult(null);
    setSyncStatus(null);
    setError(null);
  }, []);

  return {
    // Actions
    startTryOn,
    reset,
    
    // State
    currentJobId,
    jobStatus: syncStatus,
    jobResult: syncResult,
    jobError: error,
    isPolling: false, // No polling in sync mode
    isCreating: createTryOn.isPending,
    createError: createTryOn.error,
    
    // Credits
    credits: credits || 0,
    isLoadingCredits,
    hasCredits: (credits || 0) > 0,
  };
};

