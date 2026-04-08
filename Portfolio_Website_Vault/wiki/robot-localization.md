---
id: robot-localization
title: Robot Localization with Particle Filtering
tags: [projects, robotics, particle-filter, monte-carlo, localization, bayesian, ai, pacman, ghost]
type: wiki
sources: [resume]
last_updated: 2026-04-08
---

# Robot Localization with Particle Filtering

**Course:** Introduction to AI (Fall 2025), University of South Florida
**Report:** 31-page technical report with full implementation and analysis

## Project Overview

Justin implemented a Particle Filter (Monte Carlo Localization) algorithm to estimate the position of agents in a grid-based environment. The project explored two scenarios with different observability conditions: tracking a Pacman agent (direct distance observations) and tracking a Ghost agent (noisy sensor readings requiring probabilistic inference). The goal was to demonstrate how particle filtering enables state estimation under uncertainty.

## Algorithm: Particle Filtering

Particle filtering is a sequential Monte Carlo method for estimating the state of a dynamic system from noisy observations. The algorithm maintains a set of weighted particles (hypotheses about the agent's position) and iteratively updates them through:

1. **Prediction:** Move each particle according to the motion model (with noise)
2. **Update:** Reweight particles based on how well they match the current observation
3. **Resampling:** Draw new particles proportional to their weights, replacing low-weight particles with copies of high-weight ones

## Scenario 1: Pacman Tracking

- Direct distance observations from 4 sensors (one per wall direction)
- Each sensor returns the exact Manhattan distance to the nearest wall
- Particles initialized uniformly across the grid
- Motion model: Pacman moves one step in a cardinal direction with equal probability, with added Gaussian noise
- **Convergence: ~1 turn** to accurate tracking
- Average distance between estimated and true position dropped to ~3.5 after just 1 turn
- Fast convergence because distance observations are highly informative (4 independent measurements narrow possibilities quickly)

## Scenario 2: Ghost Tracking

- Noisy sensor readings: observations are probabilistic rather than exact
- Ghost can move through walls (unlike Pacman), expanding the state space
- Required **marginalization** approach for particle updates
- Observation model: P(observation | true_position) follows a distribution centered on the true distance
- **Convergence: Slow and gradual** compared to Pacman
- The noisy observations provide less information per step, requiring more iterations to converge
- Particles maintained broader distributions for longer, reflecting genuine uncertainty

## Implementation Details

- Grid-based 2D environment
- Number of particles: configurable (tested with various counts)
- Resampling method: systematic resampling to reduce variance
- Motion model included Gaussian noise to account for movement uncertainty
- Sensor model mapped observations to likelihood weights
- Belief state visualization showed particle cloud converging on true position over time

## Key Results

| Scenario | Convergence Speed | Observation Type | Difficulty |
|----------|-------------------|------------------|------------|
| Pacman | ~1 turn (fast) | Direct distance | Easy -- highly informative sensors |
| Ghost | Gradual (slow) | Noisy/probabilistic | Hard -- noisy sensors, wall-passing |

## Analysis and Insights

- The quality of sensor observations is the primary factor in convergence speed
- Direct observations (Pacman) enable rapid localization; noisy observations (Ghost) require many more iterations
- The marginalization approach for ghost tracking demonstrates proper Bayesian probabilistic reasoning
- Particle filters are well-suited for non-Gaussian, non-linear state estimation problems where Kalman filters would fail
- The project demonstrates core concepts in probabilistic robotics: belief representation, prediction-update cycles, and the trade-off between observation quality and localization accuracy

## Technologies Used

Python, NumPy, Bayesian Statistics, Monte Carlo Methods, Particle Filtering, Probability Theory
