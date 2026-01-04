#Kombin Seçim Ekranı (Multi-Select) Prompt Context

Amaç
- Kullanıcı tek parça yerine “kombin” seçebilsin: üst + alt + ayakkabı + çanta + aksesuar(lar) vb.
- Kadın/erkek ayrımı yapmadan aynı mantıkla çalışsın (unisex kategori sistemi).
- Kullanıcı fotoğrafını kırpma ZORUNLU olmasın. (Kırpma opsiyonel: sadece istenirse.)
- Model, seçilen parçaları tek görselde tutarlı katman sırasıyla giydirsin (çekişme/çakışma azaltılsın).

--------------------------------------------------------------------

1) Bilgi Mimarisi (Kıyafet Parçası Tipleri)
Kategori grupları (örnek):
- Tops (Üst): t-shirt, gömlek, sweatshirt, ceket, blazer, kaban
- Bottoms (Alt): pantolon, şort, etek
- One-piece: elbise, tulum (seçilirse alt/üst ile çakışabilir → kural var)
- Footwear: ayakkabı, bot, sneaker, topuklu
- Bags: çanta, sırt çantası
- Outerwear: mont/kaban (üst + altın üstüne gelir)
- Accessories: şapka, gözlük, saat, takı, kemer, eşarp (çoklu seçilebilir)
- Optional: “Full outfit from reference image” (kullanıcı referans görseldeki her şeyi isterse)

Her ürün kartı metadatası (UI ve prompt için):
- id
- title (UI)
- category (enum)
- subCategory (opsiyonel)
- tags (streetwear, formal, minimal, vintage, sporty, summer, winter…)
- layerPriority (ör: innerwear < top < outerwear < bag < accessories)
- colorHint (opsiyonel)
- isAccessory (bool)
- imageUrl (seçilen ürün görseli / referans görsel)

--------------------------------------------------------------------

2) Seçim Kuralları (Çakışma / Mantık)
Multi-select serbest ama kullanıcıyı saçmalığa sürüklemeyelim:

Temel kurallar
- Aynı “çekirdek kategori” içinde (Tops / Bottoms / Footwear / Bags) varsayılan tek seçim.
- Accessories kategorisi çoklu seçim serbest (örn: gözlük + saat + şapka).
- Outerwear tek seçim (mont + kaban aynı anda seçilmesin).
- One-piece seçilirse:
  - Bottoms otomatik devre dışı (veya “one-piece + outerwear + footwear + bag + accessories” şeklinde ilerle).
  - Tops “opsiyonel” kalsın ama seçilirse uyarı göster: “Elbisenin üstüne ayrıca üst giydirmek ister misin?” (default: hayır)
- Kullanıcı isterse “override” yapabilir: “Ben biliyorum, yine de seç” (pro kullanıcı gibi).

Sınırlar
- Toplam parça limiti: 8 (ör: üst, alt, outerwear, ayakkabı, çanta, +3 aksesuar).
- Seçilince otomatik “katman sırası” belirlenir.

--------------------------------------------------------------------

3) UI/UX — Kombin Seçim Ekranı
Ekran hedefi: hızlı seçim + net kontrol + son kontrolde düzenleme.

Layout önerisi
A) Üstte: “Kombinin” alanı (Selected Tray)
- Yatay scroll “chip” kartlar:
  - küçük thumbnail + kategori ikonu + “x” kaldır
  - sürükle-bırak ile sıralama (katman override)
- “Katman” butonu: “Otomatik / Manuel” toggle
  - Manuelde kullanıcı katman sırasını değiştirirse prompt’a “layer_override” ekle.

B) Orta: Kategori sekmeleri (segmented)
- Tops | Bottoms | One-piece | Outerwear | Footwear | Bags | Accessories
- Sekme içinde grid ürün kartları (2 kolon, büyük görsel)

C) Kart davranışı
- Kart tıklayınca:
  - Eğer kategori tek seçimse: önceki seçimi değiştir (replace)
  - Aksesuar ise: ekle/kaldır (toggle)
- Kart üzerinde “selected” state: stroke + check
- Long-press: “Detay” bottom sheet (renk, doku, not ekle, “bu parça kesin” kilitle)

D) Alt sabit bar (CTA)
- Sol: “Stil Notu” (opsiyonel prompt notu)
- Orta: “Önizleme” (hızlı low-cost render / veya sadece UI mock)
- Sağ: “Giydir” (render generate)

Animasyonlar
- Kart seçilince: hafif scale + selected tray’e “fly-to-tray” animasyonu
- Kategori değişimi: smooth fade/slide
- Generate tıklandığında: selected tray kilitlenir, loading state “Processing outfit layers…”

--------------------------------------------------------------------

4) Prompt Hazırlama Mantığı (Çoklu Parça)
Girdi varlıkları
- userImage (kullanıcının yüklediği fotoğraf)  ✅ KIRPMA YOK varsayılan
- selectedItems[] (0..8) — her biri bir kıyafet referans görseli / ürün görseli
- optional: styleNote (kullanıcı yazısı: “minimal, siyah ağırlıklı, smart casual”)
- optional: fullOutfitMode (boolean) — referans görseldeki tüm kombini giydir

