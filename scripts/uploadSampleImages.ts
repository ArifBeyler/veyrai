/**
 * Bu script örnek kıyafet görsellerini Supabase Storage'a yükler
 * 
 * Kullanım:
 * npx ts-node scripts/uploadSampleImages.ts
 * 
 * Not: Sen daha sonra kendi fotoğraflarınla değiştirebilirsin
 */

import { createClient } from '@supabase/supabase-js';

// Supabase credentials - .env dosyasından al veya burada tanımla
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Örnek görseller - Unsplash'tan (bunlar çalışır)
const SAMPLE_IMAGES = [
  // ERKEK - TOPS
  { name: 'erkek-tshirt-beyaz.jpg', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', category: 'tops' },
  { name: 'erkek-tshirt-siyah.jpg', url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&q=80', category: 'tops' },
  { name: 'erkek-gomlek-mavi.jpg', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80', category: 'tops' },
  { name: 'erkek-sweatshirt-gri.jpg', url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80', category: 'tops' },
  
  // ERKEK - BOTTOMS
  { name: 'erkek-jean-mavi.jpg', url: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&q=80', category: 'bottoms' },
  { name: 'erkek-chino-siyah.jpg', url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80', category: 'bottoms' },
  { name: 'erkek-kargo-bej.jpg', url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=400&q=80', category: 'bottoms' },
  { name: 'erkek-sort-haki.jpg', url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80', category: 'bottoms' },
  
  // ERKEK - OUTERWEAR
  { name: 'erkek-deri-ceket.jpg', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80', category: 'outerwear' },
  { name: 'erkek-blazer-lacivert.jpg', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80', category: 'outerwear' },
  { name: 'erkek-bomber-kahve.jpg', url: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=400&q=80', category: 'outerwear' },
  { name: 'erkek-parka-siyah.jpg', url: 'https://images.unsplash.com/photo-1544923246-77307dd628b7?w=400&q=80', category: 'outerwear' },
  
  // ERKEK - FOOTWEAR
  { name: 'erkek-sneaker-beyaz.jpg', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', category: 'footwear' },
  { name: 'erkek-chelsea-siyah.jpg', url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=400&q=80', category: 'footwear' },
  { name: 'erkek-spor-siyah.jpg', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', category: 'footwear' },
  
  // ERKEK - BAGS
  { name: 'erkek-messenger.jpg', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', category: 'bags' },
  { name: 'erkek-sirt-cantasi.jpg', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a45?w=400&q=80', category: 'bags' },
  
  // ERKEK - ACCESSORIES
  { name: 'erkek-gunes-gozlugu.jpg', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80', category: 'accessories' },
  { name: 'erkek-kemer.jpg', url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&q=80', category: 'accessories' },
  { name: 'erkek-beanie.jpg', url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&q=80', category: 'accessories' },
  
  // KADIN - TOPS
  { name: 'kadin-crop-top.jpg', url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&q=80', category: 'tops' },
  { name: 'kadin-bluz-saten.jpg', url: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&q=80', category: 'tops' },
  { name: 'kadin-hirka.jpg', url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80', category: 'tops' },
  
  // KADIN - ONEPIECE
  { name: 'kadin-elbise-siyah.jpg', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80', category: 'onepiece' },
  { name: 'kadin-elbise-cicekli.jpg', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80', category: 'onepiece' },
  { name: 'kadin-elbise-saten.jpg', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80', category: 'onepiece' },
  
  // KADIN - BOTTOMS
  { name: 'kadin-jean.jpg', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80', category: 'bottoms' },
  { name: 'kadin-pantolon-siyah.jpg', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80', category: 'bottoms' },
  { name: 'kadin-etek.jpg', url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80', category: 'bottoms' },
  
  // KADIN - OUTERWEAR
  { name: 'kadin-blazer.jpg', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80', category: 'outerwear' },
  { name: 'kadin-trenckot.jpg', url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&q=80', category: 'outerwear' },
  
  // KADIN - FOOTWEAR
  { name: 'kadin-topuklu.jpg', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80', category: 'footwear' },
  { name: 'kadin-sneaker.jpg', url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80', category: 'footwear' },
  { name: 'kadin-bot.jpg', url: 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=400&q=80', category: 'footwear' },
  
  // KADIN - BAGS
  { name: 'kadin-mini-canta.jpg', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', category: 'bags' },
  { name: 'kadin-tote.jpg', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80', category: 'bags' },
  { name: 'kadin-crossbody.jpg', url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80', category: 'bags' },
  
  // KADIN - ACCESSORIES
  { name: 'kadin-kupe.jpg', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80', category: 'accessories' },
  { name: 'kadin-gozluk.jpg', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80', category: 'accessories' },
  { name: 'kadin-fular.jpg', url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80', category: 'accessories' },
];

async function downloadImage(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download: ${url}`);
  return response.arrayBuffer();
}

async function uploadToSupabase(name: string, data: ArrayBuffer): Promise<string> {
  const { data: uploadData, error } = await supabase.storage
    .from('garment-images')
    .upload(`samples/${name}`, data, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('garment-images')
    .getPublicUrl(`samples/${name}`);

  return urlData.publicUrl;
}

async function main() {
  console.log('🚀 Örnek görselleri Supabase\'e yüklüyorum...\n');

  const results: { name: string; url: string; category: string }[] = [];

  for (const image of SAMPLE_IMAGES) {
    try {
      console.log(`📥 İndiriliyor: ${image.name}...`);
      const imageData = await downloadImage(image.url);
      
      console.log(`📤 Yükleniyor: ${image.name}...`);
      const publicUrl = await uploadToSupabase(image.name, imageData);
      
      results.push({ name: image.name, url: publicUrl, category: image.category });
      console.log(`✅ Başarılı: ${image.name}\n`);
    } catch (error) {
      console.error(`❌ Hata: ${image.name}`, error);
    }
  }

  console.log('\n📋 Yüklenen Görseller:\n');
  console.log(JSON.stringify(results, null, 2));
  
  console.log('\n\n🎉 Tamamlandı! Yukarıdaki URL\'leri sampleGarments.ts dosyasına kopyalayın.');
}

main().catch(console.error);

