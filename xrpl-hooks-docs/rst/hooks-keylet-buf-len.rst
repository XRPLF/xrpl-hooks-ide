.. title:: clang-tidy - hooks-keylet-buf-len

hooks-keylet-buf-len
====================

Computing a ripple keylet by calling `util_keylet` requires valid
parameters dependent on the keylet type.

This check does not fully parse these parameters, but warns about
invalid keylet type as well as buffer sizes that cannot be valid (if
they're specified by constants - variable parameters are ignored).
