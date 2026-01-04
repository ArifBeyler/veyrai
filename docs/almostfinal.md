# Gardrop Try-On (Replicate • Google Banana Pro / “nano-banana”) — Kapsamlı Context

Durum:
- Uygulama çalışıyor, “profil fotoğrafı + kıyafet referansı fotoğrafı” ile başarılı try-on alabiliyoruz.
- Şimdi hedef: kaliteyi sistematik hale getirmek, UI akışını iyileştirmek, selfie/eksik kadraj durumlarını “şablon (pose template)” ile çözmek, bekleme ekranlarını daha iyi yapmak ve üretim adımlarını daha kontrollü yönetmek.

Bu context; Cursor’un:
1) Kural listesi + kalite guardrail’leri,
2) Üretim pipeline’ı,
3) Supabase altyapısı (DB/Storage/RLS + job yönetimi),
4) UI/UX akışları + animasyonlar + metinler,
5) Şablon (pose) seçimi + prompt entegrasyonu
kısımlarını eksiksiz uygulamasını ister.

---

## 1) Temel Ürün Mantığı (2 Görsel → 1 Sonuç)

Kullanıcı akışı (MVP):
1) Profil fotoğrafı seç (kullanıcının kendi fotoğrafı)
2) Kıyafet fotoğrafı seç (gardroptan veya galeriden)
3) Ek seçenekler:
   - “Bu fotoğraftaki tüm kıyafetleri istiyor musun?” (Evet/Hayır)
   - “Arka plan / poz modu”:
     A) Referanstaki gibi (kıyafet fotoğrafındaki poz/arka planı hedefle)
     B) Rastgele / Şablon ile poz (selfie gibi eksik kadrajda şablon seçtir)
4) “Oluştur”
5) 20–30 sn bekleme ekranı (durum mesajları)
6) Sonuç hazır → “Tamam” → sonuç ekranı

Önemli:
- Kullanıcıdan kırpma istemiyoruz. (Kırpma zorunlu değil.)
- “Tüm kıyafetleri istiyor musun?” seçimi; prompt’un ne kadar agresif “full outfit transfer” yapacağını belirleyecek.

---

## 2) Kalite Kuralları (Guardrails) — Çıktıyı Stabil Tutmak

### 2.1 Profil Fotoğrafı (Kişi Fotoğrafı) için kurallar
- Tercih: iyi ışık, net odak, yüz görünür, gövde oranları bozulmamış.
- Arka plan sade olursa daha iyi ama zorunlu değil.
- Selfie olabilir:
  - Selfie ise “poz/şablon” önerisi gösterilmeli (aşağıda).
- Aşırı karanlık, aşırı bulanık, çok düşük çözünürlük:
  - “Daha iyi sonuç için fotoğrafı yenile” uyarısı.

### 2.2 Kıyafet Referansı Fotoğrafı için kurallar
- Kıyafetlerin katmanları net: ceket + iç gömlek + pantolon gibi.
- Çok karmaşık desenler olabilir ama modelin “doku/pattern” koruma başarısı değişebilir.
- Ürün fotoğrafı “insan üstünde” olursa daha iyi (senin örnekteki gibi).
- “Flat-lay” (zemine serilmiş) fotoğraf desteklenebilir ama kalite düşebilir. (MVP’de öncelik: insan üstünde kıyafet.)

### 2.3 “Tüm kıyafetleri istiyor musun?” seçeneği
- Evet:
  - Referans görseldeki üst/alt/ayakkabı/aksesuar dahil hepsini aktarmaya çalış.
  - Pantolon/ayakkabı kadrajda yoksa, model halüsinasyon yapabilir → selfie durumunda şablon öner.
- Hayır:
  - Kullanıcıya “hangi parçalar?” seçtirebiliriz (v2). MVP’de: sadece “üst” veya “üst+alt” gibi 2 basit seçenek yeterli.

### 2.4 Arka Plan / Poz Modları
A) “Referanstaki gibi üret”
- Kıyafet fotoğrafındaki poz + kadraj + ışık + arka plan benzer tutulmaya çalışılır.
- Kişi kimliği (profil foto) korunurken, sahne referansa yaklaşır.

B) “Şablon / Rastgele poz”
- Kullanıcı selfie yüklediyse, tam boy üretmek için “pose template” seçtirilir.
- Şablon; arka plan + kadraj + poz + ışık rehberi sağlar.
- Bu modda arka plan referanstan gelmez; şablondan gelir.

---

## 3) Şablon (Pose Template) Sistemi — Selfie/eksik kadraj çözümü

Amaç:
- Profil fotoğrafı tam boy değilse (selfie, bel üstü, vb.) kullanıcıya “En iyi sonuçlar için şablon seç” uyarısı göster.
- Kullanıcı seçerse, üretimde 3. görsel olarak “template image” de modele verilir.

