# hooks-state-buf-len

Functions [state](https://xrpl-hooks.readme.io/reference/state) and [state_set](https://xrpl-hooks.readme.io/reference/state_set) accept fixed-size Hook State key.

This check warns about invalid size of its input buffer (if it's specified by a constant - variable parameter is ignored).
