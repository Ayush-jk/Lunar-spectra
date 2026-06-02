# Lunar Spectra

Spectral classification of Chandrayaan-2 IIRS hyperspectral data using PCA, K-Means, and a CNN. Classifies the lunar surface into 5 mineralogical classes with 98.84% accuracy.

## What it does

Takes raw IIRS scene files (.qub + .hdr) and produces a full classified surface map. Each pixel is assigned one of 5 spectral classes based on its reflectance signature across 256 bands (800nm to 5000nm).

The 5 classes are validated using continuum-removal band depth analysis at 1µm and 2µm, the standard diagnostic absorption features for lunar minerals.

## Pipeline

```
Raw IIRS .qub + .hdr
  → Normalize → PCA (256 bands → 10 components, 98.3% variance retained)
  → K-Means clustering (k=5, labels for training)
  → CNN classifier (98.84% random split, 98.75% spatial generalization)
  → Classified surface map + spectral validation
```

## Results

| Metric | Value |
|---|---|
| Random split accuracy | 98.84% |
| Spatial generalization | 98.75% |
| Band depth validation | ✓ confirmed |

Spatial test: trained on top half of orbital strip, tested on bottom half. 0.09% drop confirms the model learned spectral features, not pixel position.

## Repo structure

```
modules/              Modular pipeline (run via main.ipynb)
  01_data_loading
  02_eda
  03_preprocessing
  04_clustering
  05_classification
  06_analysis
lunar-app/            Web interface
  backend/            FastAPI + ML inference
  frontend/           React + Recharts
main.ipynb            Runs full pipeline in sequence
```

## Web app

FastAPI backend + React frontend. Upload any IIRS scene and get back a classified map, pixel-level inspection, and spectral validation charts.

```bash
# Backend
cd lunar-app/backend && uvicorn main:app --reload

# Frontend
cd lunar-app/frontend && npm install && npm run dev
```

## Stack

Python, TensorFlow, scikit-learn, spectral, FastAPI, React, Recharts, Google Colab