# hooks-raddr-conv-buf-len

Hook API [util_accid](https://xrpl-hooks.readme.io/v2.0/reference/util_accid) has upper limit on the length of its input (because it expects it to be a raddr) and fixed-size account ID output.

This check warns about invalid sizes of input and output parameters (if they're specified by constants - variable parameters are ignored).
