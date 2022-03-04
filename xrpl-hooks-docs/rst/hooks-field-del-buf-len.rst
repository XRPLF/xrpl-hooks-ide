.. title:: clang-tidy - hooks-field-del-buf-len

hooks-field-del-buf-len
=======================

Erasing a field from STObject by calling `sto_erase` requires enough
space to serialize the new STObject into; the API also limits size of
the old object.

This check warns about insufficient output buffer space as well as
too-large value of the input STObject in calls to `sto_erase` (if
they're specified by constants - variable parameters are ignored).
