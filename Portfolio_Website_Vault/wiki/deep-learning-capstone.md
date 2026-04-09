---
id: deep-learning-capstone
title: "Deep Learning Computer Vision Capstone: Song Genre from Album Art"
tags: [projects, deep-learning, computer-vision, cnn, resnet, pytorch, ablation-study, music-genre, capstone, clip, album-art, image-classification, kaggle]
type: wiki
sources: [resume, sop]
last_updated: 2026-04-08
---

# Deep Learning Computer Vision Capstone: Song Genre from Album Art

**Course:** Graduate Capstone, University of South Florida (Spring 2026)
**Status:** Completed
**Date:** January 30, 2026 - March 1, 2026

## Project Overview

Justin's graduate capstone project at USF focuses on predicting music genre from album artwork using deep learning. The project is a systematic ablation study comparing ResNets vs. standard CNNs across multiple depths and regularization techniques, analyzing how vanishing gradients and residual connections affect image classification performance. A CLIP foundation model is included as a comparison baseline.

## Dataset

- **20k Album Covers within 20 Genres** from Kaggle
- 20 genre classes: Blues, Classical, Country, Death Metal, Doom Metal, Electronic, Folk, Grime, Heavy Metal, Hip Hop, Indie, Jazz, Latin, Pop, Punk, R&B, Rock, Soul, Techno, Thrash Metal
- Splits: stratified sampling 80/10/10 (train/val/test) with random_state=42
- No predefined splits in the original dataset; splits performed in the notebook

## Model Architectures

Four custom architectures were tested, each under four training conditions:

### Custom Models
- **CNN-10:** Standard convolutional neural network with 10 layers
- **CNN-18:** Standard convolutional neural network with 18 layers
- **ResNet-10:** Residual network with skip connections, 10 layers
- **ResNet-18:** Residual network with skip connections, 18 layers

### Foundation Model
- **CLIP (ViT-B/32):** OpenAI's contrastive language-image pretraining model used via linear probing -- freeze the CLIP vision encoder and train only a linear classification head on top

### Shared Components
All custom models share the same training loop, optimizer, and evaluation pipeline, enabling fair comparison.

## Training Conditions (Ablation Study)

Each of the 4 architectures was trained under 4 conditions, yielding 16 custom model runs plus 1 CLIP run (17 total):

1. **Baseline:** No regularization or augmentation
2. **Batch Normalization:** Added batch norm layers to stabilize and accelerate training
3. **Data Augmentation:** Random horizontal flips, rotations, color jitter applied during training
4. **Dropout:** Dropout layers added to reduce overfitting

## Training Configuration

- **Optimizer:** Adam
- **Learning Rate:** 0.001
- **Batch Size:** 32
- **Max Epochs:** 21
- **Early Stopping:** Patience of 5 on validation loss
- **Hardware:** NVIDIA GPU via CUDA
- **Framework:** PyTorch

## Results

- **Best Custom Model:** CNN-18 with Dropout -- Top-1 Accuracy ~0.198
- **CLIP Linear Probing:** Top-1 Accuracy ~0.4445

The CLIP foundation model significantly outperformed all custom models, demonstrating the power of large-scale pretraining on vision-language tasks. Among custom models, the CNN-18 with dropout achieved the best performance. The results highlight how challenging fine-grained visual classification can be (20 genre classes from album art) and how pretrained representations provide a strong advantage.

## Evaluation Metrics

- Top-1 and Top-k Accuracy
- Confusion matrices
- F1 Score, Precision, Recall
- Loss curves and accuracy comparison plots
- Top N most confused genre pairs

## Key Findings

- **Vanishing Gradients:** Analyzed gradient flow across different network depths; deeper networks without residual connections showed degraded training
- **Residual Connections:** Skip connections enabled more stable training in deeper architectures by preserving gradient flow during backpropagation
- **Regularization Impact:** Dropout provided the most consistent improvement among the tested techniques for custom models
- **Foundation Model Gap:** CLIP's pretrained representations yielded over 2x the accuracy of the best custom model, underscoring the value of transfer learning for this task

## Research Focus

- Systematic ablation study isolating the contribution of each architectural choice and regularization technique
- Quantitative comparison of vanishing gradient behavior across depths
- Foundation model vs. trained-from-scratch comparison

## Technologies Used

PyTorch, Computer Vision, Deep Learning, CNNs, ResNets, CLIP, Image Classification, Ablation Studies, Kaggle, CUDA, Adam Optimizer, Early Stopping
