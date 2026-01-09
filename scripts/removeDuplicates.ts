import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gclvocafkllnosnbuzvw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbHZvY2Fma2xsbm9zbmJ1enZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ1Njc4MywiZXhwIjoyMDgzMDMyNzgzfQ.wOBEGLjFhguz_SNwR0Ie4gg9ssQ1USzzipa_ebStzkQ'
);

async function main() {
  // Tüm kayıtları listele
  const { data: all } = await supabase
    .from('sample_garments')
    .select('id, title')
    .order('title');
  
  if (!all) return;
  
  console.log(`📋 Toplam ${all.length} kayıt bulundu\n`);
  
  // Duplicate'leri bul ve sil
  const seen = new Map<string, string>();
  let deleted = 0;
  
  for (const item of all) {
    if (seen.has(item.title)) {
      // Bu bir duplicate - sil
      await supabase.from('sample_garments').delete().eq('id', item.id);
      console.log(`❌ Silindi (duplicate): ${item.title}`);
      deleted++;
    } else {
      seen.set(item.title, item.id);
    }
  }
  
  // Sonuç
  const { data: remaining } = await supabase
    .from('sample_garments')
    .select('title, gender')
    .order('sort_order');
  
  console.log(`\n✅ ${deleted} duplicate silindi`);
  console.log(`📊 Kalan: ${remaining?.length || 0} kombin\n`);
  
  remaining?.forEach(r => console.log(`  ✓ ${r.title} (${r.gender})`));
}

main();

