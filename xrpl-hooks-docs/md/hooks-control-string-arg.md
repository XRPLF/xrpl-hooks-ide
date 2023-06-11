# hooks-control-string-arg

Functions [accept](https://xrpl-hooks.readme.io/reference/accept) and [rollback](https://xrpl-hooks.readme.io/reference/rollback) take an optional string buffer stored outside the hook as its result message. This is useful for debugging but takes up space.

For a release version, this check warns about constant strings passed to `accept` and `rollback`.
