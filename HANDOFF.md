# Chesstochess — Buyer Handoff Guide

## What the product is

Chesstochess is a static browser chess-training product. The current v1 combines computer play, tactical puzzles, browser-side engine analysis, deterministic motif detection, local progress tracking, and evidence-driven adaptive training.

## Production

Current demo: https://chesstochess.netlify.app

The application is deployed from the repository and does not require a server-side runtime for v1.

## Required infrastructure

For the current release:

- static web hosting
- a modern browser
- internet access when the configured Stockfish CDN asset must be loaded

Not required by the current architecture:

- database
- authentication provider
- paid AI API
- payment processor
- serverless/backend functions
- deployment environment variables

## First-day handoff checklist

1. Obtain repository ownership/access.
2. Connect the repository to the buyer's preferred static host.
3. Publish the repository root.
4. Confirm the Home, Play, Analyze, and Training flows.
5. Confirm the browser can load the configured Stockfish resource.
6. Replace branding, metadata, analytics, or domain configuration as required.
7. If a custom domain is included in a transaction, transfer it separately through the applicable registrar.

## Product data

Player history and preferences are stored in browser local storage. There is no central player database in v1.

This has two consequences:

- the application can operate without account infrastructure;
- progress does not automatically follow a user to another browser or device.

A buyer who wants accounts/cloud sync can add a backend later without replacing the core chess runtime.

## Adaptive-learning architecture

The current learning loop is:

**Play → Analyze → Explain → Learn → Train**

The weakness model does not label a player from a single mistake. It requires repeated evidence before producing a training focus. Adaptive training then filters the existing validated puzzle library rather than generating arbitrary chess positions.

Read `ADAPTIVE-LEARNING.md` before changing the evidence thresholds or motif detector rules.

## Customization map

### Branding and visual changes
Start with `index.html`, `styles.css`, and the supporting CSS files.

### Computer-play behavior
Start with `app.js` and the game/engine-related runtime code.

### Openings and chess concepts
Start with `chess-knowledge.js`.

### Puzzle content
Start with `puzzle-library.js`. New puzzles should be validated before being tagged for adaptive use.

### Tactical recognition
Start with `motif-detector.js`. New concepts should have deterministic rules and regression positions before being exposed as board-verified coaching.

### Adaptive recommendations
Start with `weakness-model.js` and `adaptive-training.js`.

### Player persistence
Start with `player-store.js`.

## Suggested commercial extensions

Potential buyer-led extensions include cloud accounts/sync, a larger licensed or original puzzle corpus, subscription tiers, richer analytics, mobile packaging, social/community features, additional opening courses, and self-hosted engine assets.

These are extension opportunities, not dependencies of the current release.

## External assets and transfer scope

Repository ownership does not automatically transfer external accounts. A transaction should explicitly state whether it includes any of the following:

- Netlify site/team ownership
- custom domain and registrar account
- analytics accounts/properties
- social accounts
- brand artwork stored outside the repository
- marketplace listing accounts
- email addresses

Never give a buyer personal account credentials. Use each service's ownership/team-transfer mechanisms where available.

## Verification after transfer

Before considering a handoff complete, test:

- Home loads first
- Play vs Computer starts correctly
- legal piece movement works
- computer responds
- game completion is recorded
- analysis can run when Stockfish loads
- progress persists after refresh
- Training opens
- puzzle moves advance correctly
- retry/next/hint/flip controls work
- adaptive training remains locked until sufficient evidence exists

## Support/custom development

If post-sale customization is offered, scope it separately from the asset transfer. Define requested changes, delivery criteria, number of revisions, timeline, and price in writing before starting additional work.
