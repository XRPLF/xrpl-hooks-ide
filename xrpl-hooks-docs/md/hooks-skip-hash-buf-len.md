# hooks-skip-hash-buf-len

Function [hook_skip](https://xrpl-hooks.readme.io/v2.0/reference/hook_skip) has fixed-size canonical hash input.

This check warns about invalid size of its input buffer (if it's specified by a constant - variable parameter is ignored).
