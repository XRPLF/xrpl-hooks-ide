.. title:: clang-tidy - hooks-validate-buf-len

hooks-validate-buf-len
======================

Hook API `sto_validate` requires non-empty input buffer.

This check warns about empty input in calls to `sto_validate` (if it's
specified by a constant - variable parameter is ignored).

