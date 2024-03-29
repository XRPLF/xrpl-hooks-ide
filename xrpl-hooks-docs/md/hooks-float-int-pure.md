# hooks-float-int-pure

Hooks can convert floating-point values in XFL format to integers by calling the [float_int](https://xrpl-hooks.readme.io/reference/float_int) function. If the inputs of this function never change, a more efficient way to do this is to precompute the integer value.

This check warns about calls of `float_int` with constant inputs as well as invalid values of the decimal places parameter (if it's specified by a constant - variable parameter is ignored).

[Read more](https://xrpl-hooks.readme.io/docs/floating-point-numbers-xfl)
