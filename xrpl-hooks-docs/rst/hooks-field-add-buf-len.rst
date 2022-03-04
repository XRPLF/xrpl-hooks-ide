.. title:: clang-tidy - hooks-field-add-buf-len

hooks-field-add-buf-len
=======================

Emplacing a new field into STObject by calling `sto_emplace` requires
enough space to serialize the new STObject into; the API also limits
sizes of the old object and field.

This check warns about insufficient output buffer space as well as
too-large values of the inputs in calls to `sto_emplace` (if they're
specified by constants - variable parameters are ignored).
