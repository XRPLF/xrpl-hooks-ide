# hooks-hash-buf-len

Functions [util_sha512h](https://xrpl-hooks.readme.io/v2.0/reference/util_sha512h), [hook_hash](https://xrpl-hooks.readme.io/v2.0/reference/hook_hash), [ledger_last_hash](https://xrpl-hooks.readme.io/v2.0/reference/ledger_last_hash), [etxn_nonce](https://xrpl-hooks.readme.io/v2.0/reference/etxn_nonce) and [ledger_nonce](https://xrpl-hooks.readme.io/v2.0/reference/ledger_nonce) have fixed-size hash output.

This check warns about too-small size of their output buffer (if it's specified by a constant - variable parameter is ignored).
