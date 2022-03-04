.. title:: clang-tidy - hooks-hash-buf-len

hooks-hash-buf-len
==================

Functions `util_sha512h`, `hook_hash`, `ledger_last_hash` and `nonce`
have fixed-size hash output.

This check warns about too-small size of their output buffer (if it's
specified by a constant - variable parameter is ignored).
