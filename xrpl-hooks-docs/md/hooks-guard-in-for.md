# hooks-guard-in-for

Consider the following for-loop in C:

```c
#define GUARD(maxiter) _g(__LINE__, (maxiter)+1)
for (int i = 0; GUARD(3), i < 3; ++i)
```

To satisfy the guard rule when using a for-loop in C guard should be 
placed either in the condition part of the loop, or as a first call in loop body, e.g.

```c
for(int i = 0; i < 3; ++i) {
  GUARD(3);
}
```

In case of nested loops, the guard limit value should be 
multiplied by a number of iterations in each loop, e.g.

```c
for(int i = 0; GUARD(3), i < 3; ++i) {
  for (int j = 0; GUARD(17), j < 5; ++j)
}
```

```
(most descendant loop iterations + 1) * (each parent loops iterations) - 1
```

This check will warn if the GUARD call is missing and also it will propose a GUARD value based on the for loop initial value,
the increment and loop condition.

[Read more](https://xrpl-hooks.readme.io//docs/loops-and-guarding)
