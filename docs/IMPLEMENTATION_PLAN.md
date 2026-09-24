# Chesstochess 2.0 — Implementation Plan

## Phase 0 audit conclusion

The current repository is intentionally small and static: `index.html`, `styles.css`, `app.js`, and `chess-knowledge.js`. This made the first MVP cheap and deployable, but `app.js` now contains chess rules, UI state, trainer state, persistence, engine integration, and mode control in one file. The next product phases should avoid continuing to grow that single module.

The existing chess behavior should be preserved before structural refactoring. Product work should be incremental and regression-tested.

## Current strengths to preserve

- zero-build static deployment
- no mandatory backend or paid API
- browser-side Stockfish
- working legal chess interaction
- Play vs Computer
- tactical trainer
- local progress
- chess knowledge heuristics
- responsive visual system

## Current risks / debt

1. **Large `app.js` surface.** Rules, UI, engine and product state are tightly coupled.
2. **Puzzle content is embedded in application code.** This will not scale to a serious library.
3. **Persistence is trainer-oriented rather than a unified player record.**
4. **Engine lifecycle is stateful and asynchronous.** Analysis and bot play need one queue/controller before post-game analysis is added.
5. **No automated build/test harness is visible in the current root.** High-risk chess logic should gain deterministic tests before major refactors.
6. **Stockfish is loaded from a public CDN.** Buyer documentation must explain availability, versioning, licensing, and a self-host option.
7. **Static/local-first data means no cross-device account sync.** This is acceptable initially but must be explicit.

## Architecture target

Keep the app dependency-light, but split responsibilities into ES modules before Phase 3.

Suggested structure:

```text
/index.html
/styles/
  tokens.css
  app.css
/src/
  app.js
  chess/
    rules.js
    notation.js
    fen.js
  engine/
    stockfish.js
    analysis.js
  play/
    computer.js
    game-session.js
  training/
    trainer.js
    puzzle-store.js
    recommendation.js
  player/
    profile.js
    persistence.js
    stats.js
  knowledge/
    chess-knowledge.js
/data/
  puzzles.js (or JSON when served over HTTP)
/tests/
/docs/
```

Do not perform a large rewrite in one commit. Extract one responsibility at a time with behavior checks.

## Phase 1 implementation — Player system

### 1. Define versioned local schema

Storage key: `chesstochess.player.v1`

```js
{
  schemaVersion: 1,
  createdAt,
  updatedAt,
  preferences: {
    botDifficulty: 'medium',
    boardFlipped: false
  },
  totals: {
    games: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    puzzlesAttempted: 0,
    puzzlesSolved: 0,
    hintsUsed: 0
  },
  motifStats: {
    fork: {attempts: 0, solved: 0},
    pin: {attempts: 0, solved: 0}
  },
  games: [],
  trainingSessions: [],
  recentActivity: []
}
```

Bound history arrays to prevent uncontrolled localStorage growth.

### 2. Game records

Record on game completion:
- id
- startedAt / completedAt
- result
- opponent type/difficulty
- move list
- final FEN
- termination reason
- analysis status (`not_analyzed`, later `complete`)

### 3. Training records

Record:
- puzzle id
- motifs
- started/completed timestamps
- solved
- wrong attempts
- hints
- accuracy

### 4. Dashboard

Add dashboard cards without removing the current home choice:
- record W/L/D
- puzzles solved
- training accuracy
- recent activity
- Continue Training
- Play Computer
- Weaknesses: "More evidence needed" until Phase 4 threshold is met

### 5. Settings/data controls

- reset local progress with confirmation
- export player data as JSON
- import can wait unless useful for handover/testing

## Phase 1 regression checklist

Play:
- white legal move executes
- bot responds
- new game resets transient state but not player history
- undo still works
- checkmate/stalemate/draw record exactly once

Training:
- correct move advances
- wrong move records attempt
- hint records usage
- solved puzzle records once
- retry does not double-count a solved result

Persistence:
- refresh restores totals/history/preferences
- malformed/old storage fails safely
- reset clears only Chesstochess-owned keys

## Phase 2 implementation — Puzzle library

Move puzzle data out of `app.js`.

Introduce validation at load time:
- required fields
- legal side-to-move
- solution source square contains expected color
- every scripted move is legal when replayed
- unique ids
- known motifs

Before importing external puzzle data, verify its license permits redistribution with a sold project.

## Phase 3 implementation — Analysis controller

Create a single Stockfish controller responsible for:
- initialization
- ready state
- one active request
- cancellation
- timeout
- structured result
- engine unavailable error

Post-game analysis should replay the stored game from its initial position and evaluate positions sequentially. Never run multiple uncontrolled engine requests through the current global callback state.

## Phase 4 implementation — Weakness model

Start deterministic, not generative.

Evidence sources:
- puzzle failures by motif
- blunders/mistakes tagged by tactical detector
- missed tactical opportunities

Recommendation score can combine:
- frequency
- severity
- recency
- training accuracy

Require multiple observations before showing a named weakness.

## Phase 5 implementation — UX/product QA

Run explicit checks at:
- 360px mobile
- 768px tablet
- common laptop viewport
- large desktop

Audit:
- board visibility
- touch target sizes
- keyboard navigation
- focus states
- contrast
- engine loading/failure messaging
- no horizontal overflow
- no mode-specific controls leaking into another mode

## Phase 6 implementation — Acquisition package

Create:
- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/HANDOVER.md`
- `docs/THIRD_PARTY.md`
- `docs/KNOWN_LIMITATIONS.md`
- `CHANGELOG.md`

README should become buyer/developer friendly, with a short product overview followed by setup, architecture, testing, deployment, and acquisition notes.

## Sale-readiness rule

Do not describe the project as production SaaS merely because it is deployed. Until accounts/backend/payment exist, describe it accurately as a functional local-first browser chess training product / acquisition-ready web product.

## Immediate next build step

**Phase 1A: introduce the versioned player persistence layer and dashboard stats while preserving all existing Play and Training behavior.**

Do this before adding more puzzle content or post-game analysis.