# Chesstochess

**A local-first browser chess trainer with computer play, Stockfish-assisted analysis, deterministic tactical recognition, and evidence-driven adaptive training.**

Live demo: https://chesstochess.netlify.app

## Product overview

Chesstochess is more than a playable chess board. Its v1 improvement loop connects gameplay to training:

**Play → Analyze → Explain → Learn → Train**

A player can play against the computer, review meaningful move-quality evidence, build a persistent local learning profile, and receive targeted puzzle training after a weakness repeats across multiple analyzed games.

The current product runs as a static web application. There is no application backend, database, account system, or paid API requirement in the v1 architecture.

## Core features

### Play
- Play vs computer with selectable difficulty
- Legal chess movement and king-safety validation
- Check, checkmate, stalemate, castling, en passant, and promotion
- 50-move draw and threefold-repetition handling
- Responsive chess board with board flip and move history

### Tactical training
- Multi-step puzzle lines
- Hints, retry, next-puzzle flow, and session scoring
- Difficulty and motif filtering
- Local puzzle progress and training accuracy
- Adaptive training from verified repeated weaknesses

### Analysis and coaching
- Optional browser-side Stockfish analysis
- Move-quality/evaluation evidence and principal variation
- Saved pre/post FEN evidence for analyzed moves
- Deterministic board-geometry verification for supported tactical concepts
- Coaching explanations that distinguish engine-backed evidence from board-verified motifs

### Adaptive learning
- Persistent local player history
- Repeated-evidence weakness model
- Requires at least 3 events across at least 2 analyzed games before naming a training focus
- Compares the player's move with a reconstructed Stockfish best-move position for missed tactical opportunities
- Selects only existing validated puzzles for adaptive training

## Board-verified tactical vocabulary

The current deterministic analysis layer supports:

- captures
- direct checks
- forks
- absolute pins
- valuable hanging pieces
- skewers
- discovered attacks

The system deliberately avoids claiming unsupported multi-ply combinations or strategic concepts from engine scores alone. See [`ADAPTIVE-LEARNING.md`](ADAPTIVE-LEARNING.md) for the evidence rules and v1 correctness boundary.

## Chess knowledge

The separate knowledge layer provides opening/system recognition and tactical context. It is designed to make the product aware of recognizable chess methods and patterns while keeping engine evaluation and deterministic tactical verification separate.

## Architecture

Chesstochess intentionally has a low-complexity deployment architecture: plain HTML, CSS, and JavaScript with no build step or package manager required for the deployed application.

Important modules include:

- `index.html` — application shell and UI
- `styles.css` / supporting CSS — responsive visual system
- `app.js` — core board/game runtime
- `chess-knowledge.js` — openings and chess knowledge
- `puzzle-library.js` — validated training content
- `trainer-runtime-v2.js` — puzzle runtime
- `analysis-foundation.js` / `game-analysis.js` — analysis workflow
- `analysis-explanations.js` — evidence-based coaching copy
- `fen-move.js` — independent FEN/UCI move reconstruction
- `motif-detector.js` — deterministic tactical geometry
- `weakness-model.js` — persistent learning evidence
- `adaptive-training.js` — weakness-to-training selection
- `player-store.js` — local player history and preferences

## Data and privacy model

Player progress is stored locally in the browser. The current v1 does not require user accounts or transmit a player profile to an application backend.

Users can export their local player data and reset it from the interface.

## Running locally

Open `index.html` directly in a browser or serve the repository root with any static web server.

Stockfish functionality is browser-side and may depend on the configured public CDN resource. If that resource is unavailable or blocked, the core chess application remains usable while engine-dependent analysis may be unavailable.

## Deployment

The repository can be deployed as a static site by publishing the repository root. The current production demo is hosted on Netlify.

No environment variables are required for the current v1 deployment.

## Release status

**Adaptive Learning v1 — release QA passed on the production deployment.**

The production smoke test covered the Home → Play → Analyze → persistence → Training flow and the principal puzzle controls after the adaptive-learning consolidation release.

## Buyer / handoff notes

The codebase is suitable for several next-stage directions without requiring a rewrite:

- expand the validated puzzle catalog
- add additional deterministic motif detectors
- deepen opening/system coverage
- add accounts and cloud synchronization
- add mobile packaging or a dedicated mobile client
- introduce premium training/content tiers
- add richer progress analytics
- replace or self-host the engine asset if desired

The current architecture intentionally keeps the stable chess/training core independent from any future authentication, payments, or backend stack.

## Known v1 boundaries

- Adaptive recommendations are only as broad as the validated puzzle catalog.
- The deterministic motif detector is intentionally conservative; false negatives are preferred over confident incorrect coaching.
- Multi-ply tactical themes such as mating nets, deflection, attraction, interference, overloaded defenders, and clearance sacrifices are not currently claimed as verified motifs.
- Local-only persistence means progress does not synchronize across browsers/devices.
- Stockfish-dependent analysis requires the browser engine resource to load successfully.

## Ownership / customization

This repository contains the application source needed for the current static product. A future owner can modify the branding, interface, puzzle catalog, chess knowledge, training logic, deployment target, and monetization layer.

For a commercial transfer, hosting accounts, domain names, third-party accounts, analytics properties, and other external assets should be listed explicitly in the sale agreement rather than assumed to transfer with the source repository.
