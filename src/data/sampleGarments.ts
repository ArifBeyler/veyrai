import { Garment, GarmentCategory } from '../state/useSessionStore';

// Örnek kıyafetler - Supabase Storage'da saklanıyor
// Sen daha sonra kendi fotoğraflarınla değiştirebilirsin

const SUPABASE_STORAGE_URL = 'https://gclvocafkllnosnbuzvw.supabase.co/storage/v1/object/public/garment-images/samples';

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
    isUserAdded: false,
  },
  {
    title: 'Velour Flow Kadife Şalvar - Kahverengi',
    category: 'bottoms',
    subCategory: 'pants',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-salvar-kahve.jpg`,
    tags: ['streetwear', 'casual'],
    isUserAdded: false,
  },
  {
    title: 'Velour Flow Kadife Şalvar - Siyah',
    category: 'bottoms',
    subCategory: 'pants',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-salvar-siyah.jpg`,
    tags: ['streetwear', 'casual'],
    isUserAdded: false,
  },

  // === DIŞ GİYİM (OUTERWEAR) - Mont/Ceket ===
  {
    title: 'Urban Pocket Deri Mont - Antrasit',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-deri-mont-antrasit.jpg`,
    tags: ['streetwear', 'elegant'],
    isUserAdded: false,
  },
  {
    title: 'Urban Pocket Deri Mont - Kahverengi',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-deri-mont-kahve.jpg`,
    tags: ['streetwear', 'elegant'],
    isUserAdded: false,
  },
  {
    title: 'Urban Pocket Deri Mont - Vizon',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-deri-mont-vizon.jpg`,
    tags: ['streetwear', 'elegant'],
    isUserAdded: false,
  },
  {
    title: 'Kaze Şişme Mont',
    category: 'outerwear',
    subCategory: 'parka',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-sisme-mont.jpg`,
    tags: ['winter', 'casual'],
    isUserAdded: false,
  },
  {
    title: 'Four Off Nakış Deri Mont',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-deri-mont-nakis.jpg`,
    tags: ['streetwear', 'elegant'],
    isUserAdded: false,
  },
];

// Örnek kıyafetleri yükle
export const loadSampleGarments = (): Garment[] => {
  return SAMPLE_GARMENTS.map((garment, index) => ({
    ...garment,
    id: `sample-${index + 1}-${Date.now()}`,
    createdAt: new Date(),
  }));
};
