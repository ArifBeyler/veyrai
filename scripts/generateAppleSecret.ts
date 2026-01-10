/**
 * Apple Sign In JWT Secret Generator
 * 
 * Bu script .p8 dosyasından Supabase için JWT secret oluşturur.
 * 
 * Kullanım:
 * 1. Aşağıdaki değerleri doldur
 * 2. npx tsx scripts/generateAppleSecret.ts
 * 3. Çıkan JWT'yi Supabase'e yapıştır
 */

import * as crypto from 'crypto';

// ============= BU DEĞERLERI DOLDUR =============

const TEAM_ID = '73ANVUDATZ'; // Apple Team ID
const KEY_ID = '948DL5U9PS'; // Apple Key ID (.p8 oluştururken aldığın)
const CLIENT_ID = 'com.wearify.app'; // Bundle ID

// .p8 dosyasının içeriğini buraya yapıştır (-----BEGIN PRIVATE KEY----- dahil)
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgKlX6nrUqTzhFPJX9
9tp93p4vKlzrMM11jM+oWwTcvXCgCgYIKoZIzj0DAQehRANCAASoh8fy8UO1n9ur
9zn8AtlNCXBB60RPHfkYMWfbhKcmAfxKILz19RDDR2ijXgpSNOuAluVgCIPDV+Bd
4ssufl1O
-----END PRIVATE KEY-----`;

// ================================================

const generateAppleClientSecret = () => {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + (86400 * 180); // 6 ay (180 gün)

  // Header
  const header = {
    alg: 'ES256',
    kid: KEY_ID,
    typ: 'JWT'
  };

  // Payload
  const payload = {
    iss: TEAM_ID,
    iat: now,
    exp: expiry,
    aud: 'https://appleid.apple.com',
    sub: CLIENT_ID
  };

  // Base64URL encode
  const base64UrlEncode = (obj: object) => {
    return Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const headerEncoded = base64UrlEncode(header);
  const payloadEncoded = base64UrlEncode(payload);
  const signatureInput = `${headerEncoded}.${payloadEncoded}`;

  // Sign with ES256
  const sign = crypto.createSign('SHA256');
  sign.update(signatureInput);
  sign.end();

  const signature = sign.sign(PRIVATE_KEY);
  
  // Convert DER signature to raw format (r || s)
  // ES256 signatures from Node.js are in DER format, need to convert
  const signatureBase64 = signature
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signatureInput}.${signatureBase64}`;

  console.log('\n✅ Apple Client Secret (JWT) oluşturuldu!\n');
  console.log('═'.repeat(60));
  console.log('\n📋 Bu JWT\'yi Supabase\'e yapıştır:\n');
  console.log(jwt);
  console.log('\n' + '═'.repeat(60));
  console.log('\n⏰ Geçerlilik: 6 ay');
  console.log('📅 Son kullanma:', new Date(expiry * 1000).toLocaleDateString('tr-TR'));
  console.log('\n⚠️  6 ay sonra yeniden oluşturman gerekecek!\n');

  return jwt;
};

// Değerlerin doldurulup doldurulmadığını kontrol et
if (KEY_ID === 'BURAYA_KEY_ID_YAZ' || PRIVATE_KEY.includes('BURAYA_P8_DOSYASININ_ICERIGINI_YAPISTIR')) {
  console.log('\n❌ Hata: Lütfen script içindeki değerleri doldur!\n');
  console.log('1. KEY_ID: Apple Developer\'dan aldığın Key ID');
  console.log('2. PRIVATE_KEY: .p8 dosyasının içeriği\n');
  console.log('Dosya: scripts/generateAppleSecret.ts\n');
  process.exit(1);
}

generateAppleClientSecret();

