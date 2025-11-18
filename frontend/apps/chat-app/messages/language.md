# Adding a New Language

To add a new language to the application, follow these simple steps:

1. Copy the `messages/en.json` file and rename it to match your language code (e.g., `fr.json` for French).

2. Translate all content in the file to your target language while maintaining the same JSON structure and keys.

3. Add your language to the `SUPPORTED_LOCALES` array in `src/lib/const.ts` file:

```typescript
export const SUPPORTED_LOCALES = [
  {
    code: "en",
    name: "English 🇺🇸",
  },
  {
    code: "ko",
    name: "Korean 🇰🇷",
  },
  {
    code: "your-language-code",
    name: "Your Language Name 🏴",
  },
];
```

The language will then be available in the language selector of the application.
