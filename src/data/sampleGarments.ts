import { Garment } from '../state/useSessionStore';

// Örnek kıyafetler - Supabase Storage'da saklanıyor
const SUPABASE_STORAGE_URL = 'https://gclvocafkllnosnbuzvw.supabase.co/storage/v1/object/public/garment-images/samples';

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
// === KADIN KOMBİN ASSET'LERİ ===
// ========================================
const FEMALE_COMBINE_1 = require('../../assets/images/combines/female/female-outfit-1.jpg');
const FEMALE_COMBINE_2 = require('../../assets/images/combines/female/female-outfit-2.jpg');
const FEMALE_COMBINE_3 = require('../../assets/images/combines/female/female-outfit-3.png');
const FEMALE_COMBINE_4 = require('../../assets/images/combines/female/female-outfit-4.png');
const FEMALE_COMBINE_5 = require('../../assets/images/combines/female/female-outfit-5.png');
const FEMALE_COMBINE_6 = require('../../assets/images/combines/female/female-outfit-6.png');
const FEMALE_COMBINE_7 = require('../../assets/images/combines/female/female-outfit-7.png');
const FEMALE_COMBINE_8 = require('../../assets/images/combines/female/female-outfit-8.png');
const FEMALE_COMBINE_9 = require('../../assets/images/combines/female/female-outfit-9.png');
const FEMALE_COMBINE_10 = require('../../assets/images/combines/female/female-outfit-10.png');
const FEMALE_COMBINE_11 = require('../../assets/images/combines/female/female-outfit-11.jpg');

