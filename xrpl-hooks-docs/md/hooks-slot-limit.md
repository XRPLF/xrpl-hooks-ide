# hooks-slot-limit

Hook APIs [slot](https://xrpl-hooks.readme.io/v2.0/reference/slot), [slot_count](https://xrpl-hooks.readme.io/v2.0/reference/slot_count), [slot_clear](https://xrpl-hooks.readme.io/v2.0/reference/slot_clear), [slot_size](https://xrpl-hooks.readme.io/v2.0/reference/slot_size), [slot_float](https://xrpl-hooks.readme.io/v2.0/reference/slot_float) and [trace_slot](https://xrpl-hooks.readme.io/v2.0/reference/trace_slot) take a parameter specifying the accessed slot number. Value of this parameter is limited, and the functions fail if the limit is exceeded.

This check warns about too-large values of the slot number (if it's specified by a constant - variable parameter is ignored).

[Read more](https://xrpl-hooks.readme.io/v2.0/docs/slots-and-keylets)
