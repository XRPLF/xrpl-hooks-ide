.. title:: clang-tidy - hooks-fee-prereq

hooks-fee-prereq
================

Hook API `etxn_fee_base` estimates a transaction fee, based on (i.a.)
the number of reserved transactions, so a call to it must be preceded
by a call to `etxn_reserve`.
