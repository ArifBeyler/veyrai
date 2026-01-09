/**
 * HER ŞEYİ SİL - Sadece male ve female kombinlerini yükle
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

// Erkek kombinleri
const MALE_COMBINES = [
  { local: '034785b196991ffea03e05ce7b021910.jpg', remote: 'male-outfit-1.jpg', title: 'Erkek Kombin 1' },
  { local: '1b39f84acb05f968dd071e84df4e4c3e.jpg', remote: 'male-outfit-2.jpg', title: 'Erkek Kombin 2' },
  { local: 'a3d4ce444608dc1a28eeb86f9f155f2d.jpg', remote: 'male-outfit-3.jpg', title: 'Erkek Kombin 3' },
  { local: 'a649bee229a4d788b51327a15530e282.jpg', remote: 'male-outfit-4.jpg', title: 'Erkek Kombin 4' },
  { local: 'b5b703b25e6713105df0d6a412c89587.jpg', remote: 'male-outfit-5.jpg', title: 'Erkek Kombin 5' },
  { local: 'outfit-2.jpg', remote: 'male-outfit-6.jpg', title: 'Erkek Kombin 6' },
];

// Kadın kombinleri
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
  console.log('🗑️  TÜM VERİLER SİLİNİYOR...\n');
  
  // VERİTABANINI TAMAMEN TEMİZLE
  const { error: deleteError } = await supabase
    .from('sample_garments')
    .delete()
    .gte('id', '00000000-0000-0000-0000-000000000000'); // Tümünü sil
  
  if (deleteError) {
    console.error('DB silme hatası:', deleteError);
  } else {
    console.log('✅ Veritabanı tamamen temizlendi');
  }

  // STORAGE'I TEMİZLE - tüm klasörleri
  const folders = ['combines/male', 'combines/female', 'combines', ''];
  for (const folder of folders) {
    try {
      const { data: files } = await supabase.storage.from('garment-images').list(folder);
      if (files?.length) {
        const filesToDelete = files
          .filter(f => !f.id.includes('/')) // sadece dosyalar
          .map(f => folder ? `${folder}/${f.name}` : f.name);
        if (filesToDelete.length > 0) {
          await supabase.storage.from('garment-images').remove(filesToDelete);
        }
      }
    } catch (e) {}
  }
  console.log('✅ Storage temizlendi\n');

  // ERKEK KOMBİNLERİ YÜKLE
  console.log('👔 ERKEK KOMBİNLERİ YÜKLENİYOR...\n');
  const maleDir = path.join(__dirname, '../assets/images/combines');

  for (let i = 0; i < MALE_COMBINES.length; i++) {
    const item = MALE_COMBINES[i];
    const localPath = path.join(maleDir, item.local);
    
    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️  Bulunamadı: ${item.local}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const storagePath = `combines/male/${item.remote}`;

    await supabase.storage.from('garment-images').upload(storagePath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    await supabase.from('sample_garments').insert({
      title: item.title,
      category: 'onepiece',
      image_path: storagePath,
      gender: 'male',
      tags: ['casual', 'streetwear'],
      sort_order: i + 1,
      is_active: true,
    });

    console.log(`✅ ${item.title}`);
  }

  // KADIN KOMBİNLERİ YÜKLE
  console.log('\n👗 KADIN KOMBİNLERİ YÜKLENİYOR...\n');
  const femaleDir = path.join(__dirname, '../assets/images/combines/female');

  for (let i = 0; i < FEMALE_COMBINES.length; i++) {
    const item = FEMALE_COMBINES[i];
    const localPath = path.join(femaleDir, item.local);
    
    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️  Bulunamadı: ${item.local}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const storagePath = `combines/female/${item.remote}`;
    const ext = path.extname(item.local).toLowerCase();

    await supabase.storage.from('garment-images').upload(storagePath, fileBuffer, {
      contentType: ext === '.png' ? 'image/png' : 'image/jpeg',
      upsert: true,
    });

    await supabase.from('sample_garments').insert({
      title: item.title,
      category: 'onepiece',
      image_path: storagePath,
      gender: 'female',
      tags: ['casual', 'elegant'],
      sort_order: 100 + i + 1,
      is_active: true,
    });

    console.log(`✅ ${item.title}`);
  }

  console.log('\n🎉 TAMAMLANDI!');
  console.log(`📊 Toplam: ${MALE_COMBINES.length} erkek + ${FEMALE_COMBINES.length} kadın = ${MALE_COMBINES.length + FEMALE_COMBINES.length} kombin`);
}

main().catch(console.error);

