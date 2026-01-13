# App Store Connect - Detaylı Kontrol Listesi

## 🔍 EKSİK KALANLAR - Kontrol Edilecekler

### 1️⃣ App Store Connect > My Apps > Wearify

#### App Information (Genel Bilgiler)
- [ ] **Name**: Wearify
- [ ] **Primary Language**: Turkish (Türkçe) veya English
- [ ] **Bundle ID**: `com.wearify.app` (zaten var, kontrol et)
- [ ] **SKU**: Wearify-001 (veya başka bir SKU)
- [ ] **User Access**: Full Access veya App Manager

#### Pricing and Availability
- [ ] **Price**: Free (Ücretsiz)
- [ ] **Availability**: Tüm ülkeler seçili mi?

---

### 2️⃣ App Store > Version 1.0.0 (Eğer oluşturulmadıysa oluştur)

#### Screenshots (EN ÖNEMLİ - EKSİK!)
- [ ] **iPhone 6.5" Display** (iPhone 14 Pro Max, 15 Pro Max)
  - En az 3 screenshot yükle
  - Maksimum 10 screenshot
  - 1290 x 2796 piksel (portrait)
  
- [ ] **iPhone 5.5" Display** (iPhone 8 Plus)
  - En az 3 screenshot yükle
  - Maksimum 10 screenshot
  - 1242 x 2208 piksel (portrait)

**Screenshot İçerik Önerileri:**
1. Ana ekran + "1 Ücretsiz Deneme" mesajı
2. Create/Generate ekranı
3. Before/After sonuç örneği
4. Galeri ekranı
5. Wardrobe/Katalog ekranı

#### Preview Video (Opsiyonel ama önerilir)
- [ ] 15-30 saniyelik preview video
- [ ] iPhone 6.5" boyutunda

#### App Preview (Promosyon Metni)
- [ ] 170 karakter limiti
- [ ] Metin: "1 ücretsiz deneme ile başla! AI teknolojisiyle kıyafetleri üzerinde nasıl görüneceğini keşfet."

#### Description (Açıklama)
- [ ] 4000 karakter limiti
- [ ] `docs/app-store-metadata.md` dosyasındaki açıklamayı kopyala-yapıştır

#### Keywords
- [ ] 100 karakter limiti
- [ ] Metin: `AI,fashion,outfit,virtual try-on,clothing,style,photo,visualization,generate,wardrobe`

#### Support URL
- [ ] Destek URL'si ekle (ör: `https://yourdomain.com/support`)

#### Marketing URL (Opsiyonel)
- [ ] Web sitesi URL'si

#### Promotional Text (Promosyon Metni - 170 karakter)
- [ ] "1 ücretsiz deneme ile başla! AI teknolojisiyle kıyafetleri üzerinde nasıl görüneceğini keşfet."

---

### 3️⃣ App Privacy (Gizlilik - KRİTİK!)

#### Privacy Policy URL (ZORUNLU!)
- [ ] Privacy Policy URL'si eklenmiş mi?
- [ ] URL çalışıyor mu?
- [ ] Privacy Policy sayfasında şunlar var mı?
  - Veri toplama bilgisi
  - Fotoğraf kullanımı açıklaması
  - AI işleme bilgisi
  - Veri silme hakkı

#### Data Collection Types
- [ ] **Photos or Videos** - Seçili mi?
  - Purpose: App Functionality
  - Linked to User: Yes
  - Used for Tracking: No
  
- [ ] **User ID** (Eğer kullanıcı girişi varsa)
  - Purpose: App Functionality
  - Linked to User: Yes
  - Used for Tracking: No

---

### 4️⃣ App Store Connect > In-App Purchases

#### Subscription Ürünleri Kontrolü:
- [ ] **Monthly Subscription** (`monthly` veya benzeri Product ID)
  - Price: $9.99/ay (veya TRY eşdeğeri)
  - Display Name: "Wearify Pro - Monthly"
  - Description: "Aylık 40 kredi ile sınırsız AI görsel üretimi"
  - Duration: 1 Month
  - Status: Ready to Submit

- [ ] **Yearly Subscription** (Opsiyonel)
  - Price: $59.99-$79.99/yıl
  - Display Name: "Wearify Pro - Yearly"
  - Description: "Yıllık abonelik ile tasarruf edin"
  - Duration: 1 Year
  - Status: Ready to Submit

