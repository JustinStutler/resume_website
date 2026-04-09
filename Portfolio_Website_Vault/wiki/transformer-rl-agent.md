---
id: transformer-rl-agent
title: "Transformer-Based Reinforcement Learning Agent: Connect 4"
tags: [projects, reinforcement-learning, transformer, deep-learning, ai, decision-transformer, connect-4, dqn, self-play, pettingzoo]
type: wiki
sources: [resume]
last_updated: 2026-04-08
---

# Transformer-Based Reinforcement Learning Agent: Connect 4

**Course:** Deep Learning, University of South Florida (Spring 2026)
**Status:** Current/Ongoing project
**Proposal Date:** March 15, 2026
**Due Date:** May 2, 2026

## Project Overview

Justin is building a transformer-based reinforcement learning agent to play Connect 4 using Deep Q-Learning (DQN). The agent learns through self-play, collecting its own dataset of game experiences stored in a replay buffer. The project evaluates how techniques such as reward shaping, history stacking, and prioritized experience replay affect the agent's ability to learn strong Connect 4 strategies. A round-robin tournament compares the transformer-based DQN against baseline models and a foundation model (pretrained Decision Transformer).

## Game Environment

- **Game:** Connect 4 (6x7 grid, 42 cells)
- **Environment:** PettingZoo's Connect 4 classic game environment
- **State Representation:** Each cell is empty (0), player 1 (1), or player 2 (-1)
- **Action Space:** 7 possible actions (one per column)
- **MDP Formulation:** State (board config) -> Action (column selection) -> Reward (+1 win, -1 loss, 0 draw/non-terminal) -> Discount factor gamma = 0.99

## Agents Compared

### Transformer DQN (Proposed Model)
The core model replaces the standard MLP with a transformer encoder:
1. **Input Embedding:** Each of the 42 board cells embedded into a learned vector of dimension d_model
2. **Positional Encoding:** Spatial layout information added to embeddings
3. **Transformer Encoder Layers:** Multi-head self-attention + feedforward networks
4. **Pooling:** Mean pooling or CLS token into a single representation
5. **Output Head:** Linear layer mapping to 7 Q-values (one per column)

The self-attention mechanism allows the model to learn spatial relationships across the board -- diagonal threats, multi-step traps, and long-range patterns -- without requiring explicit spatial convolutions.

### MLP DQN (Baseline)
Identical DQN framework but uses fully connected layers with ReLU activations instead of self-attention. Takes the flattened 42-element board vector as input. Has no built-in mechanism for learning spatial relationships between board positions.

### Heuristic Agent
Rule-based strategy: blocks opponent's three-in-a-row threats, completes its own three-in-a-row, and prefers center columns otherwise. No learning involved.

### Random Agent
Selects a valid column uniformly at random. Serves as a sanity check.

### Decision Transformer (Foundation Model)
Pretrained Decision Transformer (Chen et al., 2021) adapted for Connect 4. Reframes RL as conditional sequence modeling -- given a desired return, past states, and past actions, predicts future actions. Pretrained on Atari/Gym environments with the transformer backbone frozen and only the adapted head trained on Connect 4 self-play data. Tests whether general game-playing representations transfer to a board game setting.

## Training Details

- **Training Method:** Self-play with experience replay
- **Optimizer:** Adam, learning rate 1e-4
- **Batch Size:** 64 sampled from replay buffer
- **Replay Buffer:** Up to 100,000 experiences, each as (state, action, reward, next_state, done)
- **Exploration:** Epsilon-greedy policy with decaying epsilon
- **Target Network:** Separate, slowly updating target network for stable Q-value targets via Bellman equation
- **Invalid Action Masking:** Full columns masked by setting Q-values to negative infinity
- **Hardware:** NVIDIA RTX 3080 GPU
- **Framework:** PyTorch, PettingZoo

## Improvement Techniques

1. **Reward Shaping:** Adding intermediate rewards for creating threats and blocking opponent threats to provide denser learning signal beyond sparse +1/-1 game outcomes
2. **History Stacking:** Providing the transformer with the last N board states rather than just the current state, leveraging the transformer's natural sequence processing to recognize evolving game patterns
3. **Prioritized Experience Replay:** Sampling experiences from the replay buffer based on their TD-error magnitude rather than uniformly, focusing learning on surprising or informative transitions

## Evaluation

- **Round-Robin Tournament:** Every agent plays every other agent, 200 games per matchup (100 as player 1, 100 as player 2)
- **Elo Rating:** Single scalar measure of playing strength derived from tournament results
- **Learning Curves:** Win rate over training episodes
- **Average Game Length:** Stronger agents should win in fewer moves
- **Win Rate as Player 1 vs Player 2:** Analyzing first-player advantage exploitation
- **Attention Visualization:** Visualizing which board positions the transformer attends to during decision-making
- **Loss Curves:** DQN MSE loss for convergence analysis

## Hypotheses

1. **Self-Attention Advantage:** Transformer DQN should outperform MLP DQN due to its ability to model spatial board relationships
2. **Reward Shaping:** Should accelerate training convergence with denser learning signal
3. **History Stacking:** Providing temporal context should improve strategic depth
4. **Foundation Model Transfer:** Decision Transformer should learn faster with limited data but ultimately underperform purpose-built Transformer DQN due to domain mismatch

## Technologies Used

Python, PyTorch, Transformers, Reinforcement Learning, Deep Q-Learning, PettingZoo, Self-Play, Decision Transformer, NVIDIA RTX 3080, CUDA
