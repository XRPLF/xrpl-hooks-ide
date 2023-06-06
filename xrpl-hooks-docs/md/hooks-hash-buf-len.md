# hooks-hash-buf-len

Functions [util_sha512h](https://xrpl-hooks.readme.io/reference/util_sha512h), [hook_hash](https://xrpl-hooks.readme.io/reference/hook_hash), [ledger_last_hash](https://xrpl-hooks.readme.io/reference/ledger_last_hash), [etxn_nonce](https://xrpl-hooks.readme.io/reference/etxn_nonce) and [ledger_nonce](https://xrpl-hooks.readme.io/reference/ledger_nonce) have fixed-size hash output.

This check warns about too-small size of their output buffer (if it's specified by a constant - variable parameter is ignored).
