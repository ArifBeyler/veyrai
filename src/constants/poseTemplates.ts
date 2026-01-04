// Pose Template sistemi
// Selfie/eksik kadraj durumlarında kullanıcıya önerilen şablonlar

export interface PoseTemplate {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'studio' | 'street' | 'casual' | 'minimal';
  // Placeholder URL - gerçek şablonlar Supabase'e yüklenecek
  imageUrl?: string;
}

export const POSE_TEMPLATES: PoseTemplate[] = [
  {
    id: 'studio-1',
    title: 'Stüdyo Tam Boy',
    description: 'Düz fon, profesyonel poz',
    emoji: '📸',
    category: 'studio',
  },
  {
    id: 'street-1',
    title: 'Sokak Stili',
    description: 'Doğal ortam, dinamik poz',
    emoji: '🏙️',
    category: 'street',
  },
  {
    id: 'mirror-1',
    title: 'Ayna Selfie',
    description: 'Tam boy ayna karesi',
    emoji: '🪞',
    category: 'casual',
  },
  {
    id: 'sitting-1',
    title: 'Oturma Pozu',
    description: 'Rahat, oturur pozisyon',
    emoji: '🪑',
    category: 'casual',
  },
  {
    id: 'oversize-1',
    title: 'Oversize Fit',
    description: 'Geniş kesim kıyafetler için',
    emoji: '👕',
    category: 'casual',
  },
  {
    id: 'minimal-1',
    title: 'Minimal',
    description: 'Sade arka plan, net poz',
    emoji: '✨',
    category: 'minimal',
  },
];

/**
 * Basit heuristic: Fotoğrafın "tam boy" olup olmadığını tahmin et
 * Gerçek uygulamada ML model kullanılabilir
 */
export const isLikelyFullBody = (aspectRatio: number): boolean => {
  // 3:4 veya daha uzun aspect ratio genelde tam boy
  // Selfie genelde kare veya yatay
  return aspectRatio <= 0.8; // width/height < 0.8 = dikey = muhtemelen tam boy
};

/**
 * Fotoğraf boyutlarından "selfie olabilir mi" tahmini
 */
export const isLikelySelfie = (width: number, height: number): boolean => {
  const aspectRatio = width / height;
  // Kare veya yatay = muhtemelen selfie
  // Dikey ama çok kısa = muhtemelen bel üstü
  return aspectRatio > 0.9 || height < 600;
};

