/**
 * UI strings (nav labels, button text, aria-labels), keyed by locale.
 * Page copy lives in the `pages` content collection, not here.
 */
const en = {
  'site.name': 'Zenika',
  skipLink: 'Skip to main content',
  'nav.label': 'Main',
  'nav.index': 'Presentation',
  'header.cta': 'Contact us',
  'header.ctaShort': 'Contact',
  'langSwitcher.label': 'Language',
  'lang.name': 'English',
  'theme.toggle': 'Dark theme',
  'footer.tagline': "Together, let's build the information systems of the next 20 years.",
  'footer.copyright': '© {year} Zenika. All rights reserved.',
  'contact.emailLabel': 'Or write to',
  'contact.email': 'info@zenika.com',
  'meta.ogLocale': 'en_GB',
} as const;

export type UIKey = keyof typeof en;
type UIStrings = Record<UIKey, string>;

const fr: UIStrings = {
  'site.name': 'Zenika',
  skipLink: 'Aller au contenu principal',
  'nav.label': 'Principale',
  'nav.index': 'Présentation',
  'header.cta': 'Nous contacter',
  'header.ctaShort': 'Contact',
  'langSwitcher.label': 'Langue',
  'lang.name': 'Français',
  'theme.toggle': 'Thème sombre',
  'footer.tagline': "Ensemble, construisons les Systèmes d'Information des 20 prochaines années.",
  'footer.copyright': '© {year} Zenika. Tous droits réservés.',
  'contact.emailLabel': 'Ou écrivez à',
  'contact.email': 'info@zenika.com',
  'meta.ogLocale': 'fr_FR',
};

export const ui: Readonly<Record<string, UIStrings>> = { en, fr };
