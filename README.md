# Wearify 👕✨

AI destekli sanal kıyafet deneme uygulaması. Kendi fotoğrafınızı yükleyin, istediğiniz kıyafeti seçin ve AI ile üzerinizde nasıl durduğunu görün.

## 🚀 Özellikler

- **Fotoğraf Yükleme**: Kendi fotoğrafınızı yükleyin veya çekin
- **Kıyafet Kataloğu**: Hazır katalogdan veya kendi kıyafetinizi ekleyin
- **AI Deneme**: Tek tıkla kıyafeti üzerinizde görün
- **Galeri**: Tüm denemelerinizi saklayın ve paylaşın
- **Premium**: Sınırsız deneme, HD kalite ve daha fazlası

## 📱 Ekranlar

- **Welcome**: Karşılama ekranı
- **Onboarding**: 3 adımlı tanıtım (Fotoğraf rehberi, stil tercihi, ücretsiz deneme)
- **Home**: Ana sayfa, hızlı erişim kartları
- **Wardrobe**: Kıyafet kataloğu
- **Gallery**: Sonuç galerisi
- **Profile**: Profil ve ayarlar
- **Create**: Deneme oluşturma akışı
- **Generation**: İlerleme ve sonuç ekranı
- **Paywall**: Premium abonelik

## 🛠️ Teknoloji

- **Framework**: Expo (React Native)
- **Routing**: expo-router
- **State**: Zustand
- **Server State**: TanStack Query
- **Backend**: Supabase (Auth, DB, Storage, Edge Functions)
- **Payments**: RevenueCat
- **UI**: Custom Glass UI Design System

## 🎨 Design System

"Liquid glass" iOS premium tasarım dili:
- Blur efektli yüzeyler
- Soft shadows ve stroke'lar
- Minimal, çok temiz, bol boşluk
- Accent renk: Soft lime (#B4FF6B)

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# iOS simulator'da çalıştır
npm run ios

# Development server başlat
npm start
```

## 🔧 Environment Variables

`.env` dosyası oluşturun:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Proje Yapısı

```
├── app/                    # Expo Router sayfaları
│   ├── (tabs)/            # Tab navigasyonu
│   ├── create/            # Oluşturma akışı
│   ├── generation/        # Sonuç ekranı
│   └── ...
├── src/
│   ├── ui/                # Design system componentleri
│   ├── state/             # Zustand store
│   ├── services/          # API ve servisler
│   └── utils/             # Yardımcı fonksiyonlar
├── full3dicons/           # 3D ikon seti
└── assets/                # Fontlar ve görseller
```

## 📄 Lisans

Proprietary - Tüm hakları saklıdır.

