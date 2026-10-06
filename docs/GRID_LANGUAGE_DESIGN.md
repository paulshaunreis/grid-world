# Grid World Global Language System

Date: 2026-10-06

## User-facing decision

Grid World will have one language preference shared by the website and the in-world interface.

- The same preference key is used by both surfaces.
- Automatic follows the browser/device language.
- Users can explicitly select another language.
- The preference synchronizes across same-origin website/world tabs through localStorage and the storage event.
- The UI is designed to consume the complete language catalog from a server translation endpoint.

## Google translation research

Google Cloud Translation currently supports a very large language catalog (Google advertises 189 languages for Cloud Translation) and provides automatic source-language detection. The production Grid World integration should use Google Cloud Translation behind a server-side endpoint rather than exposing a Google credential in the browser.

Required endpoints:

- GET /api/i18n/languages
- POST /api/i18n/translate

The language endpoint should proxy the currently supported Google language catalog and return stable Grid World language codes/display names.

The translation endpoint should accept:
{ text, target, source? }

and return:
{ translatedText, detectedSourceLanguage? }

## Architecture

Website + In-world UI
-> shared GridLanguage preference
-> translation service adapter
-> server-side translation provider
-> Google Cloud Translation

Do not put a Google API key in Vite client code.

## Translation rules

1. Translate UI labels, help text, system messages, onboarding, marketplace/category labels, settings, forums, and other player-facing copy.
2. Never translate immutable IDs, @GridHandle values, item IDs, world IDs, currency codes, URLs, code, or user-selected proper names unless explicitly requested.
3. User-generated Message Board/chat content remains authored in its original language. Add per-message Translate actions rather than silently rewriting stored content.
4. Store the original message as the canonical record; translated output is presentation/cache data.
5. NPC dialog should preserve character personality while translating the presentation layer.
6. Allow reduced-motion users to disable language-change transition effects.
7. If translation is unavailable, retain the original English/source text rather than showing broken or fake translated copy.

## Future implementation gates

- Full Google-backed language catalog verified.
- Website and in-world selector verified to share one preference.
- Static UI catalog migrated to translation keys.
- Message Board per-post translation verified.
- NPC/system message translation verified.
- Server-side rate limiting and caching added.
- Translation failures produce graceful source-language fallback.
- Privacy/data handling for text sent to an external translation provider documented.

## Aurora/Muse note

AUDIT -> IDENTIFY EXISTING AUTHORITY -> EXTEND -> VERIFY -> REPORT.

Do not create a second preference store or a second translation abstraction. Extend the shared language module and existing Settings/Social UI. Keep provider credentials server-side.
