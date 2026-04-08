---
id: deep-learning-capstone
title: Deep Learning Computer Vision Capstone
tags: [projects, deep-learning, computer-vision, cnn, resnet, pytorch, ablation-study, music-genre, capstone]
type: wiki
sources: [resume, sop]
last_updated: 2026-04-08
---

# Deep Learning Computer Vision Capstone

**Course:** Graduate Capstone, University of South Florida (Spring 2026)
**Status:** Current/Ongoing project

## Project Overview

Justin's graduate capstone project at USF focuses on music genre classification from album artwork using deep learning. The core research question is whether residual connections (ResNets) provide meaningful improvements over standard CNNs for this image classification task, and how vanishing gradients affect training in deeper architectures.

## Research Focus: Ablation Study

- Conducting a systematic ablation study comparing ResNets vs. standard CNNs
- Analyzing vanishing gradient behavior across different network depths
- Measuring the impact of residual (skip) connections on training stability and convergence
- Evaluating classification accuracy on music genre prediction from album art

## Technical Approach

- **Input:** Album artwork images mapped to musical genre labels
- **Architectures compared:** Standard CNN (varying depths) vs. ResNet with skip connections
- **Framework:** PyTorch
- **Analysis:** Training curves, gradient flow visualization, accuracy comparison across depths
- Demonstrates how residual connections enable training of deeper networks by providing gradient shortcuts during backpropagation

## Key Concepts

- **Vanishing Gradients:** In deep networks, gradients can shrink exponentially during backpropagation, making early layers nearly impossible to train. This is a fundamental challenge in deep learning.
- **Residual Connections:** Skip connections that add the input of a block directly to its output (y = F(x) + x), providing an identity mapping that preserves gradient flow.
- **Ablation Study:** Systematically removing or modifying components (in this case, residual connections) to measure their individual contribution to model performance.

## Technologies Used

PyTorch, Computer Vision, Deep Learning, CNNs, ResNets, Image Classification, Ablation Studies
