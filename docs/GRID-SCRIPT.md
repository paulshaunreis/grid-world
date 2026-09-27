# Grid Script

Grid Script is the planned creator language for Grid World.

Its goal is to make interactive object behavior approachable without exposing the browser, server, database, or operating system to creator code.

## Example

~~~grid
object "Neon Door"

when player enters:
    door.open()

when player leaves:
    door.close()
~~~

Another example:

~~~grid
object "Treasure Chest"

when player interacts:
    give player item "Crystal Sword"
    play sound "chest-open"
    show "You found a Crystal Sword!"
~~~

## Design rules

### 1. No arbitrary JavaScript

Grid Script is parsed into an internal representation. Creator code is never evaluated as browser JavaScript.

### 2. Capability-based APIs

Scripts receive only the capabilities explicitly granted to their object.

Examples:

- read_self
- detect_players
- play_audio
- play_animation
- change_appearance
- spawn_approved_object

Sensitive capabilities are separate:

- read_inventory
- modify_inventory
- modify_land
- create_market_listing
- economy_transaction

A normal object does not receive sensitive capabilities by default.

### 3. Economy is transactional

Scripts request an economy operation through a server API. They cannot directly edit a wallet or ledger row.

### 4. Ownership is authoritative

Land, objects, currency, NFTs/digital assets, and marketplace settlement are server-authoritative.

### 5. Runtime quotas

Every script instance has limits for:

- CPU time
- memory
- event frequency
- recursion
- object creation
- API calls
- concurrent instances

Exceeding a limit terminates or throttles the script.

## Compiler pipeline

~~~text
Grid Script
  -> Parser
  -> AST
  -> Static validation
  -> Security / capability analysis
  -> Intermediate representation
  -> Sandboxed runtime
~~~

## Versioning

Published scripts carry:

- script ID
- creator ID
- language version
- runtime version
- requested capabilities
- approved capabilities
- dependencies
- publication timestamp

Language/runtime changes must preserve compatibility or provide an explicit migration path.

## Future direction

A visual node editor can compile to the same Grid Script representation. This lets beginners build behavior visually while advanced creators can use text.
