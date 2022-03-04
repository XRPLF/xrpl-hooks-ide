.. title:: clang-tidy - hooks-burden-prereq

hooks-burden-prereq
===================

Hook API `etxn_burden` computes transaction burden, based on (i.a.)
the number of reserved transactions, so a call to it must be preceded
by a call to `etxn_reserve`.
