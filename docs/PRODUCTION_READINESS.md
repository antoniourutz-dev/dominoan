# Production readiness

## Release decision

The current build is a controlled pilot until every P0 item below is accepted.
It must not be deployed with real student data using the prototype SQL policies.

## P0 release gate

- [x] Remove automatic score deletion on application startup.
- [x] Restore identity from the Supabase session instead of local storage.
- [x] Queue a completed score locally before network submission.
- [x] Make scores immutable and restrict inserts to the authenticated owner.
- [x] Move teacher score resets behind an authorised database function.
- [ ] Apply `supabase/migrations/202610060001_secure_scores.sql` to staging.
- [ ] Provision teacher roles manually in `public.profiles` using an admin account.
- [ ] Verify login, completion, offline retry, duplicate retry and teacher reset in staging.
- [ ] Approve the student privacy notice, retention period and leaderboard policy.

## P1 quality gate

- [x] Unit tests for daily cycles and score calculation.
- [x] Native keyboard interaction for playable tiles.
- [x] Accessible modal semantics, focus containment/restoration and Escape handling.
- [x] Live announcements for errors, matches, penalties and score synchronisation.
- [x] Reduced-motion support, including the canvas celebration.
- [x] Local quality command runs TypeScript, tests and the production build.
- [x] Secondary views are code-split; the production build has no size warnings.
- [ ] Unit tests for complete game-state transitions.
- [ ] End-to-end tests for authentication, one-attempt enforcement and offline recovery.
- [ ] CI must run dependency installation and `npm run check` on every change.
- [ ] Manual WCAG review at 200% zoom and with a screen reader.
- [ ] Error monitoring must exclude names, email addresses and student identifiers.

## P2 learning design

- [x] Separate the ranked daily challenge from unlimited practice.
- [x] Unlock free practice only after the learner completes the daily challenge.
- [x] Practice results never write to the official leaderboard or daily lock.
- [x] Practice varies the starting tile and hand order between repetitions.
- [x] Practice builds validated 12-tile cycles from both Supabase synonym tables.
- [x] Practice content has a 24-hour local cache and an explicit retry state.
- [x] Dark and light color themes are selectable and persisted per browser.
- [x] Official attempts cannot reset after they have started.
- [ ] Add an end-of-session review of mistakes and requested hints.
- [ ] Add contextual sentence tasks to measure transfer, not only recognition.
- [ ] Add spaced repetition driven by each learner's error history.
- [ ] Validate vocabulary metadata and examples with a qualified Basque educator.

## Practice content migration

Apply `supabase/migrations/202610070001_practice_synonyms_rls.sql` after the core
security migration. It limits both synonym tables to authenticated, read-only
access and only exposes rows whose `active` flag is true.

## Operating rules

1. Supabase URL and anon key come from deployment environment variables.
2. Service-role credentials are never shipped to the browser.
3. Teacher access is a database role, not an email naming convention.
4. Scores cannot be updated after insertion; a teacher reset is an audited exception.
5. Production changes are promoted through staging after the release gate passes.

## Teacher provisioning after the security migration

The migration deliberately resets all legacy roles to `student`, because the old
application allowed clients to modify profile roles. After reviewing the intended
teacher account in Supabase Authentication, promote only that exact account from
the SQL editor:

```sql
update public.profiles
set role = 'teacher'
where id = '<AUTH_USER_UUID>'
  and lower(email) = lower('<VERIFIED_TEACHER_EMAIL>');
```

Confirm that exactly one intended row changed. Do not grant teacher access using
an email prefix or user-editable metadata.
