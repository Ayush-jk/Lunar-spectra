# Spectral Classification of Chandrayaan-2 IIRS Data

## Project Overview
This project focuses on the spectral classification of Chandrayaan-2 Imaging Infrared Spectrometer (IIRS) data using machine learning techniques to enhance our understanding of the Moon's geological diversity. The solution combines advanced data processing, dimensionality reduction, clustering, deep learning, and visualization to analyze and classify lunar hyperspectral data.

## Key Features
- Processing and visualization of complex hyperspectral data 
- Dimensionality reduction using Principal Component Analysis
- Unsupervised clustering to identify distinct spectral classes
- CNN-based classification of lunar surface materials
- Visualization of spectral signatures and geological interpretation
- Mapping of classified results to lunar coordinates

## Technical Approach

### Data Processing
- Loading and verification of IIRS hyperspectral data (.qub format)
- Extraction of metadata from header files (.hdr format)
- Normalization and reshaping of high-dimensional spectral data

### Dimensionality Reduction
- Application of PCA to reduce 256 spectral bands to 10 principal components
- Preservation of ~96% of original data variance in the reduced space

### Machine Learning Pipeline
- Unsupervised K-means clustering to identify 5 distinct spectral classes
- Development of a CNN model with the following architecture:
  - Multiple convolutional layers (32 and 64 filters)
  - Max pooling layers
  - Dense layers for classification
- Training and validation with ~98-99% accuracy

### Visualization and Analysis
- Plotting of reflectance spectra at user-selected coordinates
- Display of lunar surface at various wavelength bands
- Generation of classified lunar surface maps
- Extraction and interpretation of spectral signatures for each class
- Geographical mapping of spectral classes

## Technologies Used
- Python for all data processing and analysis
- Google Colab as the development environment
- Libraries:
  - `spectral` for hyperspectral data processing
  - NumPy, Pandas for data manipulation
  - Matplotlib for visualization
  - scikit-learn for PCA and K-means clustering
  - TensorFlow/Keras for CNN implementation

## Results and Interpretation
The project successfully classified the lunar surface into five distinct classes:
1. **Mare Basalt**: Dark volcanic plains rich in iron and magnesium
2. **Highland Anorthosite**: Bright, ancient crustal material rich in calcium-plagioclase
3. **Impact Melt**: Material melted and re-solidified during meteor impacts
4. **Pyroclastic Deposit**: Volcanic ash and glass from explosive eruptions
5. **Mixed Terrain**: Areas with heterogeneous composition

## Impact and Applications
- Provides insights into lunar geological features and mineral composition
- Demonstrates the effectiveness of machine learning in processing hyperspectral data
- Creates a reusable pipeline for planetary remote sensing data analysis
- Supports future lunar exploration missions through improved understanding of surface composition
