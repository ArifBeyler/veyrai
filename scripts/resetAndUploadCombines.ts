/**
 * Bu script tüm kombinleri siler ve sadece belirtilen klasörlerden yükler:
 * - assets/images/combines/ → Erkek kıyafetleri
 * - assets/images/kadın outfit ideas/ → Kadın kıyafetleri
 * 
 * Kullanım:
 * npx tsx scripts/resetAndUploadCombines.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM uyumlu __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase credentials
const SUPABASE_URL = 'https://gclvocafkllnosnbuzvw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbHZvY2Fma2xsbm9zbmJ1enZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ1Njc4MywiZXhwIjoyMDgzMDMyNzgzfQ.wOBEGLjFhguz_SNwR0Ie4gg9ssQ1USzzipa_ebStzkQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Erkek kombinleri (assets/images/combines/)
const MALE_COMBINES = [
  { local: '034785b196991ffea03e05ce7b021910.jpg', remote: 'male-outfit-1.jpg', title: 'Erkek Kombin 1', tags: ['casual', 'streetwear'] },
  { local: '1b39f84acb05f968dd071e84df4e4c3e.jpg', remote: 'male-outfit-2.jpg', title: 'Erkek Kombin 2', tags: ['casual', 'streetwear'] },
  { local: 'a3d4ce444608dc1a28eeb86f9f155f2d.jpg', remote: 'male-outfit-3.jpg', title: 'Erkek Kombin 3', tags: ['casual', 'streetwear'] },
  { local: 'a649bee229a4d788b51327a15530e282.jpg', remote: 'male-outfit-4.jpg', title: 'Erkek Kombin 4', tags: ['casual', 'streetwear'] },
  { local: 'b5b703b25e6713105df0d6a412c89587.jpg', remote: 'male-outfit-5.jpg', title: 'Erkek Kombin 5', tags: ['casual', 'streetwear'] },
  { local: 'outfit-2.jpg', remote: 'male-outfit-6.jpg', title: 'Erkek Kombin 6', tags: ['elegant', 'formal'] },
];

// Kadın kombinleri (assets/images/kadın outfit ideas/)
const FEMALE_COMBINES = [
  { local: 'Gemini_Generated_Image_y390rny390rny390.png', remote: 'female-outfit-1.png', title: 'Kadın Kombin 1', tags: ['casual', 'streetwear'] },
  { local: 'aa013bbf-0860-4264-bb0d-704b10168477.jpeg', remote: 'female-outfit-2.jpg', title: 'Kadın Kombin 2', tags: ['elegant', 'formal'] },
  { local: 'Gemini_Generated_Image_vo4qhyvo4qhyvo4q.png', remote: 'female-outfit-3.png', title: 'Kadın Kombin 3', tags: ['casual', 'boho'] },
  { local: 'Gemini_Generated_Image_n8l9nnn8l9nnn8l9.png', remote: 'female-outfit-4.png', title: 'Kadın Kombin 4', tags: ['elegant', 'minimal'] },
  { local: 'Gemini_Generated_Image_k47wl3k47wl3k47w.png', remote: 'female-outfit-5.png', title: 'Kadın Kombin 5', tags: ['casual', 'streetwear'] },
  { local: 'Gemini_Generated_Image_h06sybh06sybh06s (1).png', remote: 'female-outfit-6.png', title: 'Kadın Kombin 6', tags: ['elegant', 'formal'] },
  { local: 'Gemini_Generated_Image_ekm8rqekm8rqekm8 (1).png', remote: 'female-outfit-7.png', title: 'Kadın Kombin 7', tags: ['casual', 'summer'] },
  { local: 'Gemini_Generated_Image_aiqeytaiqeytaiqe.png', remote: 'female-outfit-8.png', title: 'Kadın Kombin 8', tags: ['elegant', 'minimal'] },
  { local: 'Gemini_Generated_Image_4epdql4epdql4epd (1).png', remote: 'female-outfit-9.png', title: 'Kadın Kombin 9', tags: ['casual', 'boho'] },
  { local: '03046312500-p.jpg', remote: 'female-outfit-10.jpg', title: 'Kadın Kombin 10', tags: ['elegant', 'minimal'] },
  { local: '03046389600-p.jpg', remote: 'female-outfit-11.jpg', title: 'Kadın Kombin 11', tags: ['casual', 'boho'] },
];

async function clearAllData() {
  console.log('🗑️  Mevcut tüm kombinler siliniyor...\n');
  
  // Veritabanından tüm kayıtları sil
  const { error: dbError } = await supabase
    .from('sample_garments')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Tümünü sil
  
  if (dbError) {
    console.error('❌ Veritabanı temizleme hatası:', dbError);
  } else {
    console.log('✅ Veritabanı temizlendi');
  }

  // Storage'dan combines klasörünü temizle
  try {
    const { data: maleFiles } = await supabase.storage
      .from('garment-images')
      .list('combines/male');
    
    if (maleFiles && maleFiles.length > 0) {
      const filesToDelete = maleFiles.map(f => `combines/male/${f.name}`);
      await supabase.storage.from('garment-images').remove(filesToDelete);
      console.log(`✅ Storage male klasörü temizlendi (${maleFiles.length} dosya)`);
    }

    const { data: femaleFiles } = await supabase.storage
      .from('garment-images')
      .list('combines/female');
    
    if (femaleFiles && femaleFiles.length > 0) {
      const filesToDelete = femaleFiles.map(f => `combines/female/${f.name}`);
      await supabase.storage.from('garment-images').remove(filesToDelete);
      console.log(`✅ Storage female klasörü temizlendi (${femaleFiles.length} dosya)`);
    }
  } catch (error) {
    console.warn('⚠️  Storage temizleme atlandı');
  }

  console.log('');
}

async function uploadToSupabase(localPath: string, remoteName: string, gender: 'male' | 'female'): Promise<string> {
  const fileBuffer = fs.readFileSync(localPath);
  
  const ext = path.extname(remoteName).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
  
  const storagePath = `combines/${gender}/${remoteName}`;
  
  const { error } = await supabase.storage
    .from('garment-images')
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error(`❌ Upload error for ${remoteName}:`, error);
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from('garment-images')
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}

async function insertSampleGarment(data: {
  title: string;
  category: string;
  image_path: string;
  gender: string;
  tags: string[];
  sort_order: number;
}) {
  const { error } = await supabase
    .from('sample_garments')
    .insert({
      title: data.title,
      category: data.category,
      image_path: data.image_path,
      gender: data.gender,
      tags: data.tags,
      sort_order: data.sort_order,
      is_active: true,
    });

  if (error) {
    console.error(`❌ Database error for ${data.title}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Kombin sıfırlama ve yükleme başlıyor...\n');
  
  // Önce her şeyi temizle
  await clearAllData();

  let sortOrder = 1;

  // Erkek kombinlerini yükle
  console.log('👔 ERKEK KOMBİNLERİ YÜKLENİYOR...\n');
  const maleDir = path.join(__dirname, '../assets/images/combines');
  
  for (const item of MALE_COMBINES) {
    const localPath = path.join(maleDir, item.local);
    
    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️  Dosya bulunamadı: ${item.local}`);
      continue;
    }

    console.log(`📤 ${item.title}...`);
    
    const publicUrl = await uploadToSupabase(localPath, item.remote, 'male');
    const storagePath = `combines/male/${item.remote}`;
    
    await insertSampleGarment({
      title: item.title,
      category: 'onepiece',
      image_path: storagePath,
      gender: 'male',
      tags: item.tags,
      sort_order: sortOrder++,
    });
    
    console.log(`✅ ${item.title} yüklendi`);
  }

  console.log('\n👗 KADIN KOMBİNLERİ YÜKLENİYOR...\n');
  const femaleDir = path.join(__dirname, '../assets/images/kadın outfit ideas');
  
  for (const item of FEMALE_COMBINES) {
    const localPath = path.join(femaleDir, item.local);
    
    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️  Dosya bulunamadı: ${item.local}`);
      continue;
    }

    console.log(`📤 ${item.title}...`);
    
    const publicUrl = await uploadToSupabase(localPath, item.remote, 'female');
    const storagePath = `combines/female/${item.remote}`;
    
    await insertSampleGarment({
      title: item.title,
      category: 'onepiece',
      image_path: storagePath,
      gender: 'female',
      tags: item.tags,
      sort_order: sortOrder++,
    });
    
    console.log(`✅ ${item.title} yüklendi`);
  }

  console.log('\n🎉 TAMAMLANDI!');
  console.log(`📊 Toplam: ${MALE_COMBINES.length} erkek + ${FEMALE_COMBINES.length} kadın = ${MALE_COMBINES.length + FEMALE_COMBINES.length} kombin`);
}

main().catch(console.error);

