# Chesstochess adaptive learning loop

## Feature-complete v1 boundary

The local v1 loop is:

1. **Play** — the player completes a game against the computer.
2. **Analyze** — Stockfish-derived move data is stored with pre/post FEN positions.
3. **Explain** — deterministic board geometry verifies supported tactical motifs.
4. **Learn** — repeated mistakes and successful motifs are accumulated locally across analyzed games.
5. **Train** — once the evidence threshold is reached, the trainer selects matching positions from the validated puzzle library.

## Verified tactical vocabulary

The v1 deterministic detector supports:

- capture
- direct check
- fork
- absolute pin
- valuable hanging piece
- skewer
- discovered attack

A motif is not presented as board-verified unless its detector rule succeeds on the stored position.

## Weakness evidence threshold

A training focus requires at least **3 events across at least 2 analyzed games**. This prevents a single bad game from becoming a permanent player label.

Missed tactical motifs additionally require a materially different engine recommendation with at least **60 centipawns** of evaluation loss. The engine-best resulting position is reconstructed from the same pre-move FEN before motif comparison.

## Adaptive training safety

Adaptive training never synthesizes chess positions. It filters the existing validated puzzle library by motif tags. If a verified weakness has no matching puzzle, the UI should say that no validated mapping is available rather than substitute an unrelated puzzle.

## Current limitations

This v1 does not claim to verify multi-ply combinations or higher-order motifs such as deflection, attraction, interference, overloaded defenders, clearance sacrifices, mating nets, or strategic concepts merely from an engine score.

The motif detector is intentionally conservative. False negatives are preferable to confident but incorrect coaching.

## Release criterion

The Play → Analyze → Explain → Learn → Train loop is considered feature-complete for local v1 when:

- game play remains stable,
- analysis produces saved move/FEN evidence,
- supported motifs are deterministically verified,
- repeated evidence creates a training focus,
- matching validated puzzles are selected when available,
- unsupported claims are not generated,
- regression fixtures for FEN reconstruction and representative motif geometry remain passing.

Future work should expand coverage rather than weaken these evidence rules.