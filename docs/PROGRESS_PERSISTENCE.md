# Progress Persistence

## Score scale

`concept_progress.score` is stored on a canonical `0-100` scale.

- Domain score calculators return values in `0-100`.
- Repositories validate `score >= 0 && score <= 100`.
- SQLite enforces the same range with `chk_concept_progress_score_range`.
- Course progress averages stored scores directly, without multiplying or dividing by 100.

The migration `20260725203000_concept_progress_score_100` converts existing legacy values from `0-1` to `0-100` when `score <= 1`, preserves already-canonical values, and fails if existing data is outside `0-100`.

## Attempt and Progress Transaction

Answer submission persists the exercise attempt and concept progress through `attemptsRepository.submitWithProgress`.

This repository method runs a single SQLite transaction that:

- inserts the exercise attempt;
- inserts or updates the concept progress row for the concept;
- optionally updates the session exercise index when requested.

The study-session service uses this transactional boundary so a submitted answer cannot leave an attempt without its matching progress update.