UI:
- Profil foto seçildikten sonra otomatik analiz:
  - “Tam boy mu?” heuristik (basit): insan bounding box oranı / ayaklar görünür mü / yüz çok yakın mı.
- Eğer tam boy değilse:
  - Modal: “En iyi sonuçlar için şablon seçmek ister misin?”
  - Seçenekler: (liste/karusel)
    - Studio full-body (düz fon)
    - Street full-body
    - Mirror selfie style
    - Sitting pose
    - Oversize fit pose
    - Minimal background
- Kullanıcı “Atla” diyebilir.

Model input:
- image_inputs:
  1) profil foto
  2) kıyafet referansı
  3) (opsiyonel) template image

Not:
- Şablon seçilirse “random_pose” yerine “template_pose” olarak işaretlenmeli.

---

## 4) Prompt Mantığı (Banana Pro) — Üretim Stratejisi

Prompt üretimi “mod” bazlı olmalı:
- MODE_1: FULL_OUTFIT_TRANSFER (kullanıcı tüm kıyafetleri ister)
- MODE_2: PARTIAL_TRANSFER (v2, şimdilik opsiyon)
- BG_MODE: MATCH_REFERENCE / TEMPLATE_POSE / RANDOM_POSE

Prompt genel kuralları:
- Kimlik koru: “profil fotoğraftaki kişinin yüz kimliği ve cilt tonu korunmalı”
- Kıyafet koru: “referans görseldeki kıyafetlerin renk/doku/desen/katman/fit” korunmalı
- Anatomi koru: “eller/kol/omuz bozulmasın”
- Yazı/Logo yok: “metin, watermark, logo üretme”
- Fotoğraf gerçekçiliği: “photorealistic, high detail, natural lighting”
- Kıyafet referansındaki marka yazılarını mümkünse yok say (güvenli).

MODE: MATCH_REFERENCE (referanstaki gibi)
- Poz/kadraj/ışık/arka plan referansla benzer.

MODE: TEMPLATE_POSE
- Şablonun kadraj/poz/arka planını hedefle, kıyafet referansını o pozda uygula.

MODE: RANDOM_POSE
- Doğal tam boy üret (selfie ise bel üstü üretmek daha güvenli olabilir; şablon öner).

---

## 5) UI/UX Revizyonları (Senin İsteklerin)

### 5.1 Profil seçme ekranı
- Boy/kilo gibi alanları kaldır (profil artık “foto temelli profil”).
- “Profil ekle” butonuna basınca:
  - Kamera / Galeri seçimi
  - Foto seçilince: kart animasyonla “seçili” duruma geçsin
  - Devam butonu ancak seçili profil varsa aktifleşsin.
- Animasyon:
  - Foto seçimi sonrası kart “flip + scale-in” (yumuşak) veya “slide-up + fade” ile seçili state’e geçsin.
  - Seçili profil kartına subtle glow + lime stroke.

### 5.2 Üretim öncesi ekran (senin 4. görseldeki gibi “iki küçük kutu” problemi)
Hedef:
- Daha estetik, daha “premium”.
Önerilen düzen:
- Üstte büyük başlık + kısa açıklama.
- Ortada iki büyük kart (Profil / Kıyafet) — daha büyük thumbnail, daha az boş alan.
- Kartların altında küçük “değiştir” aksiyonu.
- Arada tek bir minimal “spark” ikon.
- Alt bölümde “Oluştur” CTA (tam okunaklı) + kredi bilgisi.

Okunabilirlik:
- “Oluştur” buton metni ve alt yazılar kontrastı artırılmalı:
  - Buton text: net, yüksek kontrast.
  - Glass blur üstüne metin geliyorsa, metnin arkasına çok hafif solid layer ekle.

### 5.3 “Oluştur” sonrası bekleme ekranı (20–30 sn)
Akış:
- Kullanıcı “Oluştur” basınca:
  1) “Fotoğraflar geçici olarak kopyalanıyor…” (0–2 sn)
  2) “Fotoğraflar kopyalandı ✅” (kısa)
  3) “Gardrop hazırlanıyor…” (2–4 sn)
  4) “Kıyafet uygulanıyor…” (devam)
  5) “Son rötuşlar…” (devam)
- Bu mesajlar job state ile uyumlu olmalı ama aynı zamanda “random mesaj serisi” ile zenginleşebilir.

Mesaj havuzu (random, araya mizahi):
- “Kumaş fiziği simüle ediliyor… (şaka değil)”
- “Düğmeler ikna ediliyor…”
- “Kombin evrenle hizalanıyor…”
- “Işık ayarı: sinematik mod”
- “Birazdan hazır. Kahveni kap gel.”

Kurallar:
- Mizah dozu düşük/orta; her kullanıcıya aynı mesajlar dönmesin.
- Mesajlar kısa, tek satır.
- Ekranda ayrıca progress göstergesi: 3–5 nokta veya ince progress bar.

