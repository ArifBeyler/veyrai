import i18n from '../i18n/config';

/**
 * Translates garment titles from Supabase (which may be in Turkish)
 * to the current app language
 * 
 * Examples:
 * - "Erkek Kombin 1" -> "Male Outfit 1" (en) or "Erkek Kombin 1" (tr)
 * - "Kadın Kombin 2" -> "Female Outfit 2" (en) or "Kadın Kombin 2" (tr)
 */
export const translateGarmentTitle = (title: string): string => {
  const currentLang = i18n.language || 'en';
  
  // Pattern matching for Turkish garment titles
  const erkekKombinPattern = /^Erkek Kombin (\d+)$/i;
  const kadinKombinPattern = /^Kadın Kombin (\d+)$/i;
  
  // Match "Erkek Kombin X"
  const erkekMatch = title.match(erkekKombinPattern);
  if (erkekMatch) {
    const number = erkekMatch[1];
    if (currentLang === 'en') {
      return `Male Outfit ${number}`;
    } else if (currentLang === 'fr') {
      return `Tenue Homme ${number}`;
    }
    // Turkish - return as is
    return title;
  }
  
  // Match "Kadın Kombin X"
  const kadinMatch = title.match(kadinKombinPattern);
  if (kadinMatch) {
    const number = kadinMatch[1];
    if (currentLang === 'en') {
      return `Female Outfit ${number}`;
    } else if (currentLang === 'fr') {
      return `Tenue Femme ${number}`;
    }
    // Turkish - return as is
    return title;
  }
  
  // No pattern match - return title as is
  return title;
};
