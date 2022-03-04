.. title:: clang-tidy - hooks-detail-prereq

hooks-detail-prereq
===================

Hook API `etxn_details` serializes emit details, based on (i.a.) the
number of reserved transactions, so a call to it must be preceded by a
call to `etxn_reserve`.