#### Consumable/Non-Consumable Ürünleri:
- [ ] **10 Credits Pack**
  - Product ID: `credits_10` (RevenueCat ile eşleşmeli)
  - Price: $3.99
  - Type: Consumable
  - Display Name: "10 Credits"
  - Description: "10 adet AI görsel üretimi için kredi paketi"
  - Status: Ready to Submit

- [ ] **25 Credits Pack**
  - Product ID: `credits_25`
  - Price: $7.99
  - Type: Consumable
  - Display Name: "25 Credits"
  - Description: "25 adet AI görsel üretimi için kredi paketi"
  - Status: Ready to Submit

- [ ] **60 Credits Pack**
  - Product ID: `credits_60`
  - Price: $14.99
  - Type: Consumable
  - Display Name: "60 Credits"
  - Description: "60 adet AI görsel üretimi için kredi paketi"
  - Status: Ready to Submit

**ÖNEMLİ**: Product ID'ler RevenueCat Dashboard'daki Product ID'lerle tam olarak eşleşmeli!

---

### 5️⃣ Version Information

#### What's New in This Version
- [ ] 1.0.0 için "What's New" metni:
  ```
  İlk sürüm! Wearify ile AI destekli sanal deneme deneyimini keşfedin.
  - 1 ücretsiz deneme hakkı
  - Kolay kullanım
  - Kişisel galeri
  ```

