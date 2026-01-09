/**
 * Bu script erkek kombin görsellerini Supabase Storage'a yükler ve veritabanına ekler
 * 
 * Kullanım:
 * npx ts-node scripts/uploadMaleCombines.ts
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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Yüklenecek dosyalar
const MALE_COMBINES = [
  { local: '034785b196991ffea03e05ce7b021910.jpg', remote: 'male-outfit-1.jpg', title: 'Erkek Kombin 1', tags: ['casual', 'streetwear'] },
  { local: '1b39f84acb05f968dd071e84df4e4c3e.jpg', remote: 'male-outfit-2.jpg', title: 'Erkek Kombin 2', tags: ['casual', 'streetwear'] },
  { local: 'a3d4ce444608dc1a28eeb86f9f155f2d.jpg', remote: 'male-outfit-3.jpg', title: 'Erkek Kombin 3', tags: ['casual', 'streetwear'] },
  { local: 'a649bee229a4d788b51327a15530e282.jpg', remote: 'male-outfit-4.jpg', title: 'Erkek Kombin 4', tags: ['casual', 'streetwear'] },
  { local: 'b5b703b25e6713105df0d6a412c89587.jpg', remote: 'male-outfit-5.jpg', title: 'Erkek Kombin 5', tags: ['casual', 'streetwear'] },
  { local: 'outfit 2.jpg', remote: 'male-outfit-6.jpg', title: 'Erkek Kombin 6', tags: ['elegant', 'formal'] },
];

async function uploadToSupabase(localPath: string, remoteName: string): Promise<string> {
  const fileBuffer = fs.readFileSync(localPath);
  
  // Determine content type
  const ext = path.extname(remoteName).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/jpeg';
  
  const storagePath = `combines/male/${remoteName}`;
  
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
  console.log('🚀 Erkek kombinlerini Supabase\'e yüklüyorum...\n');

  const baseDir = path.join(__dirname, '../assets/Combine');
  
  try {
    for (let i = 0; i < MALE_COMBINES.length; i++) {
      const item = MALE_COMBINES[i];
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
      const storagePath = urlMatch ? urlMatch[1] : `combines/male/${item.remote}`;
      
      // Insert to database
      await insertSampleGarment({
        title: item.title,
        category: 'onepiece',
        image_path: storagePath,
        gender: 'male',
        tags: item.tags,
        sort_order: i + 1,
      });
    }

    console.log('\n✅ Tüm erkek kombinler başarıyla yüklendi!');
  } catch (error: any) {
    console.error('\n❌ Hata:', error.message);
    process.exit(1);
  }
}

main();

