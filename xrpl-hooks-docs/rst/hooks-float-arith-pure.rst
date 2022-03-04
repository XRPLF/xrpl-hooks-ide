.. title:: clang-tidy - hooks-float-arith-pure

hooks-float-arith-pure
======================

Hooks can compute floating-point values in XFL format by calling
functions `float_multiply`, `float_mulratio`, `float_negate`,
`float_sum`, `float_invert` and `float_divide` and access their
constituent parts by calling `float_exponent`, `float_mantissa` and
`float_sign`. If the inputs of the computation never change, a more
efficient way to do this is to precompute it.

This check warns about calls of the aforementioned functions with
constant inputs and in simple cases proposes to add a tracing
statement showing the computed value (so that the user can use it to
replace the call). It also checks that the divisor passed to
`float_divide`, `float_mulratio` and `float_invert` is not 0 (if it's
specified by a constant - variable parameters are ignored).
