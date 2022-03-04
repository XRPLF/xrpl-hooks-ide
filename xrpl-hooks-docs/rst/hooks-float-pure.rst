.. title:: clang-tidy - hooks-float-pure

hooks-float-pure
================

Hooks can use floating-point values in XFL format, creating them from
mantissa and exponent by calling the `float_set` function. If the
mantissa and exponent never change, a more efficient way to do this is
to precompute the floating-point value.

This check warns about calls of `float_set` with constant inputs and
proposes to add a tracing statement showing the computed value (so
that the user can use it to replace the call). In the special case of
0 mantissa and 0 exponent ("canonical 0"), a replacement value of 0 is
proposed directly, with no need to trace it.
