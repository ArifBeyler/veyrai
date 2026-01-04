# GARDROP (Virtual Try-On) — Cursor Context.md

Amaç:
Kullanıcı kendi fotoğrafları + kendi eklediği kıyafet görselleri ile hızlı “dene” (virtual try-on) alabilsin.
Uygulama “Gardrop” ekranı üzerinden kıyafetleri kategorize eder, birden fazla profil (farklı vücut/poz) seçtirir, try-on işini job/queue mantığıyla yapar, bitince bildirim yollar.
Her kullanıcıya 1 adet ücretsiz deneme hakkı verilir. Sonrasında paywall (RevenueCat) gösterilir.

ÖNEMLİ (Hukuk / İçerik Politikası):
- Pinterest / rastgele internet görsellerini katalog olarak uygulamaya kopyalamak “AI gibi duruyor” diye güvenli değildir. Telifli olabilir.
- Uygulama içi “hazır katalog” sadece:
  (a) bizim ürettiğimiz görseller, veya
  (b) lisanslı stok (ticari kullanım + gerektiğinde türev kullanım izni), veya
  (c) affiliate/merchant feed ile açık izin
  üzerinden eklenmelidir.
- Kullanıcı link ekleyebilir ama linkten görsel scrape edip uygulama içinde depolamak lisans gerektirir.
- Admin panelde “license_source” alanı zorunludur (self-generated / licensed / affiliate).

Tech Stack (öneri, hızlı):
- Mobile: React Native (Expo) + TypeScript
- UI: NativeWind veya Tamagui (dark + glassmorphism), haptic feedback, smooth animations
- Backend: Supabase (Auth + Postgres + Storage + Edge Functions)
- Jobs: Supabase Edge Function + queue yaklaşımı (db tablosu ile job state)
- Push: Expo push notifications (token store)
- Paywall: RevenueCat
- AI: Try-on sağlayıcı API (asenkron). Webhook veya polling ile sonuç alma.

Tasarım Dili (ekran görüntüsündeki gibi):
- Dark, soft blur/glass kartla
