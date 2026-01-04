// Zara erkek model fotoğrafları - ceket/mont ile
// Bu fotoğraflar face swap için kullanılacak base model olarak

export interface ModelPhoto {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  gender: 'male' | 'female';
  category: 'outerwear' | 'tops' | 'bottoms' | 'dresses';
}

export const MALE_MODEL_PHOTOS: ModelPhoto[] = [
  {
    id: 'zara-male-1',
    name: 'Jakar Dokulu Ceket',
    imageUrl: 'https://static.zara.net/assets/public/3993/841f/c7434f77a2af/86cf0bc601ad/08281451710-p/08281451710-p.jpg?ts=1757596685551&w=1440',
    description: 'Bej dokulu, yakalı, fermuarlı ceket',
    gender: 'male',
    category: 'outerwear',
  },
  {
    id: 'zara-male-2',
    name: 'Dimi Dokulu Ceket',
    imageUrl: 'https://static.zara.net/assets/public/a22c/5a4a/c14248a4b450/d466cae59ed3/01437316422-p/01437316422-p.jpg?ts=1756386016155&w=1440',
    description: 'Fermuarlı siyah ceket',
    gender: 'male',
    category: 'outerwear',
  },
  {
    id: 'zara-male-3',
    name: 'Soyut Desenli Şişme Mont',
    imageUrl: 'https://static.zara.net/assets/public/7f4e/28b4/293a421a92f6/199178e19b55/03833450020-p/03833450020-p.jpg?ts=1756281230968&w=1440',
    description: 'Dik yakalı ve yan cepli desenli kapitone ceket',
    gender: 'male',
    category: 'outerwear',
  },
  {
    id: 'zara-male-4',
    name: 'Kutu Kesim Dokulu Ceket',
    imageUrl: 'https://static.zara.net/assets/public/76f8/5336/ab74441b9a88/b39329827f6f/03046312800-p/03046312800-p.jpg?ts=1759483254487&w=1440',
    description: 'Fermuarlı siyah boxy fit ceket',
    gender: 'male',
    category: 'outerwear',
  },
  {
    id: 'zara-male-5',
    name: 'Regular Fit Deri Ceket',
    imageUrl: 'https://static.zara.net/assets/public/9e07/3545/98a74dd59fa9/34d0e78c44ee/05388701745-p/05388701745-p.jpg?ts=1758124636028&w=1440',
    description: 'Fermuarlı, geniş yakalı deri ceket',
    gender: 'male',
    category: 'outerwear',
  },
  {
    id: 'zara-male-6',
    name: 'Yamalı Kapitone Bomber',
    imageUrl: 'https://static.zara.net/assets/public/3477/4cda/cdff4179812e/6cbefb5a0f97/04575420819-p/04575420819-p.jpg?ts=1763045386987&w=1440',
    description: 'Classic Originals 1975 yamalı bomber ceket',
    gender: 'male',
    category: 'outerwear',
  },
  {
    id: 'zara-male-7',
    name: 'Kontrast Bomber Ceket',
    imageUrl: 'https://static.zara.net/assets/public/c0f8/d4ff/be224a3eb4c5/6e2fbc12a121/04302314500-p/04302314500-p.jpg?ts=1761751927581&w=1440',
    description: 'Boston Archive yazılı yeşil ceket',
    gender: 'male',
    category: 'outerwear',
  },
  {
    id: 'zara-male-8',
    name: 'Teknik Kapitone Ceket',
    imageUrl: 'https://static.zara.net/assets/public/ef76/cd98/00834ffc907f/19391d73dd49/03286309800-p/03286309800-p.jpg?ts=1760094756178&w=1440',
    description: 'Fermuarlı, dik yakalı siyah teknik ceket',
    gender: 'male',
    category: 'outerwear',
  },
  {
    id: 'zara-male-9',
    name: 'Dimi Dokulu Ceket (Gri)',
    imageUrl: 'https://static.zara.net/assets/public/7bb9/b210/10ba465399a8/deb132468017/01437316916-p/01437316916-p.jpg?ts=1756386018846&w=1440',
    description: 'Fermuarlı, yan cepli gri yeşil ceket',
    gender: 'male',
    category: 'outerwear',
  },
  {
    id: 'zara-male-10',
    name: 'Regular Fit Şişme Yelek',
    imageUrl: 'https://static.zara.net/assets/public/5dc0/19f9/ba1b47019e2f/bcd7a74c6c9e/00029440707-p/00029440707-p.jpg?ts=1755776016416&w=1440',
    description: 'Bej fermuarlı kapitone yelek',
    gender: 'male',
    category: 'outerwear',
  },
];

// Rastgele bir model fotoğrafı seç
export const getRandomModelPhoto = (gender: 'male' | 'female' = 'male'): ModelPhoto => {
  const photos = gender === 'male' ? MALE_MODEL_PHOTOS : MALE_MODEL_PHOTOS; // TODO: Add female photos
  const randomIndex = Math.floor(Math.random() * photos.length);
  return photos[randomIndex];
};

// Belirli bir kategoriye göre model fotoğrafı seç
export const getModelPhotoByCategory = (
  category: ModelPhoto['category'],
  gender: 'male' | 'female' = 'male'
): ModelPhoto => {
  const photos = gender === 'male' ? MALE_MODEL_PHOTOS : MALE_MODEL_PHOTOS;
  const filteredPhotos = photos.filter((p) => p.category === category);
  const randomIndex = Math.floor(Math.random() * filteredPhotos.length);
  return filteredPhotos[randomIndex] || photos[0];
};

