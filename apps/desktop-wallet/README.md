# Alephium desktop wallet

The official Alephium desktop wallet.

![Wallet preview](https://user-images.githubusercontent.com/1579899/236201682-4e0b0c45-65d3-42c0-b187-d8d6387426d7.png)

## Development

Start by following the development instructions in the [README](../../README.md) of the monorepo.

Then, to start the electron app, run:

```shell
pnpm start
```

## Packaging

Based on your OS run the appropriate command:

```shell
pnpm ci:build:electron:windows
pnpm ci:build:electron:macOS
pnpm ci:build:electron:linux
pnpm ci:build:electron:linux:arm64
```

## Adding new translation

1. Copy `locales/fr-FR/translation.json` into `locales/[xx-YY]/translation.json` and add your translations.
2. Import new translation file and add it to the resources in `src/i18n.ts`

   ```ts
   import en from '../locales/en-US/translation.json'
   import fr from '../locales/fr-FR/translation.json'

   i18next.use(initReactI18next).init({
     resources: {
       'en-US': { translation: en },
       'fr-FR': { translation: fr }
     }
   })
   ```

3. Add new language option in `src/utils/settings.ts`

   ```ts
   const languageOptions = [
     { label: 'English', value: 'en-US' },
     { label: 'Français', value: 'fr-FR' }
   ]
   ```

4. Import `dayjs` translation file in `src/storage/settings/settingsSlice.ts`

   ```ts
   import 'dayjs/locale/fr'
   ```
