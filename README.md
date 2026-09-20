# Chesstochess

A lightweight browser chess trainer built from scratch.

## Current build

- Responsive chessboard
- Legal movement for pawns, knights, bishops, rooks, queens, and kings
- Captures and pawn promotion to queen
- Move notation and move counter
- Undo
- Board flip
- Keyboard shortcut: Cmd/Ctrl + N
- Mobile-friendly layout
- No backend or paid service required

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static web server.

## Architecture

The current MVP intentionally uses plain HTML, CSS, and JavaScript so the repository has zero dependency/setup overhead. The next layer can add full chess rules, puzzles, persistence, accounts, engine analysis, and a dedicated training system without changing the visual foundation.
