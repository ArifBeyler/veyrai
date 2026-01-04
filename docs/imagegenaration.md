# Gardrop + Try-On (Replicate / google/nano-banana) – Cursor Context

Amaç:
- Kullanıcı 1. ekranda “Profil” oluşturur ve kendi fotoğrafını yükler.
- 2. ekranda “Kıyafet Kaynağı” seçer: (A) Gardroptan seç, (B) Galeriden yükle.
- Sistem 2. fotoğraftaki kişinin giydiği kıyafetleri, 1. fotoğraftaki kişiye “giydirilmiş” şekilde üretir.
- Kullanıcı ayrıca “Arka plan” modunu seçer:
  1) Referanstaki gibi (2. fotoğraftaki arka plan/poz/ışık korunmaya çalışılır)
  2) Rastgele poz (kullanıcının 1. fotoğrafı vesikalık olabilir; bu mod daha toleranslı davranır)

Model / API:
- Replicate “google/nano-banana” kullanılacak.
- Model input’ları: prompt (string), image_input (array), output_format (default jpg). (Kaynak: Replicate model schema) :contentReference[oaicite:0]{index=0}
- Replicate “prediction” mantığıyla çalışır: async (default) veya sync (Prefer: wait) seçenekleri var. :contentReference[oaicite:1]{index=1}
- Replicate API token sadece server-side tutulacak (Supabase secrets/env). Authorization: Bearer token. :contentReference[oaicite:2]{index=2}

KRİTİK: Output URL süreleri / veri tutma
- Replicate output file URL’leri `replicate.delivery` üzerinden gelir ve yaklaşık 1 saat içinde expire olur; dosyayı hemen kendi storage’ına kopyalamak zorunlu. :contentReference[oaicite:3]{index=3}
- API ile oluşturulan prediction’ların input/output/log verileri varsayılan olarak 1 saat sonra otomatik kaldırılır. :contentReference[oaicite:4]{index=4}
=> Bu yüzden “replicate output’u anında Supabase Storage’a çek” akışı zorunlu.

UI Akışı (Onboarding’a girmeden sadece bu feature için):
1) Screen: ProfileCreate
   - Alanlar: profile_name (opsiyonel), profile_photo (zorunlu).
   - Foto yüklenince profile kaydı aç, Supabase Storage’a koy.
   - Kullanıcı “Devam” deyince TryOn ekranına geç.

2) Screen: TryOnSelectOutfit
   - Kullanıcıya iki seçenek:
     A) Gardroptan seç (daha önce eklenmiş görseller listesi; filtrelenebilir)
     B) Galeriden yükle (referans outfit fotoğrafı)
   - Galeriden yüklerse:
     - “Bu ürün ne?” sor (multi-select): Üst, Ceket, Pantolon, Ayakkabı, Bere, Aksesuar vb.
     - Bu seçimler gardrop filtrelerinde görünsün.
   - Arka plan modu seçimi:
     - “Referanstaki gibi” (pose/background match)
     - “Rastgele poz” (pose/background new)

3) Action: GenerateTryOn
   - “job” oluştur, state: queued → running → succeeded/failed
   - UI’da: progress + bildirim izni varsa “hazır olunca haber ver”

Backend Mimari (Supabase odaklı):
A) Supabase Storage bucket’ları
- `profile_photos/`
- `wardrobe_items/` (kullanıcının özel yükledikleri)
- `catalog_items/` (admin panelden yüklenen public gardrop)
- `tryon_results/` (üretilen çıktılar)

B) Supabase DB tabloları (minimum şema)
1) profiles
- id (uuid)
- user_id
- name
- photo_path (storage path)
- created_at

2) wardrobe_items
- id
- user_id (null olabilir: public catalog item)
- source_type: "user_upload" | "admin_catalog"
- image_path
- garment_tags (array: ["jacket","pants",...])
- created_at

3) tryon_jobs
- id
- user_id
- profile_id
- outfit_item_id (nullable) + outfit_image_path (nullable)
- background_mode: "match_reference" | "random_pose"
- status: queued/running/succeeded/failed
- replicate_prediction_id (string)
- result_image_path (storage path)
- error_message
- created_at, updated_at

4) user_devices (bildirim için)
- user_id
- expo_push_token / apns token vb.
- created_at

Prompt Stratejisi (nano-banana için)
- `image_input` iki görsel:
  1) profile photo (hedef kişi)
  2) outfit reference (kıyafet kaynağı)
- prompt, iki moda göre farklı:

(1) background_mode = match_reference
- “Kişi 1’in yüz kimliğini ve vücut oranlarını koru. Görsel 2’deki kıyafetleri (renk, doku, desen, katman, aksesuar) birebir giydir. Pozu, kadrajı, ışığı ve arka planı mümkün olduğunca görsel 2’ye benzet. Foto-gerçekçi, doğal cilt tonu, anatomiyi bozma. Yazı/logo ekleme.”

(2) background_mode = random_pose
- “Kişi 1’in yüz kimliğini koru, kıyafetleri görsel 2’den birebir giydir. Pozu doğal bir şekilde yeniden oluştur (tam boy veya bel üstü; profile foto türüne göre adapte ol). Arka plan: temiz/stüdyo veya doğal bir mekân; görsel kalitesi yüksek; yazı/logo/watermark yok; foto-gerçekçi.”

Kalite / Sağlamlık önlemleri
- Görsel doğrulama: çok düşük çözünürlük / aşırı bulanık / yüz yoksa kullanıcıya uyarı.
- Job dedupe: aynı (profile_id + outfit_id + mode) için kısa süre içinde tekrar istek gelirse reuse.
- Timeout + retry: replicate job stuck olursa fail + kullanıcıya “yeniden dene”.
- Rate limit: kullanıcı başına concurrency limiti (örn 1-2 job aynı anda).
- Output saklama: Replicate URL’lerine güvenme; her sonucu Supabase’e kopyala. :contentReference[oaicite:7]{index=7}

Teslim Beklentisi (Cursor’dan istenecek)
- Supabase: tablolar + storage bucket’ları + RLS + gerekli index’ler
- Edge Functions:
  1) create_tryon_prediction (job alır, replicate prediction başlatır)
  2) replicate_webhook_handler (tamamlanınca output’u indirip storage’a koyar)
- App tarafı: 2 ekran + job status UI + notification flow (token kaydetme)
- Prompt builder: mode’a göre prompt şablonları + guardrail metinleri
- Model versiyon pinleme: Prod’da belirli bir model version’ına pinlenmesi önerilir (davranış drift’ini azaltır). :contentReference[oaicite:8]{index=8}
