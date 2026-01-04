# FIT-SWAP (çalışma adı) — Cursor context.md (iOS)
Amaç: Kullanıcı kendi fotoğraflarını yükler, ürün (kıyafet/aksesuar) seçer ve “tek tıkla” AI ile giydirilmiş görsel üretir. Her kullanıcıya 1 ücretsiz deneme (1 kredi). Sonraki denemede paywall + abonelik/coin.

================================================================================
0) ÜRÜN TANIMI (tek cümle)
Kendi fotoğrafını + seçtiğin ürünü al → aynı ışık/poz korunarak “üzerimde nasıl durur?” görselini üret.

================================================================================
1) MVP KAPSAMI (ilk sürümün net sınırları)
MVP’de yalnızca:
- Kullanıcı fotoğraf seti (3 poz önerilir) yükleme / çekme
- Ürün ekleme:
  - (A) Uygulama içi katalog (Supabase’ten çekilen ürün görselleri)
  - (B) Kullanıcı ürün görseli yükler (link ile scraping YOK; MVP’de link sadece metadata için saklanır)
- 1 ürün + 1 kullanıcı fotoğrafı seç → Generate
- Sonuç galerisi (save/share/HD export kilidi)
- 1 ücretsiz kredi / kullanıcı
- Paywall (RevenueCat) + abonelik

MVP’de yok:
- Otomatik e-ticaret scraping
- Video try-on
- Multi-garment layering (opsiyonel: top+bottom 2 parça, ama riskli)
- Beden ölçüsü “gerçekçi ölçüm” iddiası (hukuki/sorumluluk riski)

================================================================================
2) TEMEL KULLANICI AKIŞI (UX)
A) İlk açılış
1) Splash (0.8–1.2s) → Welcome
2) Welcome: “Kendi fotoğrafınla dene.” + CTA: “Başla”
3) Onboarding (etkileşimli, 3 adım):
   - Adım 1: Fotoğraf çek/yükle (rehber overlay + örnek)
   - Adım 2: Tercihler (stil, arka plan, çıktı kalitesi)
   - Adım 3: “1 ücretsiz denemen var” (net anlat) → “İlk denemeni yap”
4) Home/Create

B) Üretim
1) Kullanıcı fotoğrafı seç (varsayılan: en son kullanılan)
2) Ürün seç (katalogdan / upload)
3) “Generate” → Progress ekranı (durumlar)
4) Sonuç → Galeriye kaydet + share/save

C) Monetizasyon
- İlk üretim: ÜCRETSİZ (1 kredi)
- İkinci üretim: Paywall (abonelik veya coin)
- HD export, watermark kaldırma, “4 varyasyon üret” gibi özellikler premium.

================================================================================
3) KREDİ / DENEME POLİTİKASI (kritik)
Hedef: “1 free credit” suistimalini minimize et.
- Kullanıcı login zorunlu değil (friction düşür), ama premium aşamasında Sign in with Apple öner.
- Ücretsiz kredi takibi:
  - local: Keychain’de `free_credit_used=true`
  - server: Supabase `device_fingerprint_hash` + `app_attest`/`devicecheck` ile eşleştir (MVP’de basit hash yeter, sonra App Attest eklenir)
- Kural: `free_credit_used` true ise generate isteği paywall_required döner (abonelik yoksa).

================================================================================
4) AI ÜRETİM MİMARİSİ (sağlam + ölçeklenebilir)
Prensip: İstemci (iOS) ağır iş yapmaz, sadece upload + job başlatır + durum izler.

Pipeline:
1) Client:
   - UserPhoto ve Garment görsellerini Supabase Storage’a yükler
   - `POST /functions/v1/create-generation` çağırır
2) Edge Function:
   - Auth / credit check (free veya premium)
   - Generation row oluşturur (status=queued)
   - 3rd-party AI API (fal/eachlabs/wiro/...) job başlatır
   - Provider job id kaydeder
   - status=processing
3) Tamamlama:
   - (A) Webhook destekleniyorsa: provider → `provider-webhook` → status=completed + output url
   - (B) Yoksa: polling worker (cron) → status update
4) Output:
   - Son görsel Supabase Storage’a alınır (kalıcılık + CDN)
   - DB: output_path, thumbnail_path, seed, params

Hata yönetimi:
- status=failed, error_code, error_message (kullanıcıya sade)
- retry: premium için 1 retry hakkı opsiyonel