#### Review Information
- [ ] **First Name**: (İsminiz)
- [ ] **Last Name**: (Soyadınız)
- [ ] **Phone Number**: (+90 XXX XXX XX XX)
- [ ] **Email**: (İletişim email'iniz)

#### Demo Account (Eğer gerekirse)
- [ ] Test kullanıcı bilgileri (email/şifre)
- [ ] Not: "Ücretsiz deneme 1 kere kullanılabilir"

#### Notes
- [ ] Review Notes metni:
  ```
  Wearify, AI destekli bir görselleştirme aracıdır.
  Kullanıcılar fotoğraflarını yükleyip kıyafetleri sanal olarak deneyebilir.
  Sonuçlar değişkenlik gösterebilir ve ilham amaçlıdır.
  Ücretsiz deneme 1 kere kullanılabilir.
  ```

---

### 6️⃣ Build Section

#### Build Seçimi
- [ ] Version 1.0.0 için build seçilmiş mi?
- [ ] TestFlight'tan build seçildi mi?
- [ ] Build status: "Ready to Submit" mi?

**Eğer build yoksa:**
1. EAS Build ile production build al
2. TestFlight'a yükle
3. Build işlenmesini bekle (~15-30 dakika)
4. Bu sayfadan build'i seç

---

### 7️⃣ App Store Review Information

#### Advertising Identifier (IDFA)
- [ ] App içinde reklam gösteriyor musunuz?
- [ ] Eğer hayırsa, gerekli checkbox'ları işaretle

#### Export Compliance
- [ ] **Does your app use encryption?**: NO
- [ ] `ITSAppUsesNonExemptEncryption: false` app.json'da zaten var ✅

#### Content Rights
- [ ] Tüm içeriklerin haklarının size ait olduğunu onaylıyorum ✅

---

### 8️⃣ Age Rating

#### Age Rating Information
- [ ] Yaş sınırı seçilmiş mi?
- [ ] Öneri: **4+** (Unrestricted Web Access olmadığı için)
- [ ] Veya **12+** (Eğer kullanıcı içeriği varsa)

---

### 9️⃣ App Category

#### Primary Category
- [ ] **Lifestyle** (Önerilen)
- [ ] Veya **Photo & Video**

#### Secondary Category (Opsiyonel)
- [ ] **Entertainment**
- [ ] Veya **Shopping**

---

### 🔟 Pricing

#### Price Schedule
- [ ] **Price**: Free (Ücretsiz)
- [ ] **Available**: All countries

---

## ✅ Submit for Review Öncesi Final Kontrol

### Teknik Kontroller:
- [x] Bundle ID doğru: `com.wearify.app`
- [x] Version: `1.0.0`
- [ ] Build seçilmiş ve hazır
- [ ] Screenshots yüklenmiş (6.5" ve 5.5")
- [ ] Açıklama yazılmış
- [ ] Keywords eklenmiş
- [ ] Privacy Policy URL eklenmiş
- [ ] In-App Purchase ürünleri hazır

### Metadata Kontrolleri:
- [ ] Apple kurallarına uygun (yasak kelimeler yok)
- [ ] AI kullanımı açıkça belirtilmiş
- [ ] Gerçekçilik garantisi VERİLMEMİŞ
- [ ] "Mükemmel", "garantili" gibi ifadeler YOK

### İçerik Kontrolleri:
- [ ] Screenshot'larda uygulama özellikleri net görünüyor
- [ ] Açıklamada kullanım amacı net
- [ ] Privacy Policy erişilebilir ve tamam

### RevenueCat Kontrolleri:
- [ ] Production API Key güncellendi
- [ ] Product ID'ler App Store Connect ile eşleşiyor
- [ ] Entitlement ID doğru: `wearify Pro`

---

## 🚨 EN ÖNEMLİ EKSİKLER (ÖNCELİK SIRASI)

1. **Screenshots** ⚠️⚠️⚠️
   - iPhone 6.5" ve 5.5" screenshot'ları YOK
   - Bu olmadan review'a gönderilemez!

2. **Privacy Policy URL** ⚠️⚠️
   - Zorunlu alan, eklenmeli

3. **App Store Açıklaması** ⚠️
   - Metadata dosyasında hazır, kopyala-yapıştır yap

4. **In-App Purchase Ürünleri** ⚠️
   - RevenueCat ile eşleştirilmeli

5. **Build** ⚠️
   - Production build alınıp TestFlight'a yüklenmeli

---

## 📝 App Store Connect'te Yapılacaklar (Adım Adım)

### Adım 1: Screenshots Hazırla
1. Uygulamayı çalıştır
2. Ekran görüntüleri al (iPhone 6.5" ve 5.5" boyutlarında)
3. Gerekirse düzenleme yap (overlay text ekleme)
4. App Store Connect > My Apps > Wearify > Version 1.0.0 > Screenshots
5. Yükle

### Adım 2: Metadata Ekle
1. App Store Connect > My Apps > Wearify > Version 1.0.0
2. Description: `docs/app-store-metadata.md` dosyasından kopyala
3. Keywords: `AI,fashion,outfit,virtual try-on,clothing,style,photo,visualization,generate,wardrobe`
4. Promotional Text: "1 ücretsiz deneme ile başla! AI teknolojisiyle kıyafetleri üzerinde nasıl görüneceğini keşfet."

### Adım 3: Privacy Policy URL Ekle
1. App Store Connect > My Apps > Wearify > App Privacy
2. Privacy Policy URL ekle (ör: `https://yourdomain.com/privacy`)
3. Privacy Policy sayfasını hazırla (gerekirse)

### Adım 4: In-App Purchase Kontrolü
1. App Store Connect > My Apps > Wearify > In-App Purchases
2. RevenueCat Dashboard'daki Product ID'lerle karşılaştır
3. Eksik varsa oluştur, varsa kontrol et
4. Tüm ürünlerin "Ready to Submit" olduğundan emin ol

### Adım 5: Build Al ve Yükle
1. Terminal'de: `eas build --profile production --platform ios`
2. Build tamamlandığında: `eas submit --platform ios --latest`
3. App Store Connect > My Apps > Wearify > TestFlight
4. Build'in işlenmesini bekle
5. Version 1.0.0 > Build bölümünden build'i seç

### Adım 6: Review'a Gönder
1. Tüm eksikler tamamlandı mı? Kontrol et
2. "Submit for Review" butonuna tıkla
3. Review süresi: 1-3 gün (ortalama)

---

## 🔗 Faydalı Linkler

- **App Store Connect**: https://appstoreconnect.apple.com
- **RevenueCat Dashboard**: https://app.revenuecat.com
- **Apple Developer**: https://developer.apple.com
- **EAS Build Dashboard**: https://expo.dev

---

## 📞 İhtiyaç Duyduğunuz Bilgiler

- [ ] Privacy Policy URL'i (hazırlanmalı)
- [ ] Support URL'i
- [ ] Marketing URL'i (opsiyonel)
- [ ] RevenueCat Production API Key (iOS)
- [ ] Test kullanıcı bilgileri (review için)

