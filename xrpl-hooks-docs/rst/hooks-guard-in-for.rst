.. title:: clang-tidy - hooks-guard-in-for

hooks-guard-in-for
==================

Consider the following for-loop in C:

.. code-block:: c

  #define GUARD(maxiter) _g(__LINE__, (maxiter)+1)

  for (int i = 0; GUARD(3), i < 3; ++i)

This is the only way to satisfy the guard rule when using a for-loop
in C.
