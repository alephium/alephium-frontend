module.exports = {
  semi: false,
  trailingComma: 'none',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  // 'auto' keeps CRLF checkouts (Windows) passing. It must live here, not only in the eslint
  // `prettier/prettier` rule, or `pnpm format` and `pnpm lint` disagree on CRLF files.
  endOfLine: 'auto'
}
