/**
 * Bu script kadın kombin görsellerini Supabase Storage'a yükler ve veritabanına ekler
 * 
 * Kullanım:
 * npx tsx scripts/uploadFemaleCombines.ts
 * 
 * Not: tsx kullanmak için: npm install -D tsx
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
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbHZvY2Fma2xsbm9zbmJ1enZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NjAzNTYsImV4cCI6MjA4MzAzNjM1Nn0.o_8pnb9nMPE-F4kE4aENblQ5_9uFUhVlQ-swzLv1STs';

// Service role key (Supabase Dashboard > Settings > API > service_role key)
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbHZvY2Fma2xsbm9zbmJ1enZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ1Njc4MywiZXhwIjoyMDgzMDMyNzgzfQ.wOBEGLjFhguz_SNwR0Ie4gg9ssQ1USzzipa_ebStzkQ';

// Key doğrulama
if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === SUPABASE_ANON_KEY) {
  console.error('❌ HATA: Service role key ayarlanmamış!');
  console.error('Lütfen script içindeki SUPABASE_SERVICE_KEY değişkenine service role key\'inizi ekleyin.');
  console.error('Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

// Key format kontrolü (JWT formatında olmalı: 3 bölüm nokta ile ayrılmış)
const keyParts = SUPABASE_SERVICE_KEY.split('.');
if (keyParts.length !== 3) {
  console.error('❌ HATA: Service role key geçersiz format!');
  console.error('Key JWT formatında olmalı (3 bölüm nokta ile ayrılmış)');
  console.error(`Mevcut key uzunluğu: ${SUPABASE_SERVICE_KEY.length} karakter`);
  console.error('Lütfen Supabase Dashboard\'dan doğru service_role key\'ini kopyalayın.');
  process.exit(1);
}

// Key'de "service_role" kontrolü
try {
  const payload = JSON.parse(Buffer.from(keyParts[1], 'base64').toString());
  if (payload.role !== 'service_role') {
    console.error('❌ HATA: Bu key service_role key değil!');
    console.error('Lütfen Supabase Dashboard > Settings > API > service_role key bölümünden key\'i alın.');
    process.exit(1);
  }
} catch (e) {
  console.error('❌ HATA: Service role key parse edilemedi!');
  console.error('Key geçersiz veya bozuk. Lütfen doğru key\'i kullanın.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Yüklenecek dosyalar
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

async function uploadToSupabase(localPath: string, remoteName: string): Promise<string> {
  const fileBuffer = fs.readFileSync(localPath);
  
  // Determine content type
  const ext = path.extname(remoteName).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/jpeg';
  
  const storagePath = `combines/female/${remoteName}`;
  
  const { data, error } = await supabase.storage
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

  console.log(`✅ Uploaded: ${remoteName} -> ${storagePath}`);
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
  const { data: inserted, error } = await supabase
    .from('sample_garments')
    .upsert({
      title: data.title,
      category: data.category,
      image_path: data.image_path,
      gender: data.gender,
      tags: data.tags,
      sort_order: data.sort_order,
      is_active: true,
    }, {
      onConflict: 'title',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error(`❌ Database error for ${data.title}:`, error);
    throw error;
  }

  console.log(`✅ Inserted to DB: ${data.title}`);
  return inserted;
}

async function main() {
  console.log('🚀 Kadın kombinlerini Supabase\'e yüklüyorum...\n');
  
  // Service role key ile bağlantıyı test et
  console.log('🔍 Bağlantı test ediliyor...');
  try {
    const { data: buckets, error: testError } = await supabase.storage.listBuckets();
    if (testError) {
      console.error('❌ Bağlantı hatası:', testError.message);
      console.error('Service role key doğru mu kontrol edin.');
      process.exit(1);
    }
    console.log('✅ Bağlantı başarılı!\n');
  } catch (error: any) {
    console.error('❌ Bağlantı testi başarısız:', error.message);
    process.exit(1);
  }

  const baseDir = path.join(__dirname, '../assets/images/kadın outfit ideas');
  
  try {
    for (let i = 0; i < FEMALE_COMBINES.length; i++) {
      const item = FEMALE_COMBINES[i];
      const localPath = path.join(baseDir, item.local);
      
      if (!fs.existsSync(localPath)) {
        console.warn(`⚠️  Dosya bulunamadı: ${item.local}`);
        continue;
      }

      console.log(`\n📤 Yükleniyor: ${item.local}...`);
      
      // Upload to storage
      const publicUrl = await uploadToSupabase(localPath, item.remote);
      
      // Extract storage path from URL
      const urlMatch = publicUrl.match(/\/storage\/v1\/object\/public\/garment-images\/(.+)$/);
      const storagePath = urlMatch ? urlMatch[1] : `combines/female/${item.remote}`;
      
      // Insert to database (optional - skip if table doesn't exist)
      try {
        await insertSampleGarment({
          title: item.title,
          category: 'onepiece',
          image_path: storagePath,
          gender: 'female',
          tags: item.tags,
          sort_order: i + 1,
        });
      } catch (dbError: any) {
        console.warn(`⚠️  DB eklenemedi (tablo yok olabilir): ${item.title}`);
        console.warn(`   Storage path: ${storagePath}`);
        console.warn(`   Public URL: ${publicUrl}`);
      }
    }

    console.log('\n✅ Tüm kadın kombinler başarıyla yüklendi!');
  } catch (error: any) {
    console.error('\n❌ Hata:', error.message);
    process.exit(1);
  }
}

main();

