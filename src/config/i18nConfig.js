const i18n = require('i18n');
const path = require('path');

i18n.configure({
  locales: ['en'], // Add more locales as needed ['en', 'ku','ar']
  directory: path.join(__dirname, '../locales'),
  defaultLocale: 'en',
  objectNotation: true,
  register: global
});

module.exports = i18n;