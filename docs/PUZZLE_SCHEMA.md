# Chesstochess puzzle schema

Phase 2 moves tactical content out of the monolithic trainer runtime and into a catalog with explicit metadata and validation.

## Required fields

Each puzzle contains:

- `id`: stable unique identifier; never recycle an ID for a different position.
- `theme`: user-facing puzzle title.
- `difficulty`: currently `Beginner`, `Intermediate`, or `Advanced`.
- `icon`: compact visual marker.
- `side`: `w` or `b`, the side to move.
- `rating`: approximate training difficulty used for selection/filtering.
- `motifs`: one or more machine-readable tactical tags.
- `concept`: short learning objective.
- `position`: exactly 8 rows × 8 columns using the app's Unicode-piece representation and `null` for empty squares.
- `line`: ordered solution steps. Each step has `actor` (`player` or `opponent`) and a `[fromRow, fromCol, toRow, toCol]` move.
- `explain`: post-solve explanation.

Optional provenance fields such as `source` and `version` should be retained so a future buyer can audit or replace training content without changing trainer code.

## Runtime API

`puzzle-library.js` exposes `ChessPuzzleLibrary` with:

- `all`
- `getByIndex(index)`
- `getById(id)`
- `filter({ difficulty, motif, minRating, maxRating })`
- `stats()`
- `validatePuzzle(puzzle)`
- `validateLibrary()`

## Curation rules

1. Every position and every scripted response must be legal under the Chesstochess move engine before shipping.
2. A puzzle must teach one primary idea even if several motifs are tagged.
3. Explanations describe why the move works; they should not merely repeat notation.
4. Ratings are product metadata, not official FIDE/online ratings.
5. Do not import third-party puzzle databases unless their license and attribution requirements are documented and compatible with a future asset sale.
6. Reject duplicate IDs, malformed boards, malformed coordinates, missing motifs, and empty solution lines.

## Phase 2 rollout

The initial catalog intentionally mirrors the four already-tested trainer positions while establishing the scalable data contract. The next Phase 2 step switches the trainer runtime from its legacy inline array to this catalog, then expands content only after legality regression checks are automated. This avoids increasing puzzle count by copying unverified positions into a sellable product.