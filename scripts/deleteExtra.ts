import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gclvocafkllnosnbuzvw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbHZvY2Fma2xsbm9zbmJ1enZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ1Njc4MywiZXhwIjoyMDgzMDMyNzgzfQ.wOBEGLjFhguz_SNwR0Ie4gg9ssQ1USzzipa_ebStzkQ'
);

async function main() {
  const toDelete = ['Kadın Kombin 10', 'Kadın Kombin 11', 'Erkek Kombin 7', 'Erkek Kombin 8'];
  
  for (const title of toDelete) {
    const { error } = await supabase.from('sample_garments').delete().eq('title', title);
    console.log(error ? `❌ ${title} - ${error.message}` : `✅ ${title} silindi`);
  }
  
  console.log('\n🎉 Tamamlandı!');
}

main();