================================================================================
5) GÜVENLİK / İÇERİK POLİTİKASI (uygulama ölmemesi için)
- Kullanıcıdan açık rıza: “Fotoğraflarını bu sonucu üretmek için işleriz.”
- Face-preserve: Kullanıcının yüzünü koru, kimlik değiştirme yok (MVP)
- NSFW filtre:
  - Upload aşamasında basic nudity check (provider veya 3rd-party moderation)
  - Output için de check (özellikle uygunsuz içerik)
- Telif: Kullanıcının yüklediği ürün görsellerinin sorumluluğu kullanıcıya aittir (ToS maddesi).

================================================================================
6) TASARIM SİSTEMİ (iOS premium “liquid glass”, senin paylaştığın nav dili)
Genel hissiyat:
- Minimal, çok temiz, bol boşluk
- “Frosted / glass” yüzeyler (blur)
- Keskin değil: radius + soft shadow
- Metin az, ikon ve görsel odak

Tipografi:
- iOS: SF Pro (System)
- Başlık: SF Pro Display Semibold
- Body: SF Pro Text Regular/Medium
- Harf aralığı default, uppercase minimum

Grid / spacing:
- 4pt grid
- Sayfa padding: 16
- Kart radius: 18
- Buton radius: 16
- Bottom bar pill radius: 22–26
- Shadow: düşük opaklık, geniş blur

Renk:
- Background: #0B0B0C (near-black) veya #F6F6F7 (light) — tema seçilebilir
- Surface glass: blur + 0.10–0.18 white overlay
- Stroke: 1px, 0.10–0.16 opacity
- Accent: tek vurgu rengi (ör: soft lime / soft blue) — abartma
NOT: İkonlarda metin yok. Accessibility label var.

Safe Area kuralları:
- Tüm ana ekranlarda Safe Area zorunlu
- Bottom bar: safe area inset + 10–14px ekstra padding
- Floating “+” butonu safe area ile çakışmayacak

================================================================================
7) BOTTOM NAV (paylaştığın örnek gibi, ama labelsız)
Yapı:
- Alt tarafta “glass pill” container (blur)
- İçinde 3–4 ikon (labels görünmez)
- Sağ üstte (pill’in sağında) büyük “+” (floating) ayrı bir yuvarlak buton

Önerilen ikonlar:
- Home (house)
- Wardrobe / Catalog (tshirt)
- Gallery (sparkles/photo stack)
- Profile (user)
- + (create)

Not:
- Görselde label yok ama erişilebilirlik için `accessibilityLabel` set edilecek.

Animasyon:
- Tab değişiminde: icon scale 0.92→1.0 + hafif haptic
- Create (+) açılışında: sheet yukarı “spring” ile gelir, arka plan blur artar
- Scroll down: bottom nav 8–12px aşağı kayıp opacity düşer (content’e odak)

================================================================================
8) ONBOARDING (etkileşimli ve “tek seferde ikna” odaklı)
Onboarding tasarım hedefi: Kullanıcıya 30 saniyede “wow” yaşat.
Ekran 1 — Fotoğraf Rehberi (interactive)
- Kamera preview (veya örnek video loop)
- Overlay: omuz hizası, yüz çerçevesi
- “3 poz çek” mini progress (1/3, 2/3, 3/3)
- Mikro animasyon: doğru hizalanınca yeşil glow + haptic

Ekran 2 — Stil Tercihi
- 6 adet style chip (Minimal, Street, Old Money, Techwear, Casual, Formal)
- Arka plan tercihi: “Orijinal arka planı koru” / “Stüdyo”
- Çıktı: “Normal” (free) / “HD” (premium)

Ekran 3 — Ücretsiz Deneme
- Büyük kart: “1 ÜCRETSİZ DENEME”
- “Ne alacağım?” → 3 bullet, kısa
- CTA: “İlk denemeni yap”
- Arka planda: örnek before/after hızlı crossfade (metinsiz)

================================================================================
9) ANA EKRANLAR (Screen list + davranış)
(1) Home
- Hero card: “Yeni deneme” → Create flow
- Son 3 sonuç thumbnail (gallery preview)
- “Ürün ekle” / “Fotoğraf setin” kısa kartları

(2) Create (Modal / Sheet)
Adımlar:
- Step A: Model fotoğrafı seç (grid)
- Step B: Ürün seç (katalog veya upload)
- Step C: Prompt opsiyonel (kısa) + “Generate”
UX:
- Stepper UI
- Generate butonu disabled until requirements met
- “1 free credit” badge (kredi bitince hidden)

