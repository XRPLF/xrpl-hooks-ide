.. title:: clang-tidy - hooks-state-buf-len

hooks-state-buf-len
===================

Functions state and state_set accept fixed-size Hook State key.

This check warns about invalid size of its input buffer (if it's
specified by a constant - variable parameter is ignored).
