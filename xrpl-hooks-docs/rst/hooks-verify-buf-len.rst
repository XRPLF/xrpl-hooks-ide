.. title:: clang-tidy - hooks-verify-buf-len

hooks-verify-buf-len
====================

Verifying a cryptographic signature by calling `util_verify` requires
valid public key & data signature.

This check does not fully parse these parameters, but warns about
their sizes that cannot be valid (if they're specified by constants -
variable parameters are ignored).

