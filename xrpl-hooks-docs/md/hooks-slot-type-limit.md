# hooks-slot-type-limit

Hook API [slot_type](https://xrpl-hooks.readme.io/v2.0/reference/slot_type) takes a parameter specifying the accessed slot number. Value of this parameter is limited, and the function fails if the limit is exceeded.

This check warns about too-large values of the slot number as well as invalid values of the flags parameter (if they're specified by constants - variable parameters are ignored).

[Read more](https://xrpl-hooks.readme.io/v2.0/docs/slots-and-keylets)
