/**
 * UI strings (nav labels, button text, aria-labels), keyed by locale.
 * Page copy lives in the `pages` content collection, not here.
 */
const en = {
  'site.name': 'Zenika',
  skipLink: 'Skip to main content',
  'nav.label': 'Main',
  'nav.index': 'Presentation',
  'nav.contact': 'Contact',
  'langSwitcher.label': 'Language',
  'lang.name': 'English',
  'theme.toggle': 'Dark theme',
  'footer.placeholder': '[PLACEHOLDER] Footer',
  'contact.emailLabel': 'Email us:',
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
  'nav.contact': 'Contact',
  'langSwitcher.label': 'Langue',
  'lang.name': 'Français',
  'theme.toggle': 'Thème sombre',
  'footer.placeholder': '[PLACEHOLDER] Pied de page',
  'contact.emailLabel': 'Écrivez-nous\u00a0:',
  'contact.email': 'info@zenika.com',
  'meta.ogLocale': 'fr_FR',
};

export const ui: Readonly<Record<string, UIStrings>> = { en, fr };
