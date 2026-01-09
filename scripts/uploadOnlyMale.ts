/**
 * Sadece erkek kombinlerini yükler - tüm diğerlerini siler
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

// Erkek kombinleri (assets/images/combines/ içindeki jpg dosyaları)
const MALE_COMBINES = [
  { local: '034785b196991ffea03e05ce7b021910.jpg', remote: 'male-outfit-1.jpg', title: 'Erkek Kombin 1' },
  { local: '1b39f84acb05f968dd071e84df4e4c3e.jpg', remote: 'male-outfit-2.jpg', title: 'Erkek Kombin 2' },
  { local: 'a3d4ce444608dc1a28eeb86f9f155f2d.jpg', remote: 'male-outfit-3.jpg', title: 'Erkek Kombin 3' },
  { local: 'a649bee229a4d788b51327a15530e282.jpg', remote: 'male-outfit-4.jpg', title: 'Erkek Kombin 4' },
  { local: 'b5b703b25e6713105df0d6a412c89587.jpg', remote: 'male-outfit-5.jpg', title: 'Erkek Kombin 5' },
  { local: 'outfit-2.jpg', remote: 'male-outfit-6.jpg', title: 'Erkek Kombin 6' },
];

async function main() {
  console.log('🗑️  Tüm veriler temizleniyor...\n');
  
  // Veritabanını tamamen temizle
  await supabase.from('sample_garments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Veritabanı temizlendi');

  // Storage'ı temizle
  const { data: maleFiles } = await supabase.storage.from('garment-images').list('combines/male');
  if (maleFiles?.length) {
    await supabase.storage.from('garment-images').remove(maleFiles.map(f => `combines/male/${f.name}`));
  }
  const { data: femaleFiles } = await supabase.storage.from('garment-images').list('combines/female');
  if (femaleFiles?.length) {
    await supabase.storage.from('garment-images').remove(femaleFiles.map(f => `combines/female/${f.name}`));
  }
  console.log('✅ Storage temizlendi\n');

  // Sadece erkek kombinlerini yükle
  console.log('👔 ERKEK KOMBİNLERİ YÜKLENİYOR...\n');
  const baseDir = path.join(__dirname, '../assets/images/combines');

  for (let i = 0; i < MALE_COMBINES.length; i++) {
    const item = MALE_COMBINES[i];
    const localPath = path.join(baseDir, item.local);
    
    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️  Bulunamadı: ${item.local}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const storagePath = `combines/male/${item.remote}`;

    // Upload
    await supabase.storage.from('garment-images').upload(storagePath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    // DB'ye ekle
    await supabase.from('sample_garments').insert({
      title: item.title,
      category: 'onepiece',
      image_path: storagePath,
      gender: 'male',
      tags: ['casual', 'streetwear'],
      sort_order: i + 1,
      is_active: true,
    });

    console.log(`✅ ${item.title} yüklendi`);
  }

  console.log('\n🎉 TAMAMLANDI! Sadece 6 erkek kombini yüklendi.');
}

main().catch(console.error);

