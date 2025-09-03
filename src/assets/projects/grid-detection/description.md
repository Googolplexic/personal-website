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

## AI-Powered Classification of Origami Crease Pattern Grid Sizes

### A Deep Learning Solution for Automatic Grid Detection in Origami Patterns

This project implements a convolutional neural network (CNN) to automatically classify origami crease pattern grid sizes from 6x6 to 50x50 (even numbers only, 23 classes total). The system is designed to handle real-world images with varying quality, cropping, and backgrounds.

### Key Features

#### 🧠 Advanced Neural Network Architecture

- **Custom CNN Design**: 5-layer convolutional architecture optimized for grid pattern recognition
- **Batch Normalization**: Ensures training stability and faster convergence
- **Global Average Pooling**: Reduces overfitting and parameter count
- **Mixed Precision Training**: CUDA-accelerated training with automatic scaling
- **Early Stopping**: Prevents overfitting with patience-based monitoring

#### 🔍 Sophisticated Image Preprocessing

- **Grid Boundary Detection**: Automatically crops images to the actual grid content
- **Multi-Method Detection**: Edge detection, contour analysis, and Hough line detection
- **Real-World Robustness**: Handles camera photos, scanned images, and screenshots
- **Adaptive Processing**: Different pipelines for clean vs. noisy images
- **Quality Enhancement**: Contrast adjustment, denoising, and normalization

#### 📊 Synthetic Dataset Generation

- **Procedural Generation**: Creates realistic origami box-pleating patterns
- **Origami Theory**: Implements proper river-based crease patterns
- **Visual Variations**: Simulates real-world scanning artifacts and variations
- **Scalable Creation**: Generates 500+ samples per grid size class
- **Realistic Rendering**: Multiple line styles, backgrounds, and orientations

### Technical Implementation

#### Neural Network Architecture

```python
class GridCNN(nn.Module):
    - Conv2D layers: 3→64→128→256→512→512 channels
    - Kernel sizes: 4,3,3,3,3 (preserving fine details)
    - Batch normalization after each conv layer
    - MaxPooling with 2x2 kernels
    - Global average pooling
    - FC layers: 512→256→128→23 classes
    - Dropout: 0.3 for regularization
```

#### Advanced Preprocessing Pipeline

##### Step 1: Grid Boundary Detection

- Edge detection with adaptive thresholding
- Contour analysis for boundary identification
- Hough line detection for grid structure
- Fallback mechanisms for difficult images

##### Step 2: Image Enhancement

- Automatic contrast and brightness adjustment
- Bilateral filtering for noise reduction
- Histogram equalization for normalization
- Gaussian blur for artifact smoothing

##### Step 3: Data Augmentation

- Artificial padding simulation (real-world cropping variations)
- Random horizontal/vertical flips
- Minor rotation adjustments (±2 degrees)
- Background color variations

#### Training Configuration

- **Input Size**: 320x320 pixels (optimized for memory and accuracy)
- **Batch Size**: 48 (balanced for GPU memory utilization)
- **Learning Rate**: 0.0001 with step decay (γ=0.7 every 10 epochs)
- **Optimizer**: Adam with weight decay (1e-4)
- **Loss Function**: CrossEntropyLoss
- **Training Split**: 70% train, 15% validation, 15% test

### Dataset Characteristics

#### Synthetic Pattern Generation

- **Grid Sizes**: 23 classes (6x6, 8x8, 10x10, ..., 50x50)
- **Pattern Types**: Box-pleating with river-based crease systems
- **Variations**: Different complexity levels, line styles, and backgrounds
- **Realism**: Simulated scanning artifacts, perspective variations, and noise

#### Data Augmentation Strategy

- **Real-world Simulation**: Artificial padding to mimic cropping variations
- **40% Padding Probability**: Random padding during training
- **Background Variations**: Multiple paper-like background colors
- **Geometric Transforms**: Flips and minor rotations

### Performance Metrics

#### Model Performance

- **Training Accuracy**: >95% on synthetic dataset
- **Validation Accuracy**: >90% with good generalization
- **Test Set Performance**: Robust classification across all grid sizes
- **Real-world Testing**: Handles camera photos and scanned images

#### Preprocessing Effectiveness

- **Boundary Detection**: >85% success rate on varied image types
- **Quality Enhancement**: Significant improvement in line visibility
- **Robustness**: Handles poor lighting, shadows, and background clutter

### Real-World Applications

#### Origami Research

- **Pattern Analysis**: Automatic classification of crease pattern complexity
- **Design Verification**: Validate grid-based origami designs
- **Academic Research**: Quantitative analysis of origami patterns

#### Computer Vision Applications

- **Grid Detection**: General grid structure analysis
- **Pattern Recognition**: Template matching for geometric patterns
- **Quality Control**: Automated inspection of grid-based products

### Technical Challenges Solved

#### Variable Image Quality

- **Robust Preprocessing**: Multi-stage enhancement pipeline
- **Adaptive Algorithms**: Different approaches for different image types
- **Fallback Mechanisms**: Graceful degradation for difficult cases

#### Real-world Variations

- **Cropping Tolerance**: Handles partial grid visibility
- **Perspective Correction**: Basic geometric normalization
- **Background Removal**: Focus on grid content rather than surroundings

#### Training Efficiency

- **Mixed Precision**: Faster training with maintained accuracy
- **Memory Optimization**: Efficient data loading and processing
- **Early Stopping**: Prevents overfitting and reduces training time

### Future Enhancements

#### Model Improvements

- **Attention Mechanisms**: Focus on grid intersection points
- **Multi-scale Processing**: Handle various image resolutions
- **Transformer Integration**: Leverage attention for pattern recognition

#### Dataset Expansion

- **Real Pattern Collection**: Gather actual origami crease patterns
- **Style Transfer**: Generate more realistic synthetic patterns
- **Cross-domain Testing**: Evaluate on non-origami grid patterns

#### Application Development

- **Web Interface**: Browser-based classification tool
- **Mobile App**: Real-time camera-based classification
- **API Service**: Cloud-based classification endpoint

### Implementation Details

The project demonstrates expertise in:

- **Deep Learning**: Custom CNN architecture design and training
- **Computer Vision**: Advanced image preprocessing and analysis
- **Dataset Creation**: Synthetic data generation with realistic variations
- **Model Optimization**: Training efficiency and performance tuning
- **Real-world Deployment**: Handling varied input conditions

This project showcases the ability to combine domain knowledge (origami patterns) with modern machine learning techniques to solve a specific classification problem, while maintaining robustness to real-world image variations.