(3) Progress (Generation)
- Durum satırları:
  - Uploading…
  - Preparing…
  - Rendering…
  - Finishing…
- Skeleton preview + shimmer
- İptal: (queued/processing) iptal edilebilir (provider destekliyorsa)

(4) Result
- Fullscreen viewer
- Actions: Save, Share, Regenerate (premium), HD Export (premium)
- “Before/After” toggle (orijinal foto vs sonuç)

(5) Gallery
- Grid
- Filter: “Bugün / Son 7 gün”
- Item detail: prompt/ürün kaynağı/metadata

(6) Wardrobe / Catalog
- Kategori chips (tops, pants, shoes, accessories)
- Ürün detail: image + link + “Denemede kullan”

(7) Profile
- Free credit durumu
- Subscription status (RevenueCat)
- Privacy / Data delete request
- Fotoğraf yönetimi (sil)

================================================================================
10) ANİMASYON / HAPTIC (unutma dediğin kısım)
Kullan:
- React Native Reanimated + Gesture Handler
- Haptics: Expo Haptics (light on selection, success on completed)
Animasyon ilkeleri:
- 180–240ms micro transitions
- Spring: damping orta, overshoot minimal
- Loading: shimmer + progress steps (yüzde göstermeden “akış”)

Özel animasyonlar:
- Onboarding fotoğraf hizalama: doğru hizada “snap” + soft glow
- Generate basınca: buton morph → progress pill
- Sonuç geldiğinde: blurred background → netleşme + small confetti (çok minimal)

================================================================================
11) TEKNOLOJİ YIĞINI (iOS-only ama hızlı geliştirme)
Frontend:
- Expo (React Native, TypeScript)
- expo-router
- react-native-reanimated
- expo-blur (glass UI)
- expo-haptics
- react-native-skia (opsiyonel: premium UI detayları)
- Zustand (state)
- TanStack Query (server state)

Backend:
- Supabase (Auth, Postgres, Storage, Edge Functions)
- RevenueCat (abonelik + entitlement)
- AI Provider abstraction: fal.ai / eachlabs / wiroAI / custom
  - Tek bir “ProviderAdapter” interface yaz, provider değişebilir.

Build:
- EAS Build (iOS)
- Environment: .env + EAS secrets

================================================================================
12) VERİ MODELİ (minimum, ama üretim için yeterli)
Tablolar:
- users (supabase auth user)
  - id, created_at
  - has_premium (derived), last_active_at
- devices
  - id (uuid), user_id nullable, device_hash unique, free_used boolean, created_at
- user_photos
  - id, user_id/device_id, storage_path, kind (front/side/angle), created_at
- garments
  - id, created_by (admin/user), title, category, brand, source_url, image_path, created_at
- generations
  - id, user_id/device_id
  - user_photo_id, garment_id
  - status (queued|processing|completed|failed)
  - provider, provider_job_id
  - params_json (style, bg, etc)
  - output_path, thumb_path
  - error_code, error_message
  - created_at, completed_at
- entitlements_cache (opsiyonel)
  - user_id, is_active, expires_at, last_checked_at

Storage buckets:
- user-photos (private)
- garments (public or signed)
- generations (private; share/export için signed url)

RLS:
- user_photos: sadece owner
- generations: sadece owner
- garments: public read (admin write)

================================================================================
13) EDGE FUNCTIONS (API kontratları)
1) create-generation
Input:
- device_hash
- user_photo_id
- garment_id
- params { style, backgroundMode, quality }
Output:
- { generation_id, status } OR { paywall_required: true }

Logic:
- check entitlement via RevenueCat webhook cache OR client token (MVP: client checks + server trusts basic)
- if not premium:
  - if devices.free_used true → paywall_required
  - else mark free_used=true (transaction)
- create generations row
- kick provider job (adapter)
- return generation_id

2) get-generation-status
- generation_id → status + output signed url if completed

3) provider-webhook (opsiyonel)
- verify signature
- update generation status + store output

4) rc-webhook (RevenueCat)
- update entitlements_cache

================================================================================
14) AI PROMPT ŞABLONU (metin opsiyonel, ama sonuç kalitesi için lazım)
Not: Kullanıcı prompt alanı opsiyonel; default template her zaman çalışmalı.

Base template (server-side):
- “Use the provided person photo. Preserve identity, face, pose, body proportions.”
- “Apply the provided garment onto the person realistically.”
- “Match lighting and shadows to the original photo.”
- “Do not change background unless backgroundMode=studio.”
- “High detail fabric folds, realistic fit, no text, no logos added, no watermark.”
- “Avoid altering age, gender, ethnicity. Keep natural skin texture.”

