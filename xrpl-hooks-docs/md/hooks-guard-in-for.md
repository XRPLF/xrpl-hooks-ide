# hooks-guard-in-for

A guard is a marker that must be placed in your code at the top of each loop. Consider the following for-loop in C:

```c
  #define GUARD(maxiter) _g(__LINE__, (maxiter)+1)

  for (int i = 0; GUARD(3), i < 3; ++i)
```

<BR/>
This is the only way to satisfy the guard rule when using a for-loop in C.

[Read more](https://xrpl-hooks.readme.io/docs/loops-and-guarding)
