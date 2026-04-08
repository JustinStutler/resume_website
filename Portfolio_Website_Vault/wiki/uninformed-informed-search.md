---
id: uninformed-informed-search
title: "Uninformed and Informed Search: Dominoes Puzzle"
tags: [projects, search-algorithms, a-star, iterative-deepening, heuristic, ai, dominoes, puzzle]
type: wiki
sources: [resume]
last_updated: 2026-04-08
---

# Uninformed and Informed Search: Dominoes Puzzle

**Course:** Introduction to AI (Fall 2025), University of South Florida
**Report:** 64-page technical report with full implementation, results, and analysis

## Project Overview

Justin implemented and compared two search algorithms -- Iterative Deepening (uninformed) and A* Search (informed) -- on a dominoes puzzle of increasing complexity (2x2, 3x3, and 4x4 grids). The goal was to demonstrate how heuristic-guided search dramatically outperforms blind search as problem complexity scales.

## The Dominoes Puzzle

- **State:** An N x N grid containing N^2 domino tiles. Each domino is a square with a number on each of its 4 sides.
- **Goal State:** Every side of a tile touching another tile's side must have the same numeric value (all adjacent sides match).
- **Actions:** Swap any two tiles (each swap is one move with cost 1).
- **Start State:** Randomly shuffled arrangement of tiles.

### State Space Size

| Grid | Tiles | Total States | Successors per State |
|------|-------|-------------|---------------------|
| 2x2 | 4 | 4! = 24 | 6 |
| 3x3 | 9 | 9! = 362,880 | 36 |
| 4x4 | 16 | 16! = 2.09 x 10^13 | 120 |

## Algorithm 1: Iterative Deepening (Uninformed)

- Depth-First Search with progressively increasing depth limits
- Explores the deepest unexpanded node first, up to the current depth limit
- If no solution found at depth d, restarts search at depth d+1
- Cutoff: 100,000 expanded nodes maximum per run
- **No heuristic** -- explores paths in a fixed manner regardless of how close a state is to the goal

## Algorithm 2: A* Search (Informed)

- Expands the node with the lowest f(n) = g(n) + h(n)
- **g(n):** Cost from start to current node (number of swaps made)
- **h(n):** Heuristic -- number of mismatched adjacent tile sides
- The heuristic is **not admissible** (can overestimate), meaning A* is not guaranteed to find the optimal solution, but it effectively prioritizes states closer to the goal
- Tie-breaking: prefer lower g(n); if still tied, random selection

### Heuristic Design

h(n) = number of mismatched (different numeric values) touching sides within the domino puzzle. A goal state has h(n) = 0. Higher h(n) means further from goal. This heuristic can overestimate because a single swap may fix multiple mismatched sides simultaneously.

## Experimental Results

Each algorithm was run 10 times on each grid size with random initial states.

| Puzzle Size | Iterative Deepening |  |  | A* Search |  |  |
|-------------|-----|------|------|-----|------|------|
|  | Avg States | Goals | Fails | Avg States | Goals | Fails |
| 2x2 | 2.8 | 10/10 | 0 | 3.7 | 10/10 | 0 |
| 3x3 | 44,166.2 | 9/10 | 1 | 228.5 | 10/10 | 0 |
| 4x4 | 100,000 | 0/10 | 10 | 16,155.1 | 10/10 | 0 |

### Key Observations

**2x2 Grid:** Both algorithms solved all 10 instances easily. Iterative Deepening actually expanded fewer nodes on average (2.8 vs 3.7) because the problem is trivial -- solutions are found in 1-2 moves.

**3x3 Grid:** A* dramatically outperformed ID. A* solved all 10 in an average of 228.5 expanded states vs. ID's 44,166.2. ID failed once by hitting the 100,000-node limit. A* solutions ranged from 4-8 moves.

**4x4 Grid:** Iterative Deepening failed all 10 attempts (always hit the 100,000-node limit). A* solved all 10, averaging 16,155.1 expanded states with solutions in 11-16 moves. Individual A* runs ranged from just 23 states expanded (11 moves) to 58,678 states (13 moves), showing high variance depending on the initial configuration.

## Analysis and Conclusions

- As problem complexity grows exponentially, informed search becomes essential
- The heuristic (mismatched sides) guides A* toward promising states, avoiding the blind exploration that cripples Iterative Deepening
- Even a non-admissible heuristic provides enormous practical benefit -- A* found solutions in all 30 test cases while ID failed 11 times
- A*'s branching factor matches the successor count (6, 36, 120) but the heuristic prunes the effective search space dramatically
- The 4x4 grid's state space (~2 x 10^13 states) is completely intractable for uninformed search but manageable for A* with a good heuristic

## Technologies Used

Python, A* Search Algorithm, Iterative Deepening DFS, Heuristic Design, Search Space Analysis
