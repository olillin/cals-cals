## v2.1 Hello Tentavecka!

Just in time for the exams, v2.1 is here with a new feature! The calendar
builder is now able to add events for the exams of your subscribed
courses. These events are treated like any other so all of you who use calendar groups can highlight your exams in
the brightest colours so you won't miss them. Internally
this uses my library
[chalmers-search-exam](https://github.com/olillin/chalmers-search-exam),
which is also available as a CLI if that's something you want.

### v2.1.3

Handling of TimeEdit events that are missing properties has been
improved. These events are no longer skipped and you are able to
sort them into groups, for example filtering events that have no
assigned activity or course. Events that have no properties such
as the exam week are called "global events" and are
excluded by default, but there is now also an option to keep
this if you wish.

### v2.1.4

Exam subscriptions have been improved! Random exams should no
longer appear when subscribed to courses without exams.
