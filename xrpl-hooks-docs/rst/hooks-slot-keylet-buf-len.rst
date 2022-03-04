.. title:: clang-tidy - hooks-slot-keylet-buf-len

hooks-slot-keylet-buf-len
=========================

Function `slot_set` has structured keylet input.

This check does not parse the input, but warns about its sizes that
cannot be valid as well as invalid values of the slot number parameter
(if they're specified by constants - variable parameters are ignored).