Sonuç gelince:
- Ekranda “Hazır 🎉” + büyük “Tamam” butonu.
- “Tamam” → Result screen.

---

## 6) Supabase Altyapısı — DB/Storage/Job Yönetimi (yüksek seviye)

### 6.1 Storage bucket’ları
- profile_photos (private)
- wardrobe_items (private/public karma — admin katalog ayrı)
- pose_templates (public read, admin write)  ← şablon görselleri burada
- tryon_results (private)

Not:
- Replicate çıktısı geçici olabilir → sonuç mutlaka tryon_results’a kaydedilecek.

### 6.2 DB tabloları (minimum)
1) profiles
- id, user_id, name, photo_path, created_at

2) wardrobe_items
- id, user_id (null = admin item), image_path, category, tags[], created_at

3) pose_templates
- id, title, image_path, tags[], created_at
- category mapping: “t-shirt”, “ceket”, “pantolon” vb. (senin verdiğin Zara benzeri kategori listesiyle uyumlu)

4) tryon_jobs
- id, user_id
- profile_id
- outfit_source: "wardrobe" | "gallery"
- outfit_item_id (nullable)
- outfit_image_path (nullable)
- template_id (nullable)
- want_full_outfit (bool)
- bg_mode: "match_reference" | "template_pose" | "random_pose"
- status: queued/running/succeeded/failed
- replicate_prediction_id
- result_image_path
- error_message
- created_at, updated_at

### 6.3 RLS
- profiles, wardrobe_items (user upload), tryon_jobs: user only own rows.
- admin katalog (user_id null) + templates: read for all, write admin only.

### 6.4 Job orchestration
- Client “job create” yapar → server-side Replicate prediction başlar.
- Status güncellemeleri:
  - queued → running → succeeded/failed
- succeeded olunca result_image_path set edilir.
- UI polling veya realtime subscription ile bekleme ekranı beslenir.

---

## 7) Kategori / Şablon Entegrasyonu (Zara benzeri)

Senin kategorilerin (örnek):
- Kazak/Triko
- Sweatshirt
- Gömlek
- İnce Ceket
- T-shirt
- Polo T-shirt
- Pantolon
- Jean

Kurallar:
- Her kategori için:
  - 5–20 adet pose template (stüdyo, sokak, minimal varyasyonlar)
  - 10–50 adet “admin wardrobe reference” (opsiyonel; telif riskine girmeden lisanslı veya kendi ürettiğin görseller)
- Kullanıcı bir kıyafet referansı seçince:
  - kategori otomatik tahmin (v2) veya kullanıcı seçimi (şimdilik kullanıcı seçsin).
  - kategoriye göre şablon önerileri filtrelenir.

---

## 8) Ekran Metinleri (Okunaklı + Kısa)

- “Hazır!” alt metni: “Seçimlerini kontrol et ve başlat”
- “Oluştur” butonu: net, tek kelime.
- “Geri” butonu: her ekranda görünür.
- “Tüm kıyafetleri mi istiyorsun?”:
  - Evet: “Fotoğraftaki tüm kombin (üst/alt/ayakkabı) aktarılır.”
  - Hayır: “Sadece üst kısmı aktar.” (MVP’de basitleştirilebilir)

Uyarı (selfie ise):
- “Bu fotoğraf tam boy görünmüyor. En iyi sonuç için şablon seçebilirsin.”

---

## 9) Acceptance Criteria (Cursor bununla bitti sayacak)

1) Kullanıcı profil foto seçer, kırpma zorunlu değildir.
2) Kıyafet kaynağı: gardrop seçimi veya galeri upload.
3) “Tüm kıyafetleri ister misin?” seçeneği prompt’a etki eder.
4) Profil foto tam boy değilse şablon önerisi çıkar; seçerse template üretime dahil olur.
5) Üretim öncesi ekran daha estetik: büyük kartlar, okunaklı CTA.
6) “Oluştur” sonrası bekleme ekranı 20–30 sn: durum mesajları + progress.
7) Sonuç gelince “Tamam” ile sonuç ekranına geçilir.
8) Supabase: jobs, templates, storage akışı stabil; job status UI’ya doğru yansır.
9) Sonuç görseli Supabase Storage’a kaydedilir ve history’de görünür.

---

## 10) Notlar (ürün kalitesi için gerçekçi sınırlar)
- Referans kıyafetteki “çok ince detay” (minik yazılar, logo) her zaman korunmaz; hedef “stil + renk + katman + fit”.
- Selfie → tam boy üretmek risklidir; bu yüzden şablon sistemi kritik.
- “Full outfit transfer” en zor mod; ilk etapta kalite düşerse:
  - Kullanıcıya “Sadece üst” seçeneğini default öner (v2).

Bitti.
