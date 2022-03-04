.. title:: clang-tidy - hooks-slot-hash-buf-len

hooks-slot-hash-buf-len
=======================

Function `slot_id` has fixed-size canonical hash output.

This check warns about too-small size of its output buffer as well as
invalid values of the slot number parameter (if they're specified by
constants - variable parameters are ignored).
