-- The free week of Pro is no longer offered: nobody may start one. Weeks already running end on their own.
revoke execute on function public.start_trial() from authenticated;
