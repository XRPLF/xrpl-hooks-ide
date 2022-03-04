.. title:: clang-tidy - hooks-emit-prereq

hooks-emit-prereq
=================

Before emitting a transaction using `emit` Hook API, a hook must set a
maximal count of transactions it plans to emit, by calling
`etxn_reserve`.
