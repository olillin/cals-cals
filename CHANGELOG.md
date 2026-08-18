# Changelog

This project follows [Semantic Versioning](https://semver.org). This changelog
tracks user-facing changes to the project.

New minor versions are added to the bottom of the document as level 2 headings
with a version name. New patch versions are added as level 3 headings below
their parent version. Update details are freeform text and the latest minor
version is displayed on the website in the update notice.

## v2.1 Hello Tentavecka!

Just in time for the exams, v2.1 is here with a new feature! The calendar
builder is now able to add events for the exams of your subscribed courses.
These events are treated like any other so all of you who use calendar groups
can highlight your exams in the brightest colours so you won't miss them.
Internally this uses my library
[chalmers-search-exam](https://github.com/olillin/chalmers-search-exam), which
is also available as a CLI if that's something you want.

### v2.1.3

Handling of TimeEdit events that are missing properties has been improved. These
events are no longer skipped and you are able to sort them into groups, for
example filtering events that have no assigned activity or course. Events that
have no properties such as the exam week are called "global events" and are
excluded by default, but there is now also an option to keep this if you wish.

### v2.1.4

Exam subscriptions have been improved! Random exams should no longer appear when
subscribed to courses without exams.

## v2.2 A small update

This is a smaller update containing some minor changes and patches:

- The calendar builder now updates the TimeEdit calendar name and description
- Update notice is now generated from a
  [changelog](https://github.com/olillin/cals-cals/blob/main/CHANGELOG.md) file.
- Fixed bug where selecting "Keep global events" would also add exams to the
  calendar
- Fixed the calendar picker grid again
- Fixed some checkbox labels not being clickable
