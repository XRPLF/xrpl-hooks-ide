# hooks-trivial-cbak

A Hook may implement and export a [cbak](https://xrpl-hooks.readme.io/v2.0/reference/cbak) function.

But the function is optional, and defining it so that it doesn't do anything besides returning a constant value is unnecessary (except for some debugging scenarios) and just increases the hook size. This check warns about such implementations.

[Read more](https://xrpl-hooks.readme.io/v2.0/docs/compiling-hooks)
