.. title:: clang-tidy - hooks-slot-limit

hooks-slot-limit
================

Hook APIs `slot`, `slot_count`, `slot_clear`, `slot_size`,
`slot_float` and `trace_slot` take a parameter specifying the accessed
slot number. Value of this parameter is limited, and the functions
fail if the limit is exceeded.

This check warns about too-large values of the slot number (if it's
specified by a constant - variable parameter is ignored).
