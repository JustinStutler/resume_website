---
id: house-prices
title: "House Prices: Advanced Regression Techniques"
tags: [projects, regression, machine-learning, data-science, kaggle, catboost, xgboost, lightgbm, ensemble, feature-engineering, optuna]
type: wiki
sources: [resume]
last_updated: 2026-04-08
---

# House Prices: Advanced Regression Techniques

**Course:** Data Science (Fall 2025), University of South Florida
**Report:** 88-page comprehensive Jupyter notebook report
**Competition:** Kaggle "House Prices: Advanced Regression Techniques"

## Project Overview

Justin developed a complete end-to-end machine learning pipeline for the Kaggle House Prices competition, predicting residential home sale prices in Ames, Iowa. The project progressed from baseline models through extensive feature engineering, multiple model implementations, hyperparameter tuning with Optuna, outlier analysis, and finally an ensemble model. The 88-page report documents every step of the iterative improvement process.

## Dataset

- **Ames Housing Dataset:** 1,460 training samples, 1,459 test samples
- 79 explanatory features describing residential homes (lot size, quality, year built, neighborhood, etc.)
- Target: SalePrice (log-transformed for modeling as log1p)
- Mix of numerical and categorical features with significant missing data patterns

## Pipeline Architecture

### 1. Data Preprocessing
- `set_feature_types()`: Enforce correct dtypes for categorical vs. numerical features
- `clean()`: Handle missing values with domain-appropriate strategies
- `target_encode()`: Encode high-cardinality categoricals using target statistics
- `encode()`: One-hot encoding for remaining categoricals
- `engineer_features()`: Create interaction and polynomial features
- `impute()`: Final imputation pass for remaining NaNs
- `optimal_transform()`: Per-feature skew correction
- `drop_cols()`: Remove redundant/collinear features

### 2. Feature Engineering
- Created interaction features combining related variables
- Polynomial features for key predictors
- Total square footage aggregations
- Age-related derived features (YearBuilt, YearRemodAdd)
- Quality interaction terms

### 3. Skew Correction and Optimal Transforms
- Analyzed skewness of all numerical features using `create_skew_report()`
- Compared four transformation strategies: Scale Only, Quantile Transform, Log Transform, Box-Cox Transform
- Built a per-feature `transformation_map` assigning the best transform to each feature
- The `optimal_transform()` function applies the individually-selected best transform per feature

### 4. Multicollinearity Handling
- Identified highly correlated feature pairs using correlation matrices
- Tested dropping correlated features, OHE-encoded features, or both
- Compared RMSLE impact of each dropping strategy

## Models Implemented

### Baseline to Optimized Progression (RMSLE scores on cross-validation):

| Stage | Model | RMSLE |
|-------|-------|-------|
| Baseline | Normalized target only | 0.2306 |
| Linear Regression | + Feature Engineering | 0.1379 |
| Lasso | Optimized | 0.1404 |
| Random Forest | Optimized | 0.1376 |
| SVM | Standard | 0.1811 |
| SVM + PCA | With dimensionality reduction | 0.1809 |
| XGBoost | Gradient boosting | 0.1325 |
| LightGBM | Gradient boosting | 0.1341 |
| CatBoost | Gradient boosting | 0.1206 |

### Hyperparameter Tuning with Optuna
- Defined objective functions for all 8 models (LinearReg, Lasso, Ridge, SVR, RandomForest, XGBoost, LightGBM, CatBoost)
- 50 trials per model using Bayesian optimization
- Optimized hyperparameters included: learning rates, tree depths, regularization strengths, number of estimators, subsample ratios

### Best Optuna Parameters (selected):
- **CatBoost:** iterations=1495, learning_rate=0.04, depth=5, l2_leaf_reg=5.2, random_strength=8.8
- **XGBoost:** n_estimators=1159, learning_rate=0.03, max_depth=3, subsample=0.56
- **LightGBM:** n_estimators=1942, learning_rate=0.01, num_leaves=129, max_depth=3

## Outlier Analysis

A sophisticated outlier detection pipeline:
1. Identified top 50 worst predictions from CatBoost model
2. Built a separate Linear Regression pipeline and found its worst predictions
3. Found the intersection: 10 houses that confused **both** models (true outliers, not model-specific errors)
4. Tested individual outlier removal impact using `test_outlier_impact()` with 5-fold CV
5. Final optimized drop list: 14 data points that individually improved model performance

## Final Results with Optimized Data (Outliers Removed)

| Model | CV RMSE |
|-------|---------|
| XGBoost | 0.1010 |
| CatBoost | 0.1044 |
| LightGBM | 0.1091 |
| Lasso | 0.1169 |
| LinearReg | 0.1171 |
| Ridge | 0.1194 |
| RandomForest | 0.1231 |
| SVR | 0.1500 |

## Ensemble Model

- **StackingRegressor** with LassoCV as the meta-learner
- Base estimators: Linear Regression, Lasso, SVR, XGBoost, LightGBM, CatBoost, Random Forest
- Lasso meta-learner automatically selected the best combination by zeroing out weak contributors
- **Final ensemble weights:** XGBoost (0.67), CatBoost (0.23), Linear Regression (0.11) -- all others zeroed out
- **Ensemble RMSLE: 0.1031** (competitive Kaggle score)

## Score Progression Summary

The project tracked RMSLE at every stage, showing continuous improvement from 0.2306 (baseline) down to 0.1031 (final ensemble), a **55% reduction in error**. Key improvement drivers:
1. Log-transforming the target variable
2. Feature engineering
3. Gradient boosting models (especially CatBoost and XGBoost)
4. Optuna hyperparameter optimization
5. Outlier removal
6. Ensemble stacking

## Technologies Used

Python, Scikit-learn, XGBoost, LightGBM, CatBoost, Optuna, Pandas, NumPy, Matplotlib, Seaborn, Kaggle, StackingRegressor, Pipeline, ColumnTransformer, GridSearchCV, Cross-Validation
