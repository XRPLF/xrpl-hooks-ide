# hooks-guard-in-while

Like for loops, while loops must have a guard in their condition:

```c

  #define GUARD(maxiter) _g(__LINE__, (maxiter)+1)

  int i = 0;
  while (GUARD(3), i < 3)
```

<BR/>
[Read more](https://xrpl-hooks.readme.io//docs/loops-and-guarding)
