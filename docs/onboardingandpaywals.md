# CONTEXT.md — Onboarding + Trial + Paywall Flow (Outfit Try-On / Kombin Üretimi)

Amaç: Uygulama açılışından itibaren kullanıcıyı **en hızlı şekilde “ilk başarılı sonuç” anına** taşımak. Kayıt sürtünmesi minimum. Ücretsiz deneme net. Paywall doğru yerde.

## 0) Ürün Mantığı (Tek Cümle)
Kullanıcı fotoğraf yükler → istediği kıyafet(ler)i seçer → AI “giydirilmiş” sonucu üretir → kullanıcı kaydeder/indirir → ikinci üretimde paywall.

---

## 1) Global Kurallar (Non-Negotiable)
- Onboarding akışı: **Floating Logo → 3 tam ekran onboarding → 1 video ekranı → kayıt → ana akış**
- Kayıt: **email doğrulama / onay maili yok**. Hızlı kayıt + otomatik giriş.
- İlk deneme: her kullanıcıya **1 adet ücretsiz üretim hakkı** (first generation free).
- Paywall tetikleme:
  - Kullanıcı **2. kez üretmek** isterse → paywall.
  - Kullanıcı satın alırsa → **sınırsız kombin üretimi** (unlimited generations).
- Onboarding sırasında kullanıcıdan fotoğraf kırpma isteme (kıyafet full-body olabilir).
- UI: Minimal, premium, “az metin + güçlü görsel” yaklaşımı.
- Her kritik adımda: “geri dönüş” yok, akış net ve tek yönlü (sürtünme yok).
- State yönetimi: Kullanıcının nerede kaldığı (onboarding tamamlandı mı, trial kullanıldı mı, subscriber mı) kalıcı kaydedilecek.

---

## 2) Açılış Akışı

### 2.1 Floating Logo Splash (0.8s–1.5s)
Hedef: Markayı premium hissettirmek + uygulama hazır olana kadar kısa bir geçiş.
- Görsel: Ortada floating logo (hafif blur/ışık/float animasyonu).
- Süre: Minimum 0.8s, maksimum 1.5s.
- Arkada sessiz hazırlık:
  - Session kontrol (logged in mi?)
  - Local flags: `hasSeenOnboarding`, `freeTrialUsed`, `isSubscriber`

Geçiş kuralı:
- `hasSeenOnboarding == false` → Onboarding carousel’e git.
- `hasSeenOnboarding == true`:
  - logged in ise → Home
  - değilse → Auth

---

## 3) Onboarding (3 Tam Ekran + 1 Video)

### 3.1 Onboarding 1 (Full Screen)
Amaç: “Ne işe yarıyor?” 1 cümle.
- Büyük görsel/illustration.
- Kısa başlık + kısa alt metin (maks 2 satır).
- CTA: “Devam”

Örnek mesaj (opsiyonel):
- Başlık: “Kombin denemek artık saniyeler.”
- Alt: “Fotoğrafını yükle, istediğin parçaları seç, sonucu gör.”

### 3.2 Onboarding 2 (Full Screen)
Amaç: “Çoklu parça seçimi” vurgusu (etek, bluz, ayakkabı, çanta… / erkek-kadın).
- Görsel: multi-item stack UI mock.
- Mesaj: “Tek parça değil, komple kombin.”

### 3.3 Onboarding 3 (Full Screen)
Amaç: “Sonuç + Kaydet/Paylaş” vurgusu.
- Görsel: before/after veya result card.
- Mesaj: “Ürettiğin sonucu kaydet, tekrar dene.”

### 3.4 Video Screen (Full Screen)
Amaç: Kullanıcıya “olayı” net anlatmak (senin koyacağın video).
- Otomatik oynat, sessiz başlayabilir, kullanıcı isterse sesi açar.
- Video bitince CTA: “Başlayalım”
- Skip: sağ üst “Geç” (video uzun olursa)

Onboarding bitiş:
- `hasSeenOnboarding = true` set et.
- Sonraki ekran: Auth (kayıt/giriş)

---

## 4) Auth (Kayıt / Giriş) — Sürtünmesiz
Amaç: Kullanıcıyı kaydettirip direkt içeri almak.

### 4.1 Ekran Yapısı
- 2 tab: “Kayıt Ol” / “Giriş Yap”
- Kayıt alanları minimum:
  - Email
  - Şifre
  - (Opsiyonel) Ad / nickname
