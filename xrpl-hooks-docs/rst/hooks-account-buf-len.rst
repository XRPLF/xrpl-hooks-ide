.. title:: clang-tidy - hooks-account-buf-len

hooks-account-buf-len
=====================

Function `hook_account` has fixed-size account ID output.

This check warns about too-small size of its output buffer (if it's
specified by a constant - variable parameter is ignored).

