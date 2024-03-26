export const buildClientLocale = () =>
  navigator.languages && navigator.languages.length
    ? navigator.languages[0]
    : navigator.language;
