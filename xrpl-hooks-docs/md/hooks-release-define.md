# hooks-release-define

Hook users can define a `NDEBUG` macro to disable tracing calls at compile time - but for the definition to be effective, it must be defined before including hook-specific headers.

This check warns when `NDEBUG` is defined too late.
