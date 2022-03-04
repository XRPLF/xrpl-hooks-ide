.. title:: clang-tidy - hooks-float-one-pure

hooks-float-one-pure
====================

Hooks can obtain XFL enclosing number 1 by calling the float_one
function. Since the number never changes, a more efficient way is to
use its precomputed value.
