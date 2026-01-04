import { Garment, GarmentCategory } from '../state/useSessionStore';

// Örnek kıyafetler - Supabase Storage'da saklanıyor
// Sen daha sonra kendi fotoğraflarınla değiştirebilirsin

const SUPABASE_STORAGE_URL = 'https://gclvocafkllnosnbuzvw.supabase.co/storage/v1/object/public/garment-images/samples';

export const SAMPLE_GARMENTS: Omit<Garment, 'id' | 'createdAt'>[] = [
  // ========================================
  // === GANGOWN.COM.TR - ERKEK KIYAFETLERİ ===
  // ========================================

  // === GANGOWN - ALTLAR (BOTTOMS) - Şalvar ===
  {
    title: 'Velour Flow Kadife Şalvar - Haki',
    category: 'bottoms',
    subCategory: 'pants',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-salvar-haki.jpg`,
    brand: 'Gangown',
    tags: ['streetwear', 'casual'],
    isUserAdded: false,
  },
  {
    title: 'Velour Flow Kadife Şalvar - Kahverengi',
    category: 'bottoms',
    subCategory: 'pants',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-salvar-kahve.jpg`,
    brand: 'Gangown',
    tags: ['streetwear', 'casual'],
    isUserAdded: false,
  },
  {
    title: 'Velour Flow Kadife Şalvar - Siyah',
    category: 'bottoms',
    subCategory: 'pants',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-salvar-siyah.jpg`,
    brand: 'Gangown',
    tags: ['streetwear', 'casual'],
    isUserAdded: false,
  },

  // === GANGOWN - DIŞ GİYİM (OUTERWEAR) - Mont/Ceket ===
  {
    title: 'Urban Pocket Deri Mont - Antrasit',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-deri-mont-antrasit.jpg`,
    brand: 'Gangown',
    tags: ['streetwear', 'elegant'],
    isUserAdded: false,
  },
  {
    title: 'Urban Pocket Deri Mont - Kahverengi',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-deri-mont-kahve.jpg`,
    brand: 'Gangown',
    tags: ['streetwear', 'elegant'],
    isUserAdded: false,
  },
  {
    title: 'Urban Pocket Deri Mont - Vizon',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-deri-mont-vizon.jpg`,
    brand: 'Gangown',
    tags: ['streetwear', 'elegant'],
    isUserAdded: false,
  },
  {
    title: 'Kaze Şişme Mont',
    category: 'outerwear',
    subCategory: 'parka',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-sisme-mont.jpg`,
    brand: 'Gangown',
    tags: ['winter', 'casual'],
    isUserAdded: false,
  },
  {
    title: 'Four Off Nakış Deri Mont',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/gangown-deri-mont-nakis.jpg`,
    brand: 'Gangown',
    tags: ['streetwear', 'elegant'],
    isUserAdded: false,
  },

  // ========================================
  // === ERKEK - UNSPLASH GÖRSELLERİ ===
  // ========================================

  // === ERKEK - ÜSTLER (TOPS) ===
  {
    title: 'Beyaz Basic T-Shirt',
    category: 'tops',
    subCategory: 'tshirt',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-tshirt-beyaz.jpg`,
    brand: 'Zara',
    tags: ['casual', 'minimal', 'summer'],
    isUserAdded: false,
  },
  {
    title: 'Siyah Oversize T-Shirt',
    category: 'tops',
    subCategory: 'tshirt',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-tshirt-siyah.jpg`,
    brand: 'Zara',
    tags: ['streetwear', 'casual'],
    isUserAdded: false,
  },
  {
    title: 'Mavi Oxford Gömlek',
    category: 'tops',
    subCategory: 'shirt',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-gomlek-mavi.jpg`,
    brand: 'Zara',
    tags: ['formal', 'casual'],
    isUserAdded: false,
  },
  {
    title: 'Gri Sweatshirt',
    category: 'tops',
    subCategory: 'sweatshirt',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-sweatshirt-gri.jpg`,
    brand: 'Zara',
    tags: ['casual', 'winter'],
    isUserAdded: false,
  },

  // === ERKEK - ALTLAR (BOTTOMS) ===
  {
    title: 'Mavi Slim Fit Jean',
    category: 'bottoms',
    subCategory: 'jeans',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-jean-mavi.jpg`,
    brand: 'Zara',
    tags: ['casual', 'streetwear'],
    isUserAdded: false,
  },
  {
    title: 'Siyah Chino Pantolon',
    category: 'bottoms',
    subCategory: 'pants',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-chino-siyah.jpg`,
    brand: 'Zara',
    tags: ['formal', 'minimal'],
    isUserAdded: false,
  },
  {
    title: 'Bej Kargo Pantolon',
    category: 'bottoms',
    subCategory: 'pants',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-kargo-bej.jpg`,
    brand: 'Zara',
    tags: ['streetwear', 'casual'],
    isUserAdded: false,
  },
  {
    title: 'Haki Bermuda Şort',
    category: 'bottoms',
    subCategory: 'shorts',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-sort-haki.jpg`,
    brand: 'Zara',
    tags: ['summer', 'casual'],
    isUserAdded: false,
  },

  // === ERKEK - DIŞ GİYİM (OUTERWEAR) ===
  {
    title: 'Siyah Deri Ceket',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-deri-ceket.jpg`,
    brand: 'Zara',
    tags: ['streetwear', 'elegant'],
    isUserAdded: false,
  },
  {
    title: 'Lacivert Blazer',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-blazer-lacivert.jpg`,
    brand: 'Zara',
    tags: ['formal', 'elegant'],
    isUserAdded: false,
  },
  {
    title: 'Kahve Bomber Ceket',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-bomber-kahve.jpg`,
    brand: 'Zara',
    tags: ['casual', 'streetwear'],
    isUserAdded: false,
  },

  // === ERKEK - AYAKKABI (FOOTWEAR) ===
  {
    title: 'Beyaz Sneaker',
    category: 'footwear',
    subCategory: 'sneakers',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-sneaker-beyaz.jpg`,
    brand: 'Nike',
    tags: ['casual', 'minimal'],
    isUserAdded: false,
  },
  {
    title: 'Siyah Chelsea Bot',
    category: 'footwear',
    subCategory: 'boots',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-chelsea-siyah.jpg`,
    brand: 'Zara',
    tags: ['elegant', 'winter'],
    isUserAdded: false,
  },
  {
    title: 'Siyah Spor Ayakkabı',
    category: 'footwear',
    subCategory: 'sneakers',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-spor-siyah.jpg`,
    brand: 'Nike',
    tags: ['sporty', 'casual'],
    isUserAdded: false,
  },

  // === ERKEK - ÇANTA (BAGS) ===
  {
    title: 'Siyah Messenger Çanta',
    category: 'bags',
    subCategory: 'handbag',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-messenger.jpg`,
    brand: 'Zara',
    tags: ['casual', 'minimal'],
    isUserAdded: false,
  },

  // === ERKEK - AKSESUAR (ACCESSORIES) ===
  {
    title: 'Siyah Güneş Gözlüğü',
    category: 'accessories',
    subCategory: 'glasses',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-gunes-gozlugu.jpg`,
    brand: 'RayBan',
    tags: ['summer', 'casual'],
    isUserAdded: false,
  },
  {
    title: 'Deri Kemer',
    category: 'accessories',
    subCategory: 'belt',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-kemer.jpg`,
    brand: 'Zara',
    tags: ['formal', 'casual'],
    isUserAdded: false,
  },
  {
    title: 'Siyah Beanie',
    category: 'accessories',
    subCategory: 'hat',
    imageUri: `${SUPABASE_STORAGE_URL}/erkek-beanie.jpg`,
    brand: 'Zara',
    tags: ['winter', 'streetwear'],
    isUserAdded: false,
  },

  // ========================================
  // === KADIN - UNSPLASH GÖRSELLERİ ===
  // ========================================

  // === KADIN - ÜSTLER (TOPS) ===
  {
    title: 'Beyaz Crop Top',
    category: 'tops',
    subCategory: 'tshirt',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-crop-top.jpg`,
    brand: 'Zara',
    tags: ['summer', 'casual'],
    isUserAdded: false,
  },
  {
    title: 'Saten Bluz',
    category: 'tops',
    subCategory: 'shirt',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-bluz-saten.jpg`,
    brand: 'Zara',
    tags: ['elegant', 'formal'],
    isUserAdded: false,
  },
  {
    title: 'Örgü Hırka',
    category: 'tops',
    subCategory: 'cardigan',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-hirka.jpg`,
    brand: 'Zara',
    tags: ['casual', 'winter'],
    isUserAdded: false,
  },

  // === KADIN - ELBISE (ONE-PIECE) ===
  {
    title: 'Siyah Mini Elbise',
    category: 'onepiece',
    subCategory: 'dress',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-elbise-siyah.jpg`,
    brand: 'Zara',
    tags: ['elegant', 'formal'],
    isUserAdded: false,
  },
  {
    title: 'Çiçekli Midi Elbise',
    category: 'onepiece',
    subCategory: 'dress',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-elbise-cicekli.jpg`,
    brand: 'Zara',
    tags: ['boho', 'summer'],
    isUserAdded: false,
  },
  {
    title: 'Saten Uzun Elbise',
    category: 'onepiece',
    subCategory: 'dress',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-elbise-saten.jpg`,
    brand: 'Zara',
    tags: ['elegant', 'formal'],
    isUserAdded: false,
  },

  // === KADIN - ALTLAR (BOTTOMS) ===
  {
    title: 'Yüksek Bel Jean',
    category: 'bottoms',
    subCategory: 'jeans',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-jean.jpg`,
    brand: 'Zara',
    tags: ['casual', 'streetwear'],
    isUserAdded: false,
  },
  {
    title: 'Siyah Wide Leg Pantolon',
    category: 'bottoms',
    subCategory: 'pants',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-pantolon-siyah.jpg`,
    brand: 'Zara',
    tags: ['elegant', 'formal'],
    isUserAdded: false,
  },
  {
    title: 'Pileli Mini Etek',
    category: 'bottoms',
    subCategory: 'skirt',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-etek.jpg`,
    brand: 'Zara',
    tags: ['elegant', 'casual'],
    isUserAdded: false,
  },

  // === KADIN - DIŞ GİYİM (OUTERWEAR) ===
  {
    title: 'Oversize Blazer',
    category: 'outerwear',
    subCategory: 'jacket',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-blazer.jpg`,
    brand: 'Zara',
    tags: ['formal', 'elegant'],
    isUserAdded: false,
  },
  {
    title: 'Trençkot',
    category: 'outerwear',
    subCategory: 'coat',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-trenckot.jpg`,
    brand: 'Zara',
    tags: ['elegant', 'winter'],
    isUserAdded: false,
  },

  // === KADIN - AYAKKABI (FOOTWEAR) ===
  {
    title: 'Nude Topuklu',
    category: 'footwear',
    subCategory: 'heels',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-topuklu.jpg`,
    brand: 'Zara',
    tags: ['elegant', 'formal'],
    isUserAdded: false,
  },
  {
    title: 'Beyaz Platform Sneaker',
    category: 'footwear',
    subCategory: 'sneakers',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-sneaker.jpg`,
    brand: 'Nike',
    tags: ['casual', 'streetwear'],
    isUserAdded: false,
  },
  {
    title: 'Siyah Ankle Boot',
    category: 'footwear',
    subCategory: 'boots',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-bot.jpg`,
    brand: 'Zara',
    tags: ['elegant', 'winter'],
    isUserAdded: false,
  },

  // === KADIN - ÇANTA (BAGS) ===
  {
    title: 'Siyah Mini Çanta',
    category: 'bags',
    subCategory: 'handbag',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-mini-canta.jpg`,
    brand: 'Zara',
    tags: ['elegant', 'formal'],
    isUserAdded: false,
  },
  {
    title: 'Bej Tote Çanta',
    category: 'bags',
    subCategory: 'tote',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-tote.jpg`,
    brand: 'Zara',
    tags: ['casual', 'minimal'],
    isUserAdded: false,
  },
  {
    title: 'Kırmızı Crossbody Çanta',
    category: 'bags',
    subCategory: 'handbag',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-crossbody.jpg`,
    brand: 'Zara',
    tags: ['casual', 'elegant'],
    isUserAdded: false,
  },

  // === KADIN - AKSESUAR (ACCESSORIES) ===
  {
    title: 'Altın Küpe Seti',
    category: 'accessories',
    subCategory: 'jewelry',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-kupe.jpg`,
    brand: 'Zara',
    tags: ['elegant', 'formal'],
    isUserAdded: false,
  },
  {
    title: 'Cat Eye Güneş Gözlüğü',
    category: 'accessories',
    subCategory: 'glasses',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-gozluk.jpg`,
    brand: 'RayBan',
    tags: ['summer', 'elegant'],
    isUserAdded: false,
  },
  {
    title: 'İpek Fular',
    category: 'accessories',
    subCategory: 'scarf',
    imageUri: `${SUPABASE_STORAGE_URL}/kadin-fular.jpg`,
    brand: 'Zara',
    tags: ['elegant', 'boho'],
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
