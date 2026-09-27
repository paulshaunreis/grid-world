# Grid World Creator Foundation

The first creator-system milestone is intentionally small: creators can describe safe object behavior without writing JavaScript.

## Current foundation

Grid Script now has:

- a small parser
- a typed AST
- explicit supported actions
- capability analysis
- a runtime with an action quota
- no arbitrary JavaScript evaluation
- no dynamic imports, browser APIs, database APIs, or arbitrary network access

The parser rejects unsupported actions instead of trying to interpret them.

## Security boundary

The runtime only calls functions supplied by the host application through GridRuntimeContext.

A script cannot obtain the JavaScript runtime or create its own capabilities.

Sensitive operations such as inventory changes, land changes, marketplace operations, and Grid Coin transactions must eventually be implemented as server-authorized services. The client runtime must never become the authority for those operations.

## Next milestones

1. Expand the parser into a formal tokenizer + parser with source locations.
2. Add a compiler that produces a versioned intermediate representation.
3. Add static capability approval and rejection.
4. Add runtime budgets for execution time, events, API calls, and object creation.
5. Move sensitive actions behind server-authorized RPCs.
6. Add a visual node editor that targets the same intermediate representation.
7. Add creator preview/simulation mode before publication.
