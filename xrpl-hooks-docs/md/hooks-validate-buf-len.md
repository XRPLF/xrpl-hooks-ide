# hooks-validate-buf-len

Hook API [sto_validate](https://xrpl-hooks.readme.io//reference/sto_validate) requires non-empty input buffer.

This check warns about empty input in calls to `sto_validate` (if it's specified by a constant - variable parameter is ignored).

[Read more](https://xrpl-hooks.readme.io//docs/serialized-objects)
