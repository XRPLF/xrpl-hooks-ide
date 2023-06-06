# hooks-array-buf-len

Hook API [sto_subarray](https://xrpl-hooks.readme.io//reference/sto_subarray) requires non-empty input buffer and takes a parameter specifying the array index, whose value is limited - the sought object cannot be found if the limit is exceeded.

This check warns about empty input as well as too-large values of the index specified in calls to `sto_subarray` (if they're specified by constants - variable parameters are ignored).

[Read more](https://xrpl-hooks.readme.io//docs/serialized-objects)
