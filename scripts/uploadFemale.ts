/**
 * Kadın kombinlerini yükler (erkeklere ekler)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://gclvocafkllnosnbuzvw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbHZvY2Fma2xsbm9zbmJ1enZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ1Njc4MywiZXhwIjoyMDgzMDMyNzgzfQ.wOBEGLjFhguz_SNwR0Ie4gg9ssQ1USzzipa_ebStzkQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Kadın kombinleri (assets/images/combines/female/ içindeki TÜM dosyalar)
const FEMALE_COMBINES = [
  // Temel outfit'ler (1-9)
  { local: 'female-outfit-1.png', remote: 'female-outfit-1.png', title: 'Female Outfit 1' },
  { local: 'female-outfit-2.jpg', remote: 'female-outfit-2.jpg', title: 'Female Outfit 2' },
  { local: 'female-outfit-3.png', remote: 'female-outfit-3.png', title: 'Female Outfit 3' },
  { local: 'female-outfit-4.png', remote: 'female-outfit-4.png', title: 'Female Outfit 4' },
  { local: 'female-outfit-5.png', remote: 'female-outfit-5.png', title: 'Female Outfit 5' },
  { local: 'female-outfit-6.png', remote: 'female-outfit-6.png', title: 'Female Outfit 6' },
  { local: 'female-outfit-7.png', remote: 'female-outfit-7.png', title: 'Female Outfit 7' },
  { local: 'female-outfit-8.png', remote: 'female-outfit-8.png', title: 'Female Outfit 8' },
  { local: 'female-outfit-9.png', remote: 'female-outfit-9.png', title: 'Female Outfit 9' },
  // Ek kombinler
  { local: '00e646e68b9f4550586f9b52b5177a3d.jpg', remote: '00e646e68b9f4550586f9b52b5177a3d.jpg', title: 'Female Outfit 10' },
  { local: '03046312500-p.jpg', remote: '03046312500-p.jpg', title: 'Female Outfit 11' },
  { local: '03046389600-p.jpg', remote: '03046389600-p.jpg', title: 'Female Outfit 12' },
  { local: '04d381e7a12ad1f24eeb1639dd94062f.jpg', remote: '04d381e7a12ad1f24eeb1639dd94062f.jpg', title: 'Female Outfit 13' },
  { local: '134bab4b62a7d9990770d5c8212458a1.jpg', remote: '134bab4b62a7d9990770d5c8212458a1.jpg', title: 'Female Outfit 14' },
  { local: '27b11e9ad4a5c914d40365b82ec7776e.jpg', remote: '27b11e9ad4a5c914d40365b82ec7776e.jpg', title: 'Female Outfit 15' },
  { local: '295ccb2641f5cd5e1262c009899cd844.jpg', remote: '295ccb2641f5cd5e1262c009899cd844.jpg', title: 'Female Outfit 16' },
  { local: '4aad39624b4dac3a99b905ba2252919c.jpg', remote: '4aad39624b4dac3a99b905ba2252919c.jpg', title: 'Female Outfit 17' },
  { local: '56869c66f7915f78a8eb1adf57acb321.jpg', remote: '56869c66f7915f78a8eb1adf57acb321.jpg', title: 'Female Outfit 18' },
  { local: '60934af5e9cb442c129d39947dac7aa1.jpg', remote: '60934af5e9cb442c129d39947dac7aa1.jpg', title: 'Female Outfit 19' },
  { local: '6812b7202d76ebb975a23732af8bd399.jpg', remote: '6812b7202d76ebb975a23732af8bd399.jpg', title: 'Female Outfit 20' },
  { local: '6bdddc3a1081edfcfbe6e6aaea72df2c.jpg', remote: '6bdddc3a1081edfcfbe6e6aaea72df2c.jpg', title: 'Female Outfit 21' },
  { local: '70f262731db5398076d324601b9a5068.jpg', remote: '70f262731db5398076d324601b9a5068.jpg', title: 'Female Outfit 22' },
  { local: 'a072d4d0fbc826eaf3a2b3becf28bcb1.jpg', remote: 'a072d4d0fbc826eaf3a2b3becf28bcb1.jpg', title: 'Female Outfit 23' },
  { local: 'ed3ff803e77d722d29078ede9f4fcdf9.jpg', remote: 'ed3ff803e77d722d29078ede9f4fcdf9.jpg', title: 'Female Outfit 24' },
];

async function main() {
  console.log('👗 KADIN KOMBİNLERİ YÜKLENİYOR...\n');
  
  // Önce eski female dosyalarını temizle
  const { data: oldFiles } = await supabase.storage.from('garment-images').list('combines/female');
  if (oldFiles?.length) {
    await supabase.storage.from('garment-images').remove(oldFiles.map(f => `combines/female/${f.name}`));
    console.log('✅ Eski kadın dosyaları temizlendi');
  }

  // Eski kadın kayıtlarını sil
  await supabase.from('sample_garments').delete().eq('gender', 'female');
  console.log('✅ Eski kadın kayıtları silindi\n');

  const baseDir = path.join(__dirname, '../assets/images/combines/female');

  for (let i = 0; i < FEMALE_COMBINES.length; i++) {
    const item = FEMALE_COMBINES[i];
    const localPath = path.join(baseDir, item.local);
    
    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️  Bulunamadı: ${item.local}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const storagePath = `combines/female/${item.remote}`;
    const ext = path.extname(item.local).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

    // Upload
    await supabase.storage.from('garment-images').upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

    // DB'ye ekle
    await supabase.from('sample_garments').insert({
      title: item.title,
      category: 'onepiece',
      image_path: storagePath,
      gender: 'female',
      tags: ['casual', 'elegant'],
      sort_order: 100 + i + 1, // Erkeklerden sonra gelsin
      is_active: true,
    });

    console.log(`✅ ${item.title} yüklendi`);
  }

  console.log(`\n🎉 TAMAMLANDI! ${FEMALE_COMBINES.length} kadın kombini yüklendi.`);
}

main().catch(console.error);

