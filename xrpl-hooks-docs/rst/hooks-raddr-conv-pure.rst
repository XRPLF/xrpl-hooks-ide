.. title:: clang-tidy - hooks-raddr-conv-pure

hooks-raddr-conv-pure
=====================

Hooks identify accounts by the 20 byte account ID, which can be
converted from a raddr using the `util_accid` function. If the raddr
never changes, a more efficient way to do this is precompute the
account-id from the raddr.

This check warns about calls of `util_accid` with constant input and
proposes to add a tracing statement showing the computed value (so
that the user can use it to replace the call).