Prompt stratejisi
- Modelin görevi: “tek tek parçaları kullanıcı üzerinde doğru bölgede uygula”
- En önemli risk: çakışma (üst-alt), perspektif/poz uyumu, ellerin çanta askısıyla kesişmesi, ayakkabının kadraja girmemesi.
- Bu yüzden prompt’ta:
  - Kategori + katman sırası + “görünür olmayan uzuvları uydurma” kuralı
  - “Mevcut poz/ışık korunacak” kuralı
  - “Kullanıcının yüzü, saç modeli, ten tonu değişmesin” kuralı
  - “Arka plan mümkünse korunur; aşırı değiştirme” kuralı

Katman sırası (default)
1) Bottoms / One-piece (taban)
2) Tops (üst)
3) Outerwear (en üst)
4) Bags (askı/çanta üstte)
5) Accessories (gözlük/şapka/saat/takı)

Edge-case kuralları
- Kullanıcı fotoğrafında ayak görünmüyorsa Footwear seçimini “uygula ama görünmüyorsa icat etme”:
  - “Ayaklar görünmüyorsa ayakkabıyı zorla çizme; görünür kısımlara taşırma yapma.”
- Çanta için:
  - “Çanta doğal tutuş/askı pozisyonu” dene ama el/kol ile çakışma varsa “en az bozacak şekilde yerleştir”.
- Outerwear + Bag birlikte:
  - Çanta askısı outerwear üstünde kalsın.

--------------------------------------------------------------------

5) Üretim İçin Tek Bir “Master Prompt” Şablonu
Aşağıdaki prompt, generate anında oluşturulacak metindir (değişkenleri doldur):

SYSTEM / DEV (sabit niyet)
- You are a virtual try-on compositor. Keep identity unchanged. Do not crop the user photo. Preserve pose, body proportions, lighting, and background as much as possible.
- Apply the selected clothing items onto the user realistically with correct layering and occlusion.
- Do not invent garments that were not selected. If a body part is not visible, do not hallucinate it.
- Avoid changing face, hair, skin tone, or age. No text overlay.

USER (dinamik içerik)
- Task: Dress the person in the user photo with the following selected items.
- Full-outfit mode: {fullOutfitMode true/false}
- Style note (optional): {styleNote or "none"}
- Layer mode: {auto/manual}
- Layer order (if manual): [{itemId: ..., category: ..., orderIndex: ...}, ...]

Selected items list (ordered by layerPriority):
1) {category}: {title} | tags: {tags} | colorHint: {colorHint}
   reference_image: {itemImageUrl}
2) ...

Constraints:
- Do not crop or zoom the user image.
- Keep background stable unless minor blending is needed.
- Realistic fabric behavior and shadows.
- Correct occlusion: e.g., outerwear on top of tops, bag strap on top of outerwear, watch on wrist area only if visible.

Output:
- Return a single final image of the user wearing the complete outfit.

--------------------------------------------------------------------

6) UI’dan Prompt’a Dönüşüm (Implementation Notes)
- selectedItems’ı layerPriority’e göre sırala.
- One-piece seçiliyse Bottoms’u prompt listesinde include etme (override edilmediyse).
- Accessories çokluysa hepsini en sona yaz.
- styleNote boşsa prompt’ta “none” yaz (modelin uydurmasını azaltır).
- Kullanıcı “full outfit from reference image” seçerse:
  - selectedItems yerine tek referans görsel + “extract full outfit and apply” komutu.
  - Ama yine “identity stable, no crop” kuralları geçerli.

--------------------------------------------------------------------

7) Hata Önleme / Kullanıcıya Akıllı Uyarılar
Seçim sırasında küçük uyarılar (modal değil, toast/inline):
- “Elbise seçtin → alt parça devre dışı bırakıldı.”
- “2 farklı ayakkabı seçemezsin.” (override yoksa)
- “Fotoğrafta ayak görünmüyor, ayakkabı etkisi sınırlı olabilir.”
- “Çanta + mont birlikte seçildi: askı üstte kalacak.”

--------------------------------------------------------------------

8) Minimum Test Senaryoları (QA)
- Tops + Bottoms + Footwear + Bag + 2 Accessories (ideal)
- One-piece + Outerwear + Footwear + Bag (çakışma testi)
- Sadece aksesuar (gözlük + saat) (küçük müdahale)
- Selfie foto: sadece üst + aksesuar (alt/ayak yok)
- Boydan foto: tüm kombin
- Geniş arka plan: arka plan bozulmadan blend

--------------------------------------------------------------------

Bu context’in beklenen çıktısı
- Kıyafet seçim ekranı multi-select çalışır.
- Seçimler kurallı ama esnek (override).
- Prompt her zaman katman ve kimlik koruma kurallarını içerir.
- “Kırpma istemiyoruz” prensibi default davranış olur.
