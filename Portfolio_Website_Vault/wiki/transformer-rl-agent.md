---
id: transformer-rl-agent
title: Transformer-Based Reinforcement Learning Agent
tags: [projects, reinforcement-learning, transformer, deep-learning, ai, decision-transformer]
type: wiki
sources: [resume]
last_updated: 2026-04-08
---

# Transformer-Based Reinforcement Learning Agent

**Course:** Graduate coursework, University of South Florida (Spring 2026)
**Status:** Current/Ongoing project

## Project Overview

Justin is building a reinforcement learning agent that leverages transformer architectures for sequential decision-making. This project applies the attention mechanisms and sequence modeling capabilities that power large language models to the domain of reinforcement learning.

## Technical Approach

- Uses transformer architecture adapted for RL decision-making
- Models the RL problem as sequence prediction: given a sequence of states, actions, and rewards, predict the next optimal action
- Inspired by the Decision Transformer paradigm where RL is reframed as conditional sequence modeling
- The agent learns policies by attending to past experience rather than through traditional value function estimation

## Key Concepts

- **Transformers in RL:** Applying self-attention mechanisms to model long-range dependencies in state-action-reward sequences
- **Sequence Modeling for Control:** Treating the RL problem as autoregressive generation conditioned on desired returns
- **Offline RL:** Learning from pre-collected experience data without online environment interaction

## Technologies Used

Python, PyTorch, Transformers, Reinforcement Learning, Deep Learning
