# hooks-float-compare-pure

Hooks can compare floating-point values in XFL format by calling the [float_compare](https://xrpl-hooks.readme.io/reference/float_compare) function. If the inputs of the comparison never change, its result is fixed and the function need not be called.

This check warns about calls of `float_compare` with constant inputs as well as invalid values of the comparison mode parameter (if it's specified by a constant - variable parameter is ignored).

[Read more](https://xrpl-hooks.readme.io/docs/floating-point-numbers-xfl)
