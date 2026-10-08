# Grid Language Preferences Foundation

**Status:** Technical foundation / implementation work

## Purpose

Provide one versioned preference contract for the user's preferred Grid World interface language and fallback order.

This is a preference layer, not a translation engine. Setting a locale does not claim that every Grid World surface is already localized.

## Contract

The current schema stores:

- `uiLocale`: the user's preferred interface locale.
- `fallbackLocales`: ordered fallback locales.

The first fallback is always the selected UI locale. `en-US` is retained as a final fallback so an incomplete localization cannot leave the interface without a deterministic language choice.

Supported locale identifiers are explicitly enumerated in `src/core/GridLanguagePreferences.ts`. Adding a locale is an implementation decision and should not be treated as proof that the product is fully translated for that locale.

## Storage

Preferences use the existing `VersionedStorage` envelope:

`{ schema, data }`

Storage is local to the current client until an authenticated settings authority is introduced. No server-side account preference or cross-device synchronization is claimed by this foundation.

Malformed, unknown, or unsupported stored values are rejected or normalized to safe defaults.

## Future boundary

This contract is intentionally separate from:

- conversation/message storage,
- per-recipient translation,
- automatic translation,
- content-language detection,
- creator localization assets,
- legal/compliance language requirements.

Those systems can consume this preference later without coupling their data models to the settings store.

## Definition of Done for this slice

- One versioned language-preference contract exists.
- Existing versioned storage is reused.
- Locale values are allowlisted.
- Fallback ordering is deterministic.
- Malformed storage cannot produce an arbitrary locale.
- Reset returns a known default.
- No claim is made that localization or translation already exists.
