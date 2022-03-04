.. title:: clang-tidy - hooks-field-buf-len

hooks-field-buf-len
===================

Hook API `sto_subfield` requires non-empty input buffer.

This check warns about empty input in calls to `sto_subfield` (if it's
specified by a constant - variable parameter is ignored).

