.. title:: clang-tidy - hooks-emit-buf-len

hooks-emit-buf-len
==================

Function `emit` has fixed-size transaction hash output.

This check warns about too-small size of its output buffer (if it's
specified by a constant - variable parameter is ignored).

