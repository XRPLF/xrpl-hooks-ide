.. title:: clang-tidy - hooks-detail-buf-len

hooks-detail-buf-len
====================

Function `etxn_details` has fixed-size sfEmitDetails output.

This check warns about too-small size of its output buffer (if it's
specified by a constant - variable parameter is ignored).
