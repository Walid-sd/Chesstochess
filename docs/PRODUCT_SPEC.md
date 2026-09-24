# Chesstochess 2.0 — Product Specification

## Product thesis

Chesstochess helps improving chess players understand what went wrong in their games, identify recurring weaknesses, and turn those weaknesses into targeted practice.

Core loop:

**PLAY → ANALYZE → FIND WEAKNESSES → TRAIN → TRACK IMPROVEMENT**

The product should remain useful without paid infrastructure. Stockfish stays browser-side where practical, and the first persistence layer stays local. Backend accounts, cloud sync, and payments are later optional layers rather than Phase 1 requirements.

## Target user

Primary: beginner/intermediate chess players who want a simpler improvement loop than manually moving between a game board, engine analysis, puzzle sites, and notes.

Secondary buyer: an entrepreneur, chess coach, chess content creator, or small education/gaming business that wants an acquisition-ready chess training foundation it can brand, extend, and monetize.

## Current foundation

The existing product already provides:
- Browser chess board and legal move handling
- Check, checkmate, stalemate, castling, en passant, promotion
- 50-move and threefold repetition handling
- Move history, undo, board flip
- Play vs Computer with browser-side Stockfish
- Tactical training with multi-step puzzle lines, hints, retry/next flows
- Local training progress/session statistics
- Opening and tactical-pattern knowledge layer
- Optional engine move-quality analysis
- Static deployment with no backend requirement

## Product principles

1. **Board first.** Analysis and training should support the chessboard, not bury it.
2. **Explain the next action.** Every analysis result should lead to a concrete training recommendation.
3. **No fabricated intelligence.** Advice must be derived from chess rules, Stockfish evaluation, or explicit heuristics and labeled accordingly.
4. **Local-first until cloud adds value.** Avoid recurring infrastructure costs in early phases.
5. **Buyer-transferable.** Features, data structures, setup, deployment, and limitations must be documented.
6. **Progress over vanity metrics.** Track useful learning signals: mistakes, motifs, puzzle accuracy, repeated weaknesses, and training completion.

## Phase roadmap

### Phase 1 — Player system (local-first)

Deliver a dashboard and durable local player record.

Data to persist:
- games played / wins / losses / draws
- completed game records and timestamps
- selected computer difficulty
- puzzles attempted / solved
- hints used
- puzzle accuracy
- motif/category performance
- training history
- recent activity

UX:
- Home becomes a player dashboard after first activity
- Continue Training CTA
- Play Computer CTA
- Recent games
- Training summary
- Weakness summary placeholder populated once enough evidence exists

Acceptance criteria:
- Refreshing the browser does not lose player progress
- New Game and puzzle sessions append activity records
- User can clear local data deliberately
- Existing Play and Training modes continue working

### Phase 2 — Serious tactics trainer

Replace the compact demonstration puzzle set with a scalable puzzle model.

Motifs:
- mate in 1 / mate in 2
- forks
- pins
- skewers
- discovered attacks
- hanging pieces
- deflection
- back-rank tactics
- defensive moves

Puzzle schema should support:
- id
- FEN/position
- side to move
- rating/difficulty
- motifs[]
- solution line
- explanation
- source/license metadata when applicable

UX:
- category filters
- difficulty filters
- streak
- hints
- explanation after solve
- puzzle history
- adaptive selection weighted toward weak motifs

### Phase 3 — Post-game analysis

After a completed game, provide an analysis session instead of only a result.

For each relevant move:
- engine evaluation before/after
- best move
- centipawn loss where meaningful
- classification: best/good/inaccuracy/mistake/blunder
- tactical motif tags when detected

Game summary:
- strongest phase
- largest mistakes
- missed tactical opportunities
- recurring weakness candidates
- CTA: Train this weakness

Analysis must be reproducible from the stored game and engine settings.

### Phase 4 — Personal training engine

Aggregate evidence across games and puzzles.

Weakness record:
- motif/category
- evidence count
- recent severity
- last occurrence
- training attempts
- training accuracy
- confidence level

Recommendation example:
> Knight forks — repeated misses in recent games. Practice 5 fork positions.

Do not claim a weakness from one noisy event. Require a minimum evidence threshold and expose the evidence behind recommendations.

### Phase 5 — Product polish

- onboarding
- dashboard hierarchy
- mobile board/workspace UX
- keyboard/focus accessibility
- empty/loading/error states
- engine unavailable state
- performance audit
- regression tests for rules, persistence, trainer, and analysis
- public landing page with clear value proposition

### Phase 6 — Buyer readiness

Acquisition package:
- complete source code
- design assets/styles
- architecture overview
- local setup instructions
- deployment instructions
- data model documentation
- third-party dependencies/licenses
- known limitations
- test instructions
- demo data/reset instructions
- handover checklist

### Phase 7 — Sale package

SideProjectors listing should transparently state:
- pre-revenue unless that changes
- actual traffic/users only if verified
- current hosting/operating costs
- exact included assets
- no custom domain unless acquired
- what is complete vs future roadmap
- reason for selling
- handover support included
- optional paid post-sale development available separately

## Monetization options for a future owner

Do not implement payments until product value is stronger. Potential models:
- free core + premium analysis/history
- subscription for adaptive training
- one-time lifetime plan
- coach/student version
- white-label/custom-branded acquisition

## Non-goals for early phases

- native iOS/Android apps
- multiplayer matchmaking
- social network/chat
- expensive hosted AI inference
- payment integration before product validation
- claims that heuristic tactical recognition is equivalent to engine proof

## Success criteria before listing for sale

Chesstochess is buyer-ready when:
1. Play, training, persistence, and analysis work reliably on desktop/mobile web.
2. The product has a coherent improvement loop rather than disconnected features.
3. Setup/deployment can be followed by a buyer without the original developer.
4. Third-party dependencies and licenses are documented.
5. Demo metrics are clearly separated from real user/business metrics.
6. The repository is clean and tests cover the highest-risk behavior.
7. The live demo accurately matches the listing.