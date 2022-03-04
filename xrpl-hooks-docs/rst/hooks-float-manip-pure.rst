.. title:: clang-tidy - hooks-float-manip-pure

hooks-float-manip-pure
======================

Hooks can directly manipulate floating-point values in XFL format by
calling functions `float_exponent_set`, `float_mantissa_set` and
`float_sign_set`. If the inputs of the update never change, a more
efficient way to do this is to precompute it.

This check warns about calls of the aforementioned functions with
constant inputs and in simple cases proposes to add a tracing
statement showing the computed value (so that the user can use it to
replace the call). It also checks documented bounds of the second
parameter of these functions (if it's specified by a constant -
variable parameter is ignored).
