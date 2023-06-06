# hooks-guard-call-non-const

Only compile-time constants can be used as an argument in loop GUARD call. This check warns if a non compile-time constant is used. 
It also checks whether a compile-time constant is used as a first argument of `_g()` call and whether it is a unique value. If not - it warns.

[Read more](https://xrpl-hooks.readme.io/docs/loops-and-guarding)
