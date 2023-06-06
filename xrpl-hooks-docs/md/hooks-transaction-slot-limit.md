# hooks-transaction-slot-limit

Function [otxn_slot](https://xrpl-hooks.readme.io//reference/otxn_slot) takes a parameter specifying the accessed slot number. Value of this parameter is limited, and the function fails if the limit is exceeded.

This check warns about too-large values of the slot number (if it's specified by a constant - variable parameter is ignored).

[Read more](https://xrpl-hooks.readme.io//docs/slots-and-keylets)
