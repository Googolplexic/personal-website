---
title: box-pleating
summary: A Python package for creating, analyzing, and validating box-pleated origami patterns.
SEOdescription: Portfolio showcase of Python library for working with box-pleated origami patterns, featuring FOLD format support and flat-foldability validation.
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
tags:
- library
- origami
- personal-project
---

## A Python package for creating and validating box-pleated origami patterns

`box-pleating` is a Python package that provides tools for working with box-pleating origami patterns. It includes features for pattern creation, validation, and FOLD format conversion. It was meant to be a basis for an AI origami crease pattern generation project, but we'll see where it goes from here. :)

### What it does

You can create patterns on customizable grids with mountain, valley, and border folds. The package handles intersection detection automatically and validates that creases align to the grid at 45 and 90 degree angles.

For validation, it implements Kawasaki's theorem (alternating angles sum to 180) and Maekawa's theorem (mountain/valley crease difference is 2), along with crease intersection detection and grid alignment verification.

It also supports importing from and exporting to the FOLD format, with automatic grid size optimization and redundant vertex removal.
