.. title:: clang-tidy - hooks-account-conv-pure

hooks-account-conv-pure
=======================

Hooks identify accounts by the 20 byte account ID, which can be
converted to an raddr using the `util_raddr` function. If the account
ID never changes, a more efficient way to do this is precompute the
raddr from the account ID.

This check warns about calls of `util_raddr` with constant input and
proposes to add a tracing statement showing the computed value (so
that the user can use it to replace the call).