- “Email doğrulama yok”
- Kayıt tamamlanınca: **otomatik session** + Home’a yönlendir.

### 4.2 Teknik Kural
- Hesap açıldı → kullanıcı direkt authenticated sayılacak.
- Error handling:
  - Email kullanımda → login’e yönlendir + mesaj.
  - Şifre zayıf → inline guideline.

---

## 5) İlk Deneme (Free Trial = 1 Generation)
Amaç: Kullanıcıyı ilk 2 dakika içinde “wow” noktasına sokmak.

### 5.1 Home’da İlk Deneme CTA
Kullanıcı yeni kayıt olduysa Home’da üstte net CTA:
- “İlk kombinin ücretsiz — hemen dene”
- Bu CTA kullanıcı trial’ı kullanana kadar görünür.

### 5.2 Üretim Akışı (Özet)
- Fotoğraf yükle (kırpma isteme)
- Kıyafet seçimi (çoklu)
- “Üret” butonu
- Üretim tamam → Result ekranı

Trial tüketim kuralı:
- İlk başarılı üretim tamamlanınca:
  - `freeTrialUsed = true`
  - `freeTrialRemaining = 0`

Başarısız üretim (model fail vb.) olursa:
- Trial’ı yakma (yani ancak “success” olursa harca).
- Retry butonu ver.

---

## 6) Paywall Mantığı (2. Üretimde)
Amaç: Tam doğru zamanda ücret istemek: kullanıcı değer gördükten sonra.

Paywall tetik:
- Kullanıcı `freeTrialUsed == true` VE `isSubscriber == false` iken “Üret” aksiyonu denediğinde → Paywall aç.

Paywall içeriği:
- Plan: “Unlimited Combos”
- Net vaat: “Sınırsız kombin üretimi + yüksek kalite”
- CTA: “Satın Al”
- Secondary: “Sonra”
- Restore: “Satın alımı geri yükle”
- Güven öğeleri: iptal edilebilir abonelik / tek seferlik (hangi modelse)

Satın alım sonrası:
- `isSubscriber = true`
- Paywall kapanır → kullanıcı kaldığı yerden üretime devam eder.

---

## 7) State / Flags (Persisted)
Aşağıdaki değerler local + backend (opsiyonel) tutulmalı:
- `hasSeenOnboarding: boolean`
- `authState: loggedIn | loggedOut`
- `freeTrialUsed: boolean`
- `freeTrialUsedAt: timestamp` (opsiyonel)
- `isSubscriber: boolean`
- `lastPaywallShownAt: timestamp` (spam önlemek için opsiyonel)

---

## 8) Ekran Listesi (Minimum)
1) SplashFloatingLogo
2) OnboardingCarousel (3 screen)
3) OnboardingVideo
4) Auth (Register/Login)
5) Home (CTA + entry points)
6) PhotoUpload
7) ItemSelection (çoklu seçim)
8) GenerationLoading
9) Result (save/share + “Yeni üret”)
10) Paywall
11) Settings (Restore purchases, account, vs.)

---

## 9) Mikro UX Kuralları (Kalite Detayları)
- Animasyonlar:
  - Splash: logo float + fade
  - Onboarding: yatay swipe + page indicator
  - Paywall: alttan sheet veya full screen (premium hissi)
- Loading:
  - “Üretiliyor” sırasında progress hissi (fake progress bar olabilir)
  - İptal butonu opsiyonel (ama kullanıcıyı yormasın)
- Result ekranı:
  - En büyük aksiyon: “Kaydet”
  - İkincil: “Yeni üret”
  - Trial bittiyse “Yeni üret” tıklanınca paywall.

---

## 10) Acceptance Criteria (Bu akış tamamlanmış sayılması için)
- Uygulama ilk açılışta: Splash → onboarding → video → auth → home çalışıyor.
- Kayıt sonrası doğrulama beklemeden direkt login oluyor.
- 1. üretim ücretsiz ve başarıyla sonuç veriyor.
- 2. üretim denemesinde subscriber değilse paywall açılıyor.
- Satın alım sonrası sınırsız üretim aktif oluyor ve paywall bir daha engel olmuyor.
- Flags doğru saklanıyor ve app restart’ta akış bozulmuyor.