Parametrik:
- style: minimal/street/formal/techwear -> küçük “aesthetic” yönlendirmesi
- quality: normal/hd -> upscale toggle

================================================================================
15) PAYWALL STRATEJİSİ (kullanıcıyı boğmadan)
Trigger:
- İkinci generate attempt → paywall
- HD export attempt → paywall
Paywall içeriği:
- “Sınırsız deneme” veya “Aylık X deneme”
- “HD export” + “4 varyasyon” + “öncelikli sıra”
UI:
- full-screen modal, glass background
- 2 plan: Monthly / Yearly
- close butonu: ilk 2 saniye hidden (conversion), sonra görünür

================================================================================
16) UI KALİTE KURALLARI (Cursor’un asla çiğnememesi gerekenler)
- Her ekranda safe area
- Her kartta stroke + soft shadow (hard drop yok)
- Blur yüzeylerde contrast test (metin okunur)
- İkonlar labelsız ama:
  - accessibilityLabel şart
  - tooltip yok (iOS native değil)
- Loading durumları: skeleton + shimmer, boş ekran yok
- Hata mesajları: kısa, çözüm odaklı (“Tekrar dene”, “Fotoğrafı değiştir”)
- Tüm görseller: cache + progressive load
- Scroll performansı: FlatList optimizasyonu

================================================================================
17) PROJE KLASÖR YAPISI (Cursor için net)
/app (expo-router)
  /(tabs)
    home.tsx
    wardrobe.tsx
    gallery.tsx
    profile.tsx
  /create
    index.tsx (sheet stepper)
  /generation
    [id].tsx (progress + result)
  onboarding.tsx
  welcome.tsx

/src
  /ui (design system)
    GlassPill.tsx
    GlassCard.tsx
    IconButton.tsx
    PrimaryButton.tsx
    BottomNav.tsx
    Typography.ts
    spacing.ts
  /services
    supabase.ts
    revenuecat.ts
    generationApi.ts
    upload.ts
  /state
    useSessionStore.ts
  /utils
    deviceHash.ts
    signedUrl.ts
    validators.ts

/supabase
  /functions
    create-generation
    get-generation-status
    provider-webhook (optional)
    revenuecat-webhook (optional)

================================================================================
18) UYGULAMA DAVRANIŞI (detaylar)
- App ilk açılışta:
  - device_hash üret + keychain’e yaz
  - anon session başlat (login yok)
- Fotoğraf yükleme:
  - max 10MB, jpg/png
  - upload öncesi client-side resize (1080–1440px uzun kenar)
- Üretim başlat:
  - network fail → kullanıcıyı create ekranına geri atma, retry sun
- Bildirim (opsiyonel):
  - generation completed → local push (MVP’de opsiyonel)
- Offline:
  - galeriyi göster, generate disable

================================================================================
19) TEST SENARYOLARI (release öncesi)
- İlk kullanıcı: onboarding → 1 free generate → completed
- İkinci generate: paywall
- Premium: sınırsız generate
- Upload fail: retry
- Provider fail: failed status + kullanıcıya yönlendirme
- RLS: başka kullanıcının foto/sonuçlarına erişememe
- Safe area: tüm cihazlar (notch, dynamic island, SE)

================================================================================
20) CURSOR’A İŞ EMRİ (bu repo sıfırdan ayağa kalksın)
Sıra:
1) Expo + expo-router + TS kurulumu
2) Design system (GlassCard, GlassPill, BottomNav)
3) Welcome + Onboarding (3 adım)
4) Supabase client + storage upload
5) Create flow (photo select + garment select)
6) Edge function create-generation (stub provider)
7) Progress screen (poll status)
8) Result + Gallery
9) RevenueCat paywall entegrasyonu
10) Polish: animasyonlar + haptics + skeleton

Provider entegrasyonu:
- İlk etap “MockProvider” ile fake output üret (UX test)
- Sonra gerçek provider adapter ekle

================================================================================
ENV VARS (EAS Secrets)
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (edge function secret)
- AI_PROVIDER_API_KEY
- REVENUECAT_API_KEY
- REVENUECAT_WEBHOOK_SECRET

================================================================================
BİTTİ.
Bu dosya Cursor için tek kaynak gerçek: UI kuralları, akış, mimari, monetizasyon ve animasyonlar burada.
