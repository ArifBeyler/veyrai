import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getAllSampleGarments } from '../data/sampleGarments';

// Types
export type UserPhoto = {
  id: string;
  uri: string;
  kind: 'front' | 'side' | 'angle';
  createdAt: Date;
};

// Kategori grupları (almostfinal2.md'ye göre)
export type GarmentCategory = 
  | 'tops'        // Üst: t-shirt, gömlek, sweatshirt, ceket, blazer
  | 'bottoms'     // Alt: pantolon, şort, etek
  | 'onepiece'    // Tek parça: elbise, tulum
  | 'outerwear'   // Dış giyim: mont, kaban
  | 'footwear'    // Ayakkabı: sneaker, bot, topuklu
  | 'bags'        // Çanta: el çantası, sırt çantası
  | 'accessories'; // Aksesuar: şapka, gözlük, saat, takı, kemer

// Alt kategori tipleri
export type GarmentSubCategory = 
  // Tops
  | 'tshirt' | 'shirt' | 'sweatshirt' | 'blazer' | 'cardigan'
  // Bottoms
  | 'pants' | 'shorts' | 'skirt' | 'jeans'
  // One-piece
  | 'dress' | 'jumpsuit'
  // Outerwear
  | 'coat' | 'jacket' | 'parka'
  // Footwear
  | 'sneakers' | 'boots' | 'heels' | 'sandals' | 'loafers'
  // Bags
  | 'handbag' | 'backpack' | 'clutch' | 'tote'
  // Accessories
  | 'hat' | 'glasses' | 'watch' | 'jewelry' | 'belt' | 'scarf';

// Stil etiketleri
export type GarmentTag = 
  | 'streetwear' | 'formal' | 'minimal' | 'vintage' | 'sporty' 
  | 'casual' | 'elegant' | 'summer' | 'winter' | 'boho';

// Katman önceliği (düşük = altta, yüksek = üstte)
export const LAYER_PRIORITY: Record<GarmentCategory, number> = {
  bottoms: 1,
  onepiece: 1,
  tops: 2,
  outerwear: 3,
  footwear: 4,
  bags: 5,
  accessories: 6,
};

// Kategorinin çoklu seçime izin verip vermediği
export const MULTI_SELECT_CATEGORIES: GarmentCategory[] = ['accessories'];

// Tek seçim kategorileri
export const SINGLE_SELECT_CATEGORIES: GarmentCategory[] = ['tops', 'bottoms', 'onepiece', 'outerwear', 'footwear', 'bags'];

// Cinsiyet tipi
export type GarmentGender = 'male' | 'female' | 'unisex';

export type Garment = {
  id: string;
  title: string;
  category: GarmentCategory;
  subCategory?: GarmentSubCategory;
  imageUri: string | number; // string for URLs, number for require() bundled assets
  brand?: string;
  sourceUrl?: string;
  isUserAdded?: boolean;
  tags?: GarmentTag[];
  layerPriority?: number; // Manuel override için
  colorHint?: string; // Renk ipucu
  gender?: GarmentGender; // Cinsiyet filtresi
  createdAt: Date;
};

