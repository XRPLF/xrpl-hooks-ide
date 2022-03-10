# hooks-transaction-hash-buf-len

Function [otxn_id](https://xrpl-hooks.readme.io/v2.0/reference/otxn_id) has fixed-size canonical hash output.

This check warns about too-small size of its output buffer (if it's specified by a constant - variable parameter is ignored).
