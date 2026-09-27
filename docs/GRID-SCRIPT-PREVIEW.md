# Grid Script Preview

Grid Script has a dry-run preview layer.

Preview mode walks the parsed script and produces an ordered list of events and actions without executing world, inventory, economy, network, or browser operations.

This supports a future Creator Studio workflow:

1. Parse creator code.
2. Show errors and warnings.
3. Show requested capabilities.
4. Simulate event/action order.
5. Let the creator approve the result.
6. Send a versioned script to publication review.

Preview is deliberately separate from the runtime. It receives no host capabilities and cannot mutate the game.

This establishes the build → preview → review → publish pipeline.
