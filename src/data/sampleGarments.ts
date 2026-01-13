import { Garment } from '../state/useSessionStore';
import { supabase } from '../services/supabase';

// Supabase Storage URL base
const SUPABASE_STORAGE_URL = 'https://gclvocafkllnosnbuzvw.supabase.co/storage/v1/object/public/garment-images';

// ========================================
// === ERKEK KOMBİN ASSET'LERİ ===
// ========================================
const MALE_COMBINE_1 = require('../../assets/images/combines/034785b196991ffea03e05ce7b021910.jpg');
const MALE_COMBINE_2 = require('../../assets/images/combines/1b39f84acb05f968dd071e84df4e4c3e.jpg');
const MALE_COMBINE_3 = require('../../assets/images/combines/a3d4ce444608dc1a28eeb86f9f155f2d.jpg');
const MALE_COMBINE_4 = require('../../assets/images/combines/a649bee229a4d788b51327a15530e282.jpg');
const MALE_COMBINE_5 = require('../../assets/images/combines/b5b703b25e6713105df0d6a412c89587.jpg');
const MALE_COMBINE_6 = require('../../assets/images/combines/outfit-2.jpg');

// ========================================
// === ERKEK KOMBİNLERİ ===
// ========================================
export const MALE_OUTFITS: Omit<Garment, 'id' | 'createdAt'>[] = [
  {
    title: 'Male Outfit 1',
    category: 'onepiece',
    imageUri: MALE_COMBINE_1,
    tags: ['casual', 'streetwear'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Male Outfit 2',
    category: 'onepiece',
    imageUri: MALE_COMBINE_2,
    tags: ['casual', 'streetwear'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Male Outfit 3',
    category: 'onepiece',
    imageUri: MALE_COMBINE_3,
    tags: ['casual', 'streetwear'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Male Outfit 4',
    category: 'onepiece',
    imageUri: MALE_COMBINE_4,
    tags: ['casual', 'streetwear'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Male Outfit 5',
    category: 'onepiece',
    imageUri: MALE_COMBINE_5,
    tags: ['casual', 'streetwear'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Male Outfit 6',
    category: 'onepiece',
    imageUri: MALE_COMBINE_6,
    tags: ['elegant', 'formal'],
    gender: 'male',
    isUserAdded: false,
  },
];

// Boş - sadece kombinler kullanılıyor
export const SAMPLE_GARMENTS: Omit<Garment, 'id' | 'createdAt'>[] = [];

// ========================================
// === KADIN KOMBİN ASSET'LERİ ===
// ========================================
const FEMALE_COMBINE_1 = require('../../assets/images/combines/female/female-outfit-1.png');
const FEMALE_COMBINE_2 = require('../../assets/images/combines/female/female-outfit-2.jpg');
const FEMALE_COMBINE_3 = require('../../assets/images/combines/female/female-outfit-3.png');
const FEMALE_COMBINE_4 = require('../../assets/images/combines/female/female-outfit-4.png');
const FEMALE_COMBINE_5 = require('../../assets/images/combines/female/female-outfit-5.png');
const FEMALE_COMBINE_6 = require('../../assets/images/combines/female/female-outfit-6.png');
const FEMALE_COMBINE_7 = require('../../assets/images/combines/female/female-outfit-7.png');
const FEMALE_COMBINE_8 = require('../../assets/images/combines/female/female-outfit-8.png');
const FEMALE_COMBINE_9 = require('../../assets/images/combines/female/female-outfit-9.png');

export const FEMALE_OUTFITS: Omit<Garment, 'id' | 'createdAt'>[] = [
  { title: 'Female Outfit 1', category: 'onepiece', imageUri: FEMALE_COMBINE_1, tags: ['casual', 'elegant'], gender: 'female', isUserAdded: false },
  { title: 'Female Outfit 2', category: 'onepiece', imageUri: FEMALE_COMBINE_2, tags: ['casual', 'elegant'], gender: 'female', isUserAdded: false },
  { title: 'Female Outfit 3', category: 'onepiece', imageUri: FEMALE_COMBINE_3, tags: ['casual', 'elegant'], gender: 'female', isUserAdded: false },
  { title: 'Female Outfit 4', category: 'onepiece', imageUri: FEMALE_COMBINE_4, tags: ['casual', 'elegant'], gender: 'female', isUserAdded: false },
  { title: 'Female Outfit 5', category: 'onepiece', imageUri: FEMALE_COMBINE_5, tags: ['casual', 'elegant'], gender: 'female', isUserAdded: false },
  { title: 'Female Outfit 6', category: 'onepiece', imageUri: FEMALE_COMBINE_6, tags: ['casual', 'elegant'], gender: 'female', isUserAdded: false },
  { title: 'Female Outfit 7', category: 'onepiece', imageUri: FEMALE_COMBINE_7, tags: ['casual', 'elegant'], gender: 'female', isUserAdded: false },
  { title: 'Female Outfit 8', category: 'onepiece', imageUri: FEMALE_COMBINE_8, tags: ['casual', 'elegant'], gender: 'female', isUserAdded: false },
  { title: 'Female Outfit 9', category: 'onepiece', imageUri: FEMALE_COMBINE_9, tags: ['casual', 'elegant'], gender: 'female', isUserAdded: false },
];

// Tüm örnek kıyafetleri al (local fallback)
export const getAllSampleGarments = (): Omit<Garment, 'id' | 'createdAt'>[] => {
  return [...MALE_OUTFITS, ...FEMALE_OUTFITS];
};

// Legacy export
export const ALL_SAMPLE_GARMENTS = SAMPLE_GARMENTS;

// Supabase'den sample garment'ları çek
export const fetchSampleGarmentsFromSupabase = async (): Promise<Garment[]> => {
  try {
    const { data, error } = await supabase
      .from('sample_garments')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching sample garments from Supabase:', error);
      return loadSampleGarmentsFromLocal();
    }

    if (!data || data.length === 0) {
      console.warn('No sample garments found in Supabase, using local fallback');
      return loadSampleGarmentsFromLocal();
    }

    return data.map((item) => {
      const imageUrl = item.image_path.startsWith('http')
        ? item.image_path
        : `${SUPABASE_STORAGE_URL}/${item.image_path}`;

      return {
        id: item.id,
        title: item.title,
        category: item.category as Garment['category'],
        subCategory: item.sub_category as any,
        imageUri: imageUrl,
        gender: (item.gender || 'unisex') as Garment['gender'],
        tags: item.tags || [],
        isUserAdded: false,
        createdAt: new Date(item.created_at),
      };
    });
  } catch (error) {
    console.error('Error in fetchSampleGarmentsFromSupabase:', error);
    return loadSampleGarmentsFromLocal();
  }
};

// Local fallback
export const loadSampleGarmentsFromLocal = (): Garment[] => {
  const allGarments = getAllSampleGarments();
  return allGarments.map((garment, index) => ({
    ...garment,
    id: `sample-${index + 1}-${Date.now()}`,
    createdAt: new Date(),
  }));
};

// Örnek kıyafetleri yükle (Supabase'den, fallback local)
export const loadSampleGarments = async (): Promise<Garment[]> => {
  return await fetchSampleGarmentsFromSupabase();
};
