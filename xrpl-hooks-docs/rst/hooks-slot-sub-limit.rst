.. title:: clang-tidy - hooks-slot-sub-limit

hooks-slot-sub-limit
====================

Hook APIs `slot_subarray` and `slot_subfield` take parameters
specifying parent and child slot numbers. Values of these parameters
are limited, and the functions fail if the limit is exceeded.

This check warns about too-large values of the slot numbers (if
they're specified by a constant - variable parameters are ignored).
