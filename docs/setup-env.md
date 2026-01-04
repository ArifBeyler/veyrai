# Ortam Değişkenleri Kurulumu

## 1. Expo/Client Tarafı

`app.json` dosyasındaki `extra` bölümünü güncelleyin:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
    }
  }
}
```

## 2. Supabase Edge Functions Secrets

Supabase Dashboard > Settings > Edge Functions > Secrets bölümünden ekleyin:

| Secret Name | Açıklama |
|------------|----------|
| `FAL_API_KEY` | fal.ai API anahtarı (https://fal.ai/dashboard) |
| `WEBHOOK_SECRET` | Rastgele oluşturulmuş webhook güvenlik anahtarı |

### FAL_API_KEY Almak

1. https://fal.ai adresine gidin
2. Hesap oluşturun veya giriş yapın
3. Dashboard > API Keys bölümünden yeni key oluşturun
4. Key'i Supabase secrets'a ekleyin

### WEBHOOK_SECRET Oluşturmak

```bash
# Terminal'de rastgele secret oluşturun
openssl rand -hex 32
```

## 3. Storage Bucket'ları

Supabase Dashboard > Storage bölümünden aşağıdaki bucket'ları oluşturun:

- `human-images` (Private)
- `garment-images` (Private)
- `tryon-results` (Private)

## 4. Migration'ları Çalıştırma

```bash
# Supabase CLI ile
supabase db push

# Veya Dashboard'dan SQL Editor ile migration dosyalarını çalıştırın
```

## 5. Edge Functions Deploy

```bash
# Tüm functions'ları deploy et
supabase functions deploy create-tryon-job
supabase functions deploy check-job-status
supabase functions deploy fal-webhook
```

