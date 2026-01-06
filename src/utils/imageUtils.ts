/**
 * Supabase Storage URL'lerini optimize eder - yüksek kalite için
 * Transform parametreleri eklenmez, orijinal yüksek kaliteli görsel kullanılır
 */
export const getOptimizedImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Supabase Storage URL'si ise, transform parametreleri ekleme (orijinal kaliteyi koru)
  if (url.includes('supabase.co/storage')) {
    // URL'de zaten query parametreleri varsa, onları koru
    // Yoksa direkt URL'i döndür (orijinal kalite)
    return url;
  }
  
  // Diğer URL'ler için direkt döndür
  return url;
};

/**
 * Image source objesi oluşturur - yüksek kalite için optimize edilmiş
 */
export const getImageSource = (uri: string | null | undefined) => {
  const optimizedUri = getOptimizedImageUrl(uri);
  if (!optimizedUri) return null;
  
  return {
    uri: optimizedUri,
    // Cache ayarları - yüksek kalite için force-cache kullan
    cache: 'force-cache' as const,
  };
};

