.. title:: clang-tidy - hooks-account-conv-buf-len

hooks-account-conv-buf-len
==========================

Function `util_raddr` has fixed-size account ID input.

This check warns unless the correct size is passed in the input size
parameter (if it's specified by a constant - variable parameter is
ignored).
