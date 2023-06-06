# hooks-reserve-limit

Hook API [etxn_reserve](https://xrpl-hooks.readme.io//reference/etxn_reserve) takes a parameter specifying the number of transactions intended to emit from the calling hook. Value of this parameter is limited, and the function fails if the limit is exceeded.

This check warns about too-large values of the number of reserved transactions (if they're specified by a constant - variable parameter is ignored).

[Read more](https://xrpl-hooks.readme.io//docs/emitted-transactions)
