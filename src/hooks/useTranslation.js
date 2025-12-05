import { useState, useEffect } from 'react';
import es from '../config/locales';

export const useTranslation = () => {
  const [language, setLanguage] = useState('es');
  const [t, setT] = useState(es);

  useEffect(() => {
    // For now, we only support Spanish, but this can be extended
    if (language === 'es') {
      setT(es);
    }
  }, [language]);

  const translate = (key) => {
    const keys = key.split('.');
    let result = t;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return result || key;
  };

  return { t: translate, language, setLanguage };
};

export default useTranslation;