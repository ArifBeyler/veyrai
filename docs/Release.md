# Veyra iOS Release Checklist

## 📋 Pre-Release Checklist

### 1. App Store Connect Setup
- [ ] Apple Developer hesabı aktif
- [ ] App Store Connect'te "Veyra" app oluşturuldu
- [ ] Bundle ID: `com.veyra.app` Identifiers'da kayıtlı
- [ ] Push Notifications capability aktif
- [ ] In-App Purchase capability aktif (RevenueCat için)

### 2. Proje Konfigürasyonu
- [x] Bundle ID: `com.veyra.app`
- [x] Version: `1.0.0`
- [x] iOS minimum version: default (iOS 15+)
- [x] Push Notifications configured
- [x] RevenueCat entegrasyonu
- [ ] RevenueCat Production API Key ayarlandı

### 3. Assets Kontrolü
- [x] App Icon (1024x1024) - `assets/images/icon.png`
- [x] Splash Screen - `assets/images/splash-icon.png`
- [ ] App Store Screenshots (6.5", 5.5")
- [ ] App Store Preview Video (opsiyonel)

---

## 🔧 Setup Adımları

### Step 1: EAS CLI Kurulumu
```bash
npm install -g eas-cli
```

### Step 2: EAS Login
```bash
eas login
```

### Step 3: EAS Project Bağlama
```bash
cd /Users/arifbeyler/fitdressap
eas init --id YOUR_PROJECT_ID
```

### Step 4: eas.json Güncelleme
`eas.json` dosyasında şu alanları güncelle:
- `appleId`: Apple Developer email
- `ascAppId`: App Store Connect App ID (sayı)
- `appleTeamId`: 10 haneli Team ID

### Step 5: RevenueCat Production Key
`src/services/revenuecat.ts` dosyasında:
```typescript
const API_KEY = 'appl_XXXXX'; // Production iOS key
```

---

## 🏗️ Build Komutları

### Development Build (Test için)
```bash
eas build --profile development --platform ios
```

### Production Build (App Store için)
```bash
eas build --profile production --platform ios
```

### TestFlight'a Gönderme
```bash
eas submit --platform ios --latest
```

### Tek Komutta Build + Submit
```bash
eas build --profile production --platform ios --auto-submit
```

---

## 📱 TestFlight Sonrası

1. App Store Connect'e git
2. TestFlight sekmesini aç
3. Build işlenene kadar bekle (~15-30 dk)
4. Internal Testing grubuna ekle
5. Test et

---

## 🚀 App Store Release

1. App Store Connect > App Store sekmesi
2. Version 1.0.0 oluştur
3. Screenshots ekle
4. Açıklama, keywords yaz
5. Build seç
6. Review'a gönder

---

## ⚠️ Önemli Notlar

- Bundle ID değiştirme! App Store Connect'te sabit.
- Her upload'da build number otomatik artacak (eas.json'da `autoIncrement: true`)
- Secrets (.env, API keys) commit etme!
- Test keylerini production'da kullanma!

---

## 📞 Gerekli Bilgiler (DOLDUR)

| Alan | Değer |
|------|-------|
| Apple Developer Email | `____________` |
| Apple Team ID | `____________` |
| App Store Connect App ID | `____________` |
| RevenueCat iOS Production Key | `appl_____________` |

