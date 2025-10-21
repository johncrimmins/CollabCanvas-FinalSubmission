# CollabCanvas — Project Brief

## Project Name
CollabCanvas v5 (Final Submission for Gauntlet)

## Overview
A real-time collaborative canvas application that enables small teams (4-5 users) to create and edit shapes and text together with highly responsive multiplayer behavior and reliable persistence.

## Core Problem Statement
Small teams need a simple, fast, and reliable collaborative canvas tool where:
- Local interactions feel instant and fluid
- Remote collaborators see smooth previews of ongoing changes
- State is never lost or corrupted across sessions
- The system handles up to 300 objects smoothly

## Solution Approach
A hybrid architecture combining:
- **Firestore** for durable truth (authoritative object state)
- **Realtime Database (RTDB)** for ephemeral signals (cursors, editing status, transform previews)
- **Local-first client** with Zustand that prioritizes: `localIntent ▷ preview ▷ truth`
- **Final-only text editing** (no keystroke sync)
- **Per-object versioning** for optimistic conflict resolution

## Success Criteria
1. Users complete "draw → move → edit text → refresh → continue" sessions without confusion or data loss
2. Interactions feel immediate for the actor; others see smooth motion previews
3. Sessions with 300 objects remain smooth (60 FPS feel) with 4-5 users
4. Refresh or reconnection never leaves ghost artifacts or stale editing indicators

## Scope Boundaries

### In Scope
- Authentication (Email/Password + Google)
- Presence system (who's online, named cursors, editing indicators)
- Canvas interactions: pan/zoom, create/move/resize/rotate shapes (rect/circle), text editing
- Multi-select (drag marquee + shift-click)
- Delete, duplicate, undo/redo (local-only)
- Predictable reconnection behavior

### Out of Scope
- Keystroke-level text synchronization
- CRDTs or complex conflict resolution (using simple per-object versioning instead)
- AI features, layers panel beyond z-index management
- Complex permissions (using simple "unlisted link" model)

## Key Constraints
- Must support 4-5 concurrent users smoothly
- Must handle 300+ simple objects at 60 FPS
- Preview latency must feel real-time (<150ms typical)
- Firestore writes must use per-object transactions with version checks
- Text commits only on blur/Enter, not per-keystroke

## Phases
1. **Phase 1 (Core Collaborative Canvas)**: Auth, presence, basic shapes, single-select, move/resize, previews, undo/redo
2. **Phase 2 (Text & Multi-Select Polish)**: Text objects with inline editor, multi-select with adaptive throttling, rotation handles

## Target Users
Small design/product teams working on early-stage ideation and collaborative sketching.

## Technical Architecture Reference
See `systemPatterns.md` for detailed architecture and `techContext.md` for stack details.

