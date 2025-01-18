---
title: box-pleating
summary: A Python package for creating, analyzing, and validating box-pleated origami patterns.
SEOdescription: A comprehensive Python library for working with box-pleated origami patterns, featuring FOLD format support and flat-foldability validation.
keywords:
- box pleating
- crease pattern
- origami
- geometric constructions
- computational origami
- paper folding
- FOLD format
- flat-foldability
- origami validation
- Python package
- pattern generation
- geometric validation
technologies: 
- Python
- FOLD format
- PyPI
githubUrl: https://github.com/Googolplexic/box-pleating
liveUrl: https://pypi.org/project/box-pleating/1.0.1/
startDate: 2024-11
endDate: 2024-11
---

## A Python package for creating and validating box-pleated origami patterns

`box-pleating` is a Python package that provides tools for working with box-pleating origami patterns. It includes features for pattern creation, validation, and FOLD format conversion. It was meant to be a basis for an AI origami crease pattern generation project, but we'll see where it goes from here.

### Key Features

- **Pattern Creation**
  - Create patterns on customizable grids
  - Add mountain, valley, and border folds
  - Automatic intersection handling
  - Grid-based validation (45° and 90° angles)

- **Pattern Validation**
  - Flat-foldability checking
    - Kawasaki's theorem implementation
    - Maekawa's theorem verification
  - Crease intersection detection
  - Grid alignment verification

- **FOLD Format Integration**
  - Import from FOLD format
  - Export to FOLD format
  - Automatic grid size optimization
  - Redundant vertex removal

### Technical Implementation

The package implements several key algorithms and features:

- **Validation Algorithms**
  - Kawasaki's theorem (alternating angles sum to 180°)
  - Maekawa's theorem (mountain/valley crease difference is 2)
  - Grid alignment checking
  - Intersection detection

- **Pattern Management**
  - Efficient grid-based data structure
  - Automatic crease handling
  - Pattern cleanup utilities
  - FOLD format conversion
