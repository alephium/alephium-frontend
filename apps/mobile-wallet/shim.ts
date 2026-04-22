require('react-native-get-random-values')

// Polyfill Intl APIs missing from Hermes
// See: https://github.com/facebook/hermes/issues/1539
// Order matters: locale → pluralrules → relativetimeformat
require('@formatjs/intl-locale/polyfill-force')
require('@formatjs/intl-pluralrules/polyfill-force')
require('@formatjs/intl-pluralrules/locale-data/en')
require('@formatjs/intl-pluralrules/locale-data/fr')
require('@formatjs/intl-pluralrules/locale-data/el')
require('@formatjs/intl-pluralrules/locale-data/vi')
require('@formatjs/intl-pluralrules/locale-data/pt')
require('@formatjs/intl-pluralrules/locale-data/zh')
require('@formatjs/intl-pluralrules/locale-data/de')
require('@formatjs/intl-relativetimeformat/polyfill-force')
require('@formatjs/intl-relativetimeformat/locale-data/en')
require('@formatjs/intl-relativetimeformat/locale-data/fr')
require('@formatjs/intl-relativetimeformat/locale-data/el')
require('@formatjs/intl-relativetimeformat/locale-data/vi')
require('@formatjs/intl-relativetimeformat/locale-data/pt')
require('@formatjs/intl-relativetimeformat/locale-data/zh')
require('@formatjs/intl-relativetimeformat/locale-data/de')
require('@formatjs/intl-relativetimeformat/locale-data/th')
require('@formatjs/intl-relativetimeformat/locale-data/id')
