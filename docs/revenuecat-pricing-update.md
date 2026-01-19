# RevenueCat Fiyat Güncelleme Rehberi

## 📋 Yeni Fiyatlandırma

- **Weekly**: $4.99/hafta (33 kredi/hafta)
- **Monthly**: $14.99/ay (100 kredi/ay)
- **Yearly**: $99.99/yıl (660 kredi/yıl)

---

## 🔧 Adım 1: App Store Connect'te Ürünleri Güncelle

### 1. App Store Connect'e Giriş Yap
1. https://appstoreconnect.apple.com adresine git
2. "My Apps" > "Veyra" seç
3. Sol menüden "In-App Purchases" seç

### 2. Mevcut Ürünleri Bul ve Güncelle

#### Weekly Subscription
- **Product ID**: `weekly` (veya mevcut ID'niz)
- **Type**: Auto-Renewable Subscription
- **Price**: **$4.99** (Weekly)
- **Duration**: 1 Week
- **Display Name**: "Veyra Pro - Weekly"
- **Description**: "Weekly subscription with 33 credits per week"

#### Monthly Subscription
- **Product ID**: `monthly` (veya mevcut ID'niz)
- **Type**: Auto-Renewable Subscription
- **Price**: **$14.99** (Monthly)
- **Duration**: 1 Month
- **Display Name**: "Veyra Pro - Monthly"
- **Description**: "Monthly subscription with 100 credits per month"

#### Yearly Subscription
- **Product ID**: `yearly` (veya mevcut ID'niz)
- **Type**: Auto-Renewable Subscription
- **Price**: **$99.99** (Yearly)
- **Duration**: 1 Year
- **Display Name**: "Veyra Pro - Yearly"
- **Description**: "Yearly subscription with 660 credits per year. Save 44% compared to monthly plan."

### 3. Ürün Durumunu Kontrol Et
- Tüm ürünlerin **"Ready to Submit"** durumunda olduğundan emin ol
- Eğer değişiklik yaptıysanız, Apple'ın onaylaması gerekebilir

---

## 🔧 Adım 2: RevenueCat Dashboard'da Kontrol Et

### 1. RevenueCat Dashboard'a Giriş
1. https://app.revenuecat.com adresine git
2. "Veyra" projesini seç

### 2. Products Sekmesini Kontrol Et
1. Sol menüden **"Products"** seç
2. Aşağıdaki Product ID'lerin olduğundan emin ol:
   - `weekly`
   - `monthly`
   - `yearly`

3. Her ürün için:
   - **Store Product ID**: App Store Connect'teki Product ID ile eşleşmeli
   - **Type**: Subscription olmalı
   - Fiyatlar otomatik olarak App Store Connect'ten çekilir

### 3. Offerings Sekmesini Kontrol Et
1. Sol menüden **"Offerings"** seç
2. **"Default"** offering'i seç (veya aktif offering'iniz)
3. Aşağıdaki paketlerin olduğundan emin ol:

#### Weekly Package
- **Identifier**: `weekly`
- **Product**: `weekly` (App Store Connect Product ID)
- **Package Type**: Weekly

#### Monthly Package
- **Identifier**: `monthly`
- **Product**: `monthly` (App Store Connect Product ID)
- **Package Type**: Monthly

#### Yearly Package
- **Identifier**: `yearly`
- **Product**: `yearly` (App Store Connect Product ID)
- **Package Type**: Annual

### 4. Entitlement Kontrolü
1. Sol menüden **"Entitlements"** seç
2. **"veyra Pro"** entitlement'ını kontrol et
3. Tüm paketlerin (weekly, monthly, yearly) bu entitlement'a bağlı olduğundan emin ol

---

## 🔧 Adım 3: Test Etme

### 1. Sandbox Test Kullanıcısı ile Test
1. App Store Connect > Users and Access > Sandbox Testers
2. Test kullanıcısı oluştur (eğer yoksa)
3. Uygulamada bu kullanıcı ile giriş yap
4. Paywall ekranını aç
5. Fiyatların doğru göründüğünü kontrol et

### 2. Console Loglarını Kontrol Et
Uygulamayı çalıştırırken console'da şu logları görmelisiniz:
```
✅ RevenueCat connected, offerings available
Available packages: [
  { identifier: 'weekly', price: 4.99, ... },
  { identifier: 'monthly', price: 14.99, ... },
  { identifier: 'yearly', price: 99.99, ... }
]
```

---

## ⚠️ Önemli Notlar

1. **Fiyat Değişiklikleri**: App Store Connect'te fiyat değişikliği yaparsanız, Apple'ın onaylaması gerekebilir. Bu işlem birkaç saat sürebilir.

2. **Test Ortamı**: Sandbox test kullanıcıları ile test ederken, fiyatlar App Store Connect'teki fiyatları yansıtır.

3. **Production**: Production'da fiyatlar App Store Connect'ten otomatik çekilir. Kodda fallback fiyatlar sadece test/development için.

4. **Localization**: Fiyatlar kullanıcının ülkesine göre otomatik olarak yerel para birimine çevrilir (StoreKit tarafından).

---

## 🐛 Sorun Giderme

### Fiyatlar Görünmüyor
- RevenueCat Dashboard'da Products'ların doğru Product ID'lere sahip olduğundan emin ol
- App Store Connect'te ürünlerin "Ready to Submit" durumunda olduğundan emin ol
- Offering'lerde paketlerin doğru Product ID'lere bağlı olduğundan emin ol

### "Selected plan not found" Hatası
- Package identifier'ların doğru olduğundan emin ol (`weekly`, `monthly`, `yearly`)
- Offering'in aktif olduğundan emin ol
- Console loglarını kontrol et

### Fiyatlar Eski Görünüyor
- App Store Connect'te değişikliklerin onaylandığından emin ol
- RevenueCat cache'ini temizlemek için uygulamayı yeniden başlat
- Offering'leri refresh et (`refreshOfferings()`)

---

## 📝 Checklist

- [ ] App Store Connect'te tüm ürünler güncellendi ($4.99, $14.99, $99.99)
- [ ] Ürünler "Ready to Submit" durumunda
- [ ] RevenueCat Dashboard'da Products doğru Product ID'lere sahip
- [ ] Offering'lerde paketler doğru Product ID'lere bağlı
- [ ] Entitlement'lar doğru yapılandırılmış
- [ ] Sandbox test kullanıcısı ile test edildi
- [ ] Console loglarında fiyatlar doğru görünüyor
- [ ] Paywall ekranında fiyatlar doğru görünüyor