export type TryOnJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type TryOnJob = {
  id: string;
  userPhotoId: string;
  garmentId: string; // Tek kıyafet için (geriye uyumluluk)
  garmentIds?: string[]; // Çoklu kıyafet için (kombin)
  status: TryOnJobStatus;
  outputUri?: string;
  thumbUri?: string;
  resultImageUrl?: string; // URL from AI generation
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
  params?: {
    style?: string;
    styleNote?: string; // Kullanıcı stil notu
    backgroundMode?: 'original' | 'studio';
    quality?: 'normal' | 'hd';
    layerMode?: 'auto' | 'manual';
    fullOutfitMode?: boolean;
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
  
  // Multi-select için kombin seçimi
  selectedGarmentIds: string[];
  addSelectedGarment: (id: string) => void;
  removeSelectedGarment: (id: string) => void;
  toggleSelectedGarment: (id: string, category: GarmentCategory) => void;
  clearSelectedGarments: () => void;
  setSelectedGarments: (ids: string[]) => void;
  
  // Stil notu
  styleNote: string;
  setStyleNote: (note: string) => void;

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

  // Sample garments
  sampleGarmentsLoaded: boolean;
  loadSampleGarments: () => void;
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
      
      // Multi-select kombin seçimi
      selectedGarmentIds: [],
      addSelectedGarment: (id) =>
        set((state) => ({
          selectedGarmentIds: [...state.selectedGarmentIds, id],
        })),
      removeSelectedGarment: (id) =>
        set((state) => ({
          selectedGarmentIds: state.selectedGarmentIds.filter((gId) => gId !== id),
        })),
      toggleSelectedGarment: (id, category) =>
        set((state) => {
          const garment = state.garments.find(g => g.id === id);
          if (!garment) return state;
          
          const isSelected = state.selectedGarmentIds.includes(id);
          
          // Aksesuar kategorisi çoklu seçim
          if (category === 'accessories') {
            if (isSelected) {
              return { selectedGarmentIds: state.selectedGarmentIds.filter((gId) => gId !== id) };
            } else {
              // Maksimum 8 parça
              if (state.selectedGarmentIds.length >= 8) return state;
              return { selectedGarmentIds: [...state.selectedGarmentIds, id] };
            }
          }
          
          // Tek seçim kategorileri - aynı kategorideki önceki seçimi kaldır
          const otherGarmentIds = state.selectedGarmentIds.filter((gId) => {
            const g = state.garments.find(gar => gar.id === gId);
            return g?.category !== category;
          });
          
          if (isSelected) {
            return { selectedGarmentIds: otherGarmentIds };
          } else {
            // Maksimum 8 parça
            if (otherGarmentIds.length >= 8) return state;
            
            // One-piece seçilirse bottoms'u kaldır
            if (category === 'onepiece') {
              const filtered = otherGarmentIds.filter((gId) => {
                const g = state.garments.find(gar => gar.id === gId);
                return g?.category !== 'bottoms';
              });
              return { selectedGarmentIds: [...filtered, id] };
            }
            
            // Bottoms seçilirse one-piece'i kaldır
            if (category === 'bottoms') {
              const filtered = otherGarmentIds.filter((gId) => {
                const g = state.garments.find(gar => gar.id === gId);
                return g?.category !== 'onepiece';
              });
              return { selectedGarmentIds: [...filtered, id] };
            }
            
            return { selectedGarmentIds: [...otherGarmentIds, id] };
          }
        }),
      clearSelectedGarments: () => set({ selectedGarmentIds: [] }),
      setSelectedGarments: (ids) => set({ selectedGarmentIds: ids }),
      
      // Stil notu
      styleNote: '',
      setStyleNote: (note) => set({ styleNote: note }),

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
        selectedGarmentIds: [],
        styleNote: '',
        freeCreditsUsed: false,
        sampleGarmentsLoaded: false, // Örnek kıyafetlerin yeniden yüklenmesi için
      }),

      // Sample garments
      sampleGarmentsLoaded: false,
      loadSampleGarments: () => {
        const state = get();
        
        // Önce Unsplash görsellerini temizle
        const filteredGarments = state.garments.filter(garment => {
          // Number (bundled asset) ise Unsplash değil, koru
          if (typeof garment.imageUri === 'number') return true;
          
          if (garment.imageUri && (
            garment.imageUri.includes('unsplash.com') ||
            garment.imageUri.includes('unsplash') ||
            garment.imageUri.includes('images.unsplash')
          )) {
            return false;
          }
          return true;
        });
        
        // Tüm sample garment'ları al
        const allSamples = getAllSampleGarments();
        
        // Mevcut sample garment ID'lerini kontrol et
        const existingSampleTitles = filteredGarments
          .filter(g => g.id?.startsWith('sample-'))
          .map(g => g.title);
        
        // Eksik sample garment'ları bul
        const missingSamples = allSamples.filter(
          sample => !existingSampleTitles.includes(sample.title)
        );
        
        if (missingSamples.length > 0) {
          // Eksik olanları ekle
          const newSampleGarments = missingSamples.map((garment, index) => ({
            ...garment,
            id: `sample-new-${index + 1}-${Date.now()}`,
            createdAt: new Date(),
          }));
          
          set({
            garments: [...filteredGarments, ...newSampleGarments],
            sampleGarmentsLoaded: true,
          });
        } else if (!state.sampleGarmentsLoaded) {
          // İlk yükleme - tüm sample garments ekle
          const sampleGarments = allSamples.map((garment, index) => ({
            ...garment,
            id: `sample-${index + 1}-${Date.now()}`,
            createdAt: new Date(),
          }));
          
          set({
            garments: [...filteredGarments, ...sampleGarments],
            sampleGarmentsLoaded: true,
          });
        } else {
          // Sadece Unsplash temizliği
          set({ garments: filteredGarments });
        }
      },
    }),
    {
      name: 'wearify-session',
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
        sampleGarmentsLoaded: state.sampleGarmentsLoaded,
      }),
    }
  )
);