export const SAMPLE_GARMENTS: Omit<Garment, 'id' | 'createdAt'>[] = [
  // ========================================
  // === ERKEK KIYAFETLERİ ===
  // ========================================

  // === ALTLAR (BOTTOMS) - Şalvar ===
  {
    title: 'Velour Flow Kadife Şalvar - Haki',
    category: 'bottoms',
    subCategory: 'pants',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-salvar-haki.jpg`,
    tags: ['streetwear', 'casual'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Velour Flow Kadife Şalvar - Kahverengi',
    category: 'bottoms',
    subCategory: 'pants',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-salvar-kahve.jpg`,
    tags: ['streetwear', 'casual'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Velour Flow Kadife Şalvar - Siyah',
    category: 'bottoms',
    subCategory: 'pants',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-salvar-siyah.jpg`,
    tags: ['streetwear', 'casual'],
    gender: 'male',
    isUserAdded: false,
  },

  // === DIŞ GİYİM (OUTERWEAR) - Mont/Ceket ===
  {
    title: 'Urban Pocket Deri Mont - Antrasit',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-deri-mont-antrasit.jpg`,
    tags: ['streetwear', 'elegant'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Urban Pocket Deri Mont - Kahverengi',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-deri-mont-kahve.jpg`,
    tags: ['streetwear', 'elegant'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Urban Pocket Deri Mont - Vizon',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-deri-mont-vizon.jpg`,
    tags: ['streetwear', 'elegant'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Kaze Şişme Mont',
    category: 'outerwear',
    subCategory: 'parka',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-sisme-mont.jpg`,
    tags: ['winter', 'casual'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Four Off Nakış Deri Mont',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-deri-mont-nakis.jpg`,
    tags: ['streetwear', 'elegant'],
    gender: 'male',
    isUserAdded: false,
  },
];

// ========================================
// === ERKEK KOMBİNLERİ ===
// ========================================
export const MALE_OUTFITS: Omit<Garment, 'id' | 'createdAt'>[] = [
  {
    title: 'Erkek Kombin 1',
    category: 'onepiece',
    imageUri: MALE_COMBINE_1 as unknown as string,
    tags: ['casual', 'streetwear'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Erkek Kombin 2',
    category: 'onepiece',
    imageUri: MALE_COMBINE_2 as unknown as string,
    tags: ['casual', 'streetwear'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Erkek Kombin 3',
    category: 'onepiece',
    imageUri: MALE_COMBINE_3 as unknown as string,
    tags: ['casual', 'streetwear'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Erkek Kombin 4',
    category: 'onepiece',
    imageUri: MALE_COMBINE_4 as unknown as string,
    tags: ['casual', 'streetwear'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Erkek Kombin 5',
    category: 'onepiece',
    imageUri: MALE_COMBINE_5 as unknown as string,
    tags: ['casual', 'streetwear'],
    gender: 'male',
    isUserAdded: false,
  },
  {
    title: 'Erkek Kombin 6',
    category: 'onepiece',
    imageUri: MALE_COMBINE_6 as unknown as string,
    tags: ['elegant', 'formal'],
    gender: 'male',
    isUserAdded: false,
  },
];

// ========================================
// === KADIN KOMBİNLERİ ===
// ========================================
export const FEMALE_OUTFITS: Omit<Garment, 'id' | 'createdAt'>[] = [
  {
    title: 'Kadın Kombin 1',
    category: 'onepiece',
    imageUri: FEMALE_COMBINE_1 as unknown as string,
    tags: ['elegant', 'casual'],
    gender: 'female',
    isUserAdded: false,
  },
  {
    title: 'Kadın Kombin 2',
    category: 'onepiece',
    imageUri: FEMALE_COMBINE_2 as unknown as string,
    tags: ['elegant', 'casual'],
    gender: 'female',
    isUserAdded: false,
  },
  {
    title: 'Kadın Kombin 3',
    category: 'onepiece',
    imageUri: FEMALE_COMBINE_3 as unknown as string,
    tags: ['casual', 'streetwear'],
    gender: 'female',
    isUserAdded: false,
  },
  {
    title: 'Kadın Kombin 4',
    category: 'onepiece',
    imageUri: FEMALE_COMBINE_4 as unknown as string,
    tags: ['elegant', 'formal'],
    gender: 'female',
    isUserAdded: false,
  },
  {
    title: 'Kadın Kombin 5',
    category: 'onepiece',
    imageUri: FEMALE_COMBINE_5 as unknown as string,
    tags: ['casual', 'boho'],
    gender: 'female',
    isUserAdded: false,
  },
  {
    title: 'Kadın Kombin 6',
    category: 'onepiece',
    imageUri: FEMALE_COMBINE_6 as unknown as string,
    tags: ['elegant', 'minimal'],
    gender: 'female',
    isUserAdded: false,
  },
  {
    title: 'Kadın Kombin 7',
    category: 'onepiece',
    imageUri: FEMALE_COMBINE_7 as unknown as string,
    tags: ['casual', 'streetwear'],
    gender: 'female',
    isUserAdded: false,
  },
  {
    title: 'Kadın Kombin 8',
    category: 'onepiece',
    imageUri: FEMALE_COMBINE_8 as unknown as string,
    tags: ['elegant', 'formal'],
    gender: 'female',
    isUserAdded: false,
  },
  {
    title: 'Kadın Kombin 9',
    category: 'onepiece',
    imageUri: FEMALE_COMBINE_9 as unknown as string,
    tags: ['casual', 'summer'],
    gender: 'female',
    isUserAdded: false,
  },
  {
    title: 'Kadın Kombin 10',
    category: 'onepiece',
    imageUri: FEMALE_COMBINE_10 as unknown as string,
    tags: ['elegant', 'minimal'],
    gender: 'female',
    isUserAdded: false,
  },
  {
    title: 'Kadın Kombin 11',
    category: 'onepiece',
    imageUri: FEMALE_COMBINE_11 as unknown as string,
    tags: ['casual', 'boho'],
    gender: 'female',
    isUserAdded: false,
  },
];

// Tüm örnek kıyafetleri al
export const getAllSampleGarments = (): Omit<Garment, 'id' | 'createdAt'>[] => {
  return [...SAMPLE_GARMENTS, ...MALE_OUTFITS, ...FEMALE_OUTFITS];
};

// Legacy export
export const ALL_SAMPLE_GARMENTS = SAMPLE_GARMENTS;

// Örnek kıyafetleri yükle
export const loadSampleGarments = (): Garment[] => {
  const allGarments = getAllSampleGarments();
  return allGarments.map((garment, index) => ({
    ...garment,
    id: `sample-${index + 1}-${Date.now()}`,
    createdAt: new Date(),
  }));
};
