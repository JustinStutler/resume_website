---
id: projects
title: Academic and Personal Projects
tags: [projects, computer-vision, deep-learning, housing, robotics, capstone, cnn, resnet, particle-filter, search, kaggle, facial-recognition, reinforcement-learning, transformer, openclaw, clip, album-art, connect-4, dqn, self-play, pettingzoo]
type: wiki
sources: [resume, sop]
last_updated: 2026-04-08
---

# Justin's Academic and Personal Projects

Justin has completed numerous technical projects spanning AI, machine learning, data science, computer vision, and web development. Each project below has a dedicated detailed page in this knowledge base with full technical breakdowns.

## Deep Learning Computer Vision Capstone: Song Genre from Album Art (Spring 2026)

**Music Genre Classification from Album Art** -- Justin's graduate capstone project at USF. Systematic ablation study comparing ResNets vs. standard CNNs (CNN-10, CNN-18, ResNet-10, ResNet-18) across four training conditions (baseline, batch normalization, data augmentation, dropout) on the 20k Album Covers dataset (20 genres). 17 total model runs. Best custom model: CNN-18 with Dropout (Top-1 ~0.198). CLIP linear probing foundation model comparison achieved Top-1 ~0.4445. **Technologies:** PyTorch, Computer Vision, Deep Learning, ResNets, CNNs, CLIP, Kaggle. *See detailed page: deep-learning-capstone*

## Transformer-Based Reinforcement Learning Agent: Connect 4 (Spring 2026 - Current)

Building a Transformer DQN agent to play Connect 4 through self-play using Deep Q-Learning. Compares Transformer DQN vs. MLP DQN baseline, heuristic agent, random agent, and a pretrained Decision Transformer foundation model. Evaluates reward shaping, history stacking, and prioritized experience replay techniques via round-robin tournament with Elo ratings. Uses PettingZoo Connect 4 environment with 42-token board sequence input and self-attention for spatial pattern learning. **Technologies:** Python, PyTorch, Transformers, Reinforcement Learning, DQN, PettingZoo. *See detailed page: transformer-rl-agent*

## AI Personal Assistant with OpenClaw (Current)

Personal project building an AI assistant using the OpenClaw agent framework, exploring agentic AI patterns including tool use, planning, and multi-step reasoning. **Technologies:** Python, OpenClaw, Agentic AI. *See detailed page: ai-personal-assistant*

## House Prices: Advanced Regression Techniques (Fall 2025)

**Kaggle Competition / Data Science Project** at USF. Comprehensive 88-page ML pipeline for predicting house prices. Implemented 8 models (Linear Regression, Lasso, Ridge, SVM, Random Forest, XGBoost, LightGBM, CatBoost), Optuna hyperparameter tuning, sophisticated outlier analysis, and a StackingRegressor ensemble. Achieved RMSLE of 0.1031 -- a 55% improvement from baseline. **Best single model:** XGBoost (0.1010 RMSE after outlier removal). **Technologies:** Python, Scikit-learn, XGBoost, LightGBM, CatBoost, Optuna, Pandas, Seaborn. *See detailed page: house-prices*

## Facial Recognition: LDA vs SVM vs CNN (Fall 2025)

**Intro to AI Project** at USF. Comparative study of three ML approaches on the Olivetti Faces dataset (400 images, 40 individuals). SVM achieved best accuracy (~90.06%), followed by LDA (~89.68%), with CNN at ~85.58% -- demonstrating that traditional methods can outperform deep learning on small datasets. 28-page report. **Technologies:** Python, Scikit-learn, TensorFlow/Keras, PCA, GridSearchCV. *See detailed page: facial-recognition*

## Robot Localization with Particle Filtering (Fall 2025)

**Intro to AI Project** at USF. Implemented Monte Carlo Localization for tracking agents in a grid environment. Compared Pacman tracking (direct observations, fast convergence in ~1 turn) vs. Ghost tracking (noisy sensors, slow convergence). 31-page report demonstrating Bayesian probabilistic reasoning. **Technologies:** Python, NumPy, Bayesian Statistics, Monte Carlo Methods. *See detailed page: robot-localization*

## Uninformed and Informed Search: Dominoes Puzzle (Fall 2025)

**Intro to AI Project** at USF. Compared Iterative Deepening (uninformed) vs. A* Search (informed) on dominoes puzzles across 2x2, 3x3, and 4x4 grids. A* solved all 30 test cases; Iterative Deepening failed 11/30. On 4x4 grids (2x10^13 state space), A* averaged 16,155 expanded states while ID hit the 100,000 cutoff every time. 64-page report. **Technologies:** Python, A* Search, Iterative Deepening, Heuristic Design. *See detailed page: uninformed-informed-search*

## Senior Capstone (Spring 2024)

**BSIS Senior Capstone** at USF. Built a full-stack PHP/MySQL application with comprehensive CRUD data handling as the culmination of the undergraduate Information Science program. **Technologies:** PHP, MySQL, HTML/CSS, JavaScript

## AI Portfolio Website (Ongoing)

This website itself is one of Justin's projects -- an AI-powered portfolio site where visitors can chat with an AI assistant to learn about Justin. Built with a Flask backend, vanilla JavaScript frontend, powered by Google Gemini with an Obsidian vault-based RAG knowledge system. **Technologies:** Python, Flask, JavaScript, Google Gemini API, Markdown/Obsidian
