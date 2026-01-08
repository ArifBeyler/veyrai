/**
 * Bu script erkek kombin görsellerini Supabase Storage'a yükler
 * 
 * Kullanım:
 * npx ts-node scripts/uploadCombines.ts
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

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Yüklenecek kombin dosyaları
const COMBINE_FILES = [
  { local: '034785b196991ffea03e05ce7b021910.jpg', remote: '034785b196991ffea03e05ce7b021910.jpg' },
  { local: '1b39f84acb05f968dd071e84df4e4c3e.jpg', remote: '1b39f84acb05f968dd071e84df4e4c3e.jpg' },
  { local: 'a3d4ce444608dc1a28eeb86f9f155f2d.jpg', remote: 'a3d4ce444608dc1a28eeb86f9f155f2d.jpg' },
  { local: 'a649bee229a4d788b51327a15530e282.jpg', remote: 'a649bee229a4d788b51327a15530e282.jpg' },
  { local: 'b5b703b25e6713105df0d6a412c89587.jpg', remote: 'b5b703b25e6713105df0d6a412c89587.jpg' },
  { local: 'outfit 2.jpg', remote: 'outfit-2.jpg' }, // Boşluk yerine tire
];

async function uploadToSupabase(localPath: string, remoteName: string): Promise<string> {
  const fileBuffer = fs.readFileSync(localPath);
  
  const { data, error } = await supabase.storage
    .from('garment-images')
    .upload(`combines/${remoteName}`, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('garment-images')
    .getPublicUrl(`combines/${remoteName}`);

  return urlData.publicUrl;
}

async function main() {
  console.log('🚀 Erkek kombinlerini Supabase\'e yüklüyorum...\n');

  const combineDir = path.join(__dirname, '..', 'assets', 'Combine');
  
  // Klasör var mı kontrol et
  if (!fs.existsSync(combineDir)) {
    console.error(`❌ Klasör bulunamadı: ${combineDir}`);
    return;
  }

  const results: { name: string; url: string }[] = [];

  for (const file of COMBINE_FILES) {
    const localPath = path.join(combineDir, file.local);
    
    if (!fs.existsSync(localPath)) {
      console.error(`❌ Dosya bulunamadı: ${localPath}`);
      continue;
    }

    try {
      console.log(`📤 Yükleniyor: ${file.local} -> ${file.remote}...`);
      const publicUrl = await uploadToSupabase(localPath, file.remote);
      
      results.push({ name: file.remote, url: publicUrl });
      console.log(`✅ Başarılı: ${file.remote}`);
      console.log(`   URL: ${publicUrl}\n`);
    } catch (error) {
      console.error(`❌ Hata: ${file.local}`, error);
    }
  }

  console.log('\n📋 Yüklenen Görseller:\n');
  console.log(JSON.stringify(results, null, 2));
  
  console.log('\n\n🎉 Tamamlandı!');
}

main().catch(console.error);
