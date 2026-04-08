---
id: facial-recognition
title: "Facial Recognition: LDA vs SVM vs CNN"
tags: [projects, facial-recognition, lda, svm, cnn, computer-vision, deep-learning, machine-learning, olivetti-faces]
type: wiki
sources: [resume]
last_updated: 2026-04-08
---

# Facial Recognition: LDA vs SVM vs CNN

**Course:** Introduction to AI (Fall 2025), University of South Florida
**Report:** 28-page technical report with full implementation and analysis

## Project Overview

Justin conducted a comparative study of three machine learning approaches for facial recognition on the Olivetti Faces dataset (400 grayscale 64x64 images of 40 individuals, 10 images each). The goal was to evaluate traditional statistical methods (LDA), classical ML (SVM), and deep learning (CNN) on the same benchmark to understand their strengths, trade-offs, and failure modes.

## Dataset

- **Olivetti Faces Dataset** from AT&T Laboratories Cambridge
- 400 images total: 40 unique individuals, 10 images per person
- 64x64 grayscale images
- Split: 70% train, 15% validation, 15% test
- Variations include lighting, facial expressions, and accessories (glasses)

## Method 1: Linear Discriminant Analysis (LDA)

- Dimensionality reduction technique that finds linear combinations of features maximizing class separability
- Maximizes the ratio of between-class to within-class variance
- Used PCA as a preprocessing step to handle the high-dimensional pixel space (4,096 features per image)
- PCA reduced dimensions before LDA projection into (C-1) dimensional space where C = number of classes
- Nearest-centroid classification in the LDA-projected space
- **Final Accuracy: ~89.68%**
- Strengths: Fast training, interpretable, no hyperparameter tuning needed
- Weaknesses: Assumes linear separability, struggles with non-linear variations

## Method 2: Support Vector Machine (SVM)

- Applied PCA for dimensionality reduction, then SVM with RBF (Radial Basis Function) kernel
- RBF kernel maps data to higher-dimensional space for non-linear decision boundaries
- Hyperparameter tuning via GridSearchCV over C and gamma parameters
- **Final Accuracy: ~90.06% (Best overall)**
- Strengths: Effective in high-dimensional spaces, robust with proper kernel choice
- Weaknesses: Computationally expensive for large datasets, sensitive to hyperparameters

## Method 3: Convolutional Neural Network (CNN)

- Custom Sequential architecture designed for the small dataset
- Architecture: Conv2D layers with increasing filters, BatchNormalization, MaxPooling, Dropout, Dense layers
- Total parameters: 340,736
- Used data augmentation to combat overfitting on the small dataset (rotation, shift, zoom, flip)
- Early stopping triggered at epoch 4 due to validation loss plateau
- Training showed signs of overfitting despite augmentation -- the 400-image dataset is very small for deep learning
- **Final Accuracy: ~85.58%**
- Strengths: Automatically learns hierarchical features, no manual feature engineering
- Weaknesses: Requires large datasets, prone to overfitting on small data, longer training time

## Key Results and Rankings

| Rank | Method | Test Accuracy |
|------|--------|---------------|
| 1 | SVM (PCA + RBF) | ~90.06% |
| 2 | LDA (PCA + LDA) | ~89.68% |
| 3 | CNN | ~85.58% |

## Analysis and Insights

- Traditional methods (LDA, SVM) outperformed the CNN on this small dataset, demonstrating that deep learning is not always the best choice
- SVM's kernel trick allowed non-linear classification without the data requirements of deep learning
- LDA performed surprisingly well despite its linear assumption, showing the dataset's class structure is largely linearly separable after PCA
- CNN suffered from the small dataset size (only 280 training images for 40 classes = 7 per class)
- Confusion matrix analysis revealed specific individuals that each method struggled with, often due to large appearance variations (glasses, expressions)

## Technologies Used

Python, Scikit-learn, TensorFlow/Keras, NumPy, Matplotlib, PCA, GridSearchCV, Data Augmentation
