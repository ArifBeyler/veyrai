import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gclvocafkllnosnbuzvw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbHZvY2Fma2xsbm9zbmJ1enZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ1Njc4MywiZXhwIjoyMDgzMDMyNzgzfQ.wOBEGLjFhguz_SNwR0Ie4gg9ssQ1USzzipa_ebStzkQ'
);

async function main() {
  // Önce tüm kayıtları listele
  console.log('📋 Mevcut kayıtlar:\n');
  const { data: all } = await supabase.from('sample_garments').select('title, gender');
  if (all) {
    all.forEach(item => console.log(`  - ${item.title} (${item.gender})`));
  }
  
  // Kalması gereken kayıtlar
  const keepTitles = [
    'Erkek Kombin 1', 'Erkek Kombin 2', 'Erkek Kombin 3', 
    'Erkek Kombin 4', 'Erkek Kombin 5', 'Erkek Kombin 6',
    'Kadın Kombin 1', 'Kadın Kombin 2', 'Kadın Kombin 3',
    'Kadın Kombin 4', 'Kadın Kombin 5', 'Kadın Kombin 6',
    'Kadın Kombin 7', 'Kadın Kombin 8', 'Kadın Kombin 9',
  ];
  
  console.log('\n🗑️  Silinecekler:\n');
  
  // Kalmaması gerekenleri sil
  if (all) {
    for (const item of all) {
      if (!keepTitles.includes(item.title)) {
        await supabase.from('sample_garments').delete().eq('title', item.title);
        console.log(`  ❌ ${item.title} silindi`);
      }
    }
  }
  
  // Sonucu göster
  console.log('\n✅ Kalan kayıtlar:\n');
  const { data: remaining } = await supabase.from('sample_garments').select('title, gender').order('sort_order');
  if (remaining) {
    remaining.forEach(item => console.log(`  ✓ ${item.title} (${item.gender})`));
    console.log(`\n📊 Toplam: ${remaining.length} kombin`);
  }
}

main();

