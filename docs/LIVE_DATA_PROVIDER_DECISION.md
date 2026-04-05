# PlayerIQ Live Data Provider Decision

## Decision

For PlayerIQ Phase 4, the selected live-data provider is:

- `football-data.org`

## Why This Provider Was Chosen

PlayerIQ needs a live-data provider for:

- upcoming fixtures
- match status
- live/completed state updates
- scoreline updates

It does **not** need that provider to generate full event-level analytics, because completed-match analytics still come from PlayerIQ's historical event pipeline.

`football-data.org` is the best fit for the next implementation step because:

- it already aligns with the current backend configuration pattern via `FOOTBALL_DATA_API_TOKEN`
- it is easier to integrate for fixture, status, and score synchronization
- it is a cleaner first live-data step than jumping immediately into a premium enterprise feed

## Official References

- football-data.org quickstart: [https://www.football-data.org/documentation/quickstart](https://www.football-data.org/documentation/quickstart)

## Why Not Use Kaggle Or StatsBomb Open Data For Live Updates

These sources are useful, but not for live updates:

- Kaggle is a dataset distribution platform, not a live football API
- StatsBomb Open Data is historical open data, not a live football API

They should remain historical/training sources only.

## Why Not Pick Sportmonks As The First Provider

Sportmonks is a strong option and may be used later.

Official references:

- endpoints overview: [https://docs.sportmonks.com/football/endpoints-and-entities/endpoints](https://docs.sportmonks.com/football/endpoints-and-entities/endpoints)
- fixtures reference: [https://docs.sportmonks.com/v3/tutorials-and-guides/tutorials/livescores-and-fixtures/fixtures](https://docs.sportmonks.com/v3/tutorials-and-guides/tutorials/livescores-and-fixtures/fixtures)

It was not selected as the first integration because:

- PlayerIQ already has a token/config naming path that matches football-data.org
- Phase 4 should prioritize the simplest reliable live-fixture integration
- Sportmonks is broader and more powerful, but also adds more integration surface area than needed for the first live-data milestone

## Why Not Pick Hudl StatsBomb Live As The First Provider

Hudl StatsBomb Live is more aligned with premium event-level football data and is a strong future upgrade path.

Official reference:

- getting started: [https://live-data-api-guide.statsbomb.com/getting-started/](https://live-data-api-guide.statsbomb.com/getting-started/)

It was not selected first because:

- it is a higher-complexity and more enterprise-oriented integration
- it is better suited as a later premium upgrade after PlayerIQ proves its live fixtures pipeline

## Scope Of The football-data.org Integration

In PlayerIQ, `football-data.org` should be used for:

- upcoming fixtures
- live/completed/upcoming match states
- score synchronization
- competition and team metadata where useful

It should **not** be used as the source of full PlayerIQ match analytics unless equivalent event-level detail is available.

## Important Product Rule

PlayerIQ must separate:

- `fixture-only matches`
- `analytics-backed matches`

That means:

- upcoming and live fixtures can come from `football-data.org`
- completed matches can show final score/status from `football-data.org`
- full momentum, turning points, and deeper player-level match analysis must only appear when PlayerIQ also has event-level data for that match

## Resulting Architecture Decision

### Historical analytics layer

Use:

- StatsBomb Open Data
- Kaggle snapshots

For:

- training data
- completed event-backed analytics
- feature engineering
- model retraining

### Live fixture layer

Use:

- `football-data.org`

For:

- fixtures
- status
- scores
- competition updates

## What This Means For The Next Part

The next live-data implementation should:

1. add a backend config layer for `football-data.org`
2. build a reusable backend client for `football-data.org`
3. sync fixtures and match states into PlayerIQ's internal match directory
4. keep fixture-only matches separate from analytics-backed matches
