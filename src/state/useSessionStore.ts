import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export type UserPhoto = {
  id: string;
  uri: string;
  kind: 'front' | 'side' | 'angle';
  createdAt: Date;
};

export type GarmentCategory = 'tops' | 'pants' | 'shoes' | 'accessories' | 'dresses' | 'outerwear';

export type Garment = {
  id: string;
  title: string;
  category: GarmentCategory;
  imageUri: string;
  brand?: string;
  sourceUrl?: string;
  isUserAdded: boolean;
  createdAt: Date;
};

export type TryOnJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type TryOnJob = {
  id: string;
  userPhotoId: string;
  garmentId: string;
  status: TryOnJobStatus;
  outputUri?: string;
  thumbUri?: string;
  resultImageUrl?: string; // URL from AI generation
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
  params?: {
    style?: string;
    backgroundMode?: 'original' | 'studio';
    quality?: 'normal' | 'hd';
  };
};

export type UserProfile = {
  id: string;
  name: string;
  photos: UserPhoto[];
  isDefault: boolean;
  height?: number; // cm
  weight?: number; // kg
  gender?: 'male' | 'female' | 'other';
  createdAt: Date;
};

type SessionState = {
  // Onboarding
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;

  // Free credit
  freeCreditsUsed: boolean;
  setFreeCreditsUsed: (value: boolean) => void;

  // User profiles (multiple body/pose profiles)
  profiles: UserProfile[];
  activeProfileId: string | null;
  addProfile: (profile: UserProfile) => void;
  updateProfile: (id: string, updates: Partial<UserProfile>) => void;
  removeProfile: (id: string) => void;
  setActiveProfileId: (id: string | null) => void;

  // User photos (legacy - for backward compatibility)
  userPhotos: UserPhoto[];
  addUserPhoto: (photo: UserPhoto) => void;
  removeUserPhoto: (id: string) => void;
  clearUserPhotos: () => void;

  // Garments (user's wardrobe)
  garments: Garment[];
  addGarment: (garment: Garment) => void;
  updateGarment: (id: string, updates: Partial<Garment>) => void;
  removeGarment: (id: string) => void;

  // Selected items for try-on
  selectedPhotoId: string | null;
  setSelectedPhotoId: (id: string | null) => void;
  selectedGarmentId: string | null;
  setSelectedGarmentId: (id: string | null) => void;
  selectedProfileId: string | null;
  setSelectedProfileId: (id: string | null) => void;

  // Try-on jobs (generations)
  jobs: TryOnJob[];
  addJob: (job: TryOnJob) => void;
  updateJob: (id: string, updates: Partial<TryOnJob>) => void;
  removeJob: (id: string) => void;
  
  // Legacy alias for generations
  generations: TryOnJob[];
  addGeneration: (generation: TryOnJob) => void;
  updateGeneration: (id: string, updates: Partial<TryOnJob>) => void;
  removeGeneration: (id: string) => void;

  // User preferences
  preferences: {
    style: 'minimal' | 'street' | 'oldmoney' | 'techwear' | 'casual' | 'formal';
    backgroundMode: 'original' | 'studio';
    quality: 'normal' | 'hd';
  };
  setPreferences: (prefs: Partial<SessionState['preferences']>) => void;

  // Premium
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;

  // Device
  deviceHash: string | null;
  setDeviceHash: (hash: string) => void;

  // Push token
  pushToken: string | null;
  setPushToken: (token: string | null) => void;

  // Clear all user data (on logout/account switch)
  clearUserData: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Onboarding
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),

      // Free credit
      freeCreditsUsed: false,
      setFreeCreditsUsed: (value) => set({ freeCreditsUsed: value }),

      // User profiles
      profiles: [],
      activeProfileId: null,
      addProfile: (profile) =>
        set((state) => ({ profiles: [...state.profiles, profile] })),
      updateProfile: (id, updates) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removeProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
        })),
      setActiveProfileId: (id) => set({ activeProfileId: id }),

      // User photos (legacy)
      userPhotos: [],
      addUserPhoto: (photo) =>
        set((state) => ({ userPhotos: [...state.userPhotos, photo] })),
      removeUserPhoto: (id) =>
        set((state) => ({
          userPhotos: state.userPhotos.filter((p) => p.id !== id),
        })),
      clearUserPhotos: () => set({ userPhotos: [] }),

      // Garments
      garments: [],
      addGarment: (garment) =>
        set((state) => ({ garments: [...state.garments, garment] })),
      updateGarment: (id, updates) =>
        set((state) => ({
          garments: state.garments.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),
      removeGarment: (id) =>
        set((state) => ({
          garments: state.garments.filter((g) => g.id !== id),
        })),

      // Selected items
      selectedPhotoId: null,
      setSelectedPhotoId: (id) => set({ selectedPhotoId: id }),
      selectedGarmentId: null,
      setSelectedGarmentId: (id) => set({ selectedGarmentId: id }),
      selectedProfileId: null,
      setSelectedProfileId: (id) => set({ selectedProfileId: id }),

      // Try-on jobs
      jobs: [],
      addJob: (job) =>
        set((state) => ({ jobs: [job, ...state.jobs] })),
      updateJob: (id, updates) =>
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.id === id ? { ...j, ...updates } : j
          ),
        })),
      removeJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((j) => j.id !== id),
        })),

      // Legacy generations alias (points to jobs)
      get generations() {
        return get().jobs;
      },
      addGeneration: (generation) => get().addJob(generation),
      updateGeneration: (id, updates) => get().updateJob(id, updates),
      removeGeneration: (id) => get().removeJob(id),

      // Preferences
      preferences: {
        style: 'casual',
        backgroundMode: 'original',
        quality: 'normal',
      },
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      // Premium
      isPremium: false,
      setIsPremium: (value) => set({ isPremium: value }),

      // Device
      deviceHash: null,
      setDeviceHash: (hash) => set({ deviceHash: hash }),

      // Push token
      pushToken: null,
      setPushToken: (token) => set({ pushToken: token }),

      // Clear all user data (on logout/account switch)
      clearUserData: () => set({
        profiles: [],
        activeProfileId: null,
        userPhotos: [],
        garments: [],
        jobs: [],
        selectedPhotoId: null,
        selectedGarmentId: null,
        selectedProfileId: null,
        freeCreditsUsed: false,
      }),
    }),
    {
      name: 'fit-swap-session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        freeCreditsUsed: state.freeCreditsUsed,
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        userPhotos: state.userPhotos,
        garments: state.garments,
        jobs: state.jobs,
        preferences: state.preferences,
        isPremium: state.isPremium,
        deviceHash: state.deviceHash,
        pushToken: state.pushToken,
      }),
    }
  )
);
