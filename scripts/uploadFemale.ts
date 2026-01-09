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

// Kadın kombinleri (assets/images/combines/female/ içindeki dosyalar)
const FEMALE_COMBINES = [
  { local: 'female-outfit-1.png', remote: 'female-outfit-1.png', title: 'Kadın Kombin 1' },
  { local: 'female-outfit-2.jpg', remote: 'female-outfit-2.jpg', title: 'Kadın Kombin 2' },
  { local: 'female-outfit-3.png', remote: 'female-outfit-3.png', title: 'Kadın Kombin 3' },
  { local: 'female-outfit-4.png', remote: 'female-outfit-4.png', title: 'Kadın Kombin 4' },
  { local: 'female-outfit-5.png', remote: 'female-outfit-5.png', title: 'Kadın Kombin 5' },
  { local: 'female-outfit-6.png', remote: 'female-outfit-6.png', title: 'Kadın Kombin 6' },
  { local: 'female-outfit-7.png', remote: 'female-outfit-7.png', title: 'Kadın Kombin 7' },
  { local: 'female-outfit-8.png', remote: 'female-outfit-8.png', title: 'Kadın Kombin 8' },
  { local: 'female-outfit-9.png', remote: 'female-outfit-9.png', title: 'Kadın Kombin 9' },
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

  console.log('\n🎉 TAMAMLANDI! 9 kadın kombini yüklendi.');
}

main().catch(console.error);

