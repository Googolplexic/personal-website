---
title: Origami Grid Detection
summary: AI-powered neural network for classifying origami crease pattern grid sizes from 6x6 to 50x50. Features advanced image preprocessing and synthetic dataset generation.
SEOdescription: Portfolio showcase of Origami Grid Detection - a CNN-based classifier for analyzing origami crease patterns. Built with PyTorch, featuring image preprocessing and grid boundary detection.
keywords:
- origami grid detection
- neural network classification
- PyTorch CNN
- image preprocessing
- computer vision
- origami crease patterns
- grid boundary detection
- machine learning
- pattern recognition
- synthetic dataset generation
technologies:
- Python
- PyTorch
- OpenCV
- NumPy
- Matplotlib
- PIL (Pillow)
- scikit-learn
- Seaborn
githubUrl: https://github.com/Googolplexic/grid-detection
startDate: 2025-07
tags:
- ai
- personal-project 
- origami
---

## Classifying origami crease pattern grid sizes with a CNN

This project uses a convolutional neural network to classify origami crease pattern grid sizes from 6x6 to 50x50 (even numbers only, 23 classes). The goal is to take an image of a crease pattern and figure out what grid size it's on, even if the image quality isn't great.

### How it works

The CNN is a 5-layer convolutional architecture (3 to 64 to 128 to 256 to 512 to 512 channels) with batch normalization, global average pooling, and fully connected layers down to 23 classes. It trains with mixed precision on CUDA and uses early stopping to prevent overfitting.

Before images hit the network, they go through a preprocessing pipeline that tries to detect the grid boundaries using edge detection, contour analysis, and Hough line detection. After cropping, the images get contrast adjustment, denoising, and normalization. The pipeline has fallback mechanisms for when images are particularly difficult.

### Synthetic dataset

Since there aren't many labeled images of origami crease patterns out there, I built a synthetic dataset generator. It creates realistic box-pleating patterns with proper river-based crease systems, then applies visual variations like different line styles, backgrounds, scanning artifacts, and perspective distortion. It generates 500+ samples per grid size class.

During training, images also get augmented with random padding (to simulate cropping variations), flips, and minor rotations.

### Results

The model gets over 95% training accuracy and over 90% validation accuracy on the synthetic dataset, and it handles real-world camera photos and scanned images reasonably well. The boundary detection preprocessing succeeds on over 85% of varied image types.
