import 'server-only'

const dictionaries = {
  en: () => import('../dictionaries/en/index').then((module) => module.default),
  fa: () => import('../dictionaries/fa/index').then((module) => module.default),
}

export const getDictionary = async (locale: 'en' | 'fa') => {
  return dictionaries[locale]?.() ?? dictionaries.fa();
}
