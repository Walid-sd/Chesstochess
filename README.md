# Chesstochess

A lightweight browser chess trainer built from scratch.

## Current build

- Responsive tactical-training interface
- Legal chess movement and king-safety validation
- Check, checkmate, and stalemate detection
- Castling and en passant
- Pawn promotion to queen
- 50-move draw and threefold-repetition detection
- Move history, undo, board flip, and move counter
- Tactical puzzle trainer with multi-step player/opponent lines
- Hints, retry/next puzzle flow, and local progress persistence
- Session attempts, hints, and accuracy tracking
- Puzzle result scoring
- Chess knowledge layer for openings and tactical motifs
- Sequence-aware opening recognition
- Static position recognition for forks, pins, skewers, and discovered attacks
- Optional browser-side Stockfish analysis for move quality and principal variation
- No backend or paid service required

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static web server.

The Stockfish coach is loaded from a public jsDelivr CDN when engine analysis is requested. If the browser blocks the worker or the CDN is unavailable, the core chess trainer remains usable.

## Architecture

The MVP intentionally uses plain HTML, CSS, and JavaScript with no build step or package manager. The application is split into:

- `index.html` — application structure and trainer UI
- `styles.css` — responsive visual system
- `app.js` — chess rules, trainer state, puzzles, persistence, and engine integration
- `chess-knowledge.js` — chess concepts, opening definitions, and position-pattern detection

## Deployment

Because the app is a static site, it can be deployed directly to any static hosting provider by publishing the repository root. No server-side runtime or database is required for the current build.

## Scope notes

The knowledge detectors are intentionally heuristic: they identify recognizable board patterns rather than proving that a tactic is objectively winning. Stockfish analysis is available separately when the browser engine loads successfully.

The current puzzle set is a compact demonstration set; expanding the puzzle library is the main content-level improvement after deployment.
