# hooks-param-set-buf-len

Function [hook_param_set](https://xrpl-hooks.readme.io/reference/hook_param_set) expects limited-length name, fixed-length hash and limited-length value inputs.

This check warns about invalid sizes of input buffers (if they're specified by constants - variable parameters are ignored).

[Read more](https://xrpl-hooks.readme.io/docs/parameters)
