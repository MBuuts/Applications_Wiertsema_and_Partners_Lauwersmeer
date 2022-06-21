# ViWi App - LandTrendr NDVI time series comparison

**This tool can be used to compute and visualize NDVI time series of a single Landsat pixel, an imported shapefile or drawn polygons.**

The scripts in this repository facilitate interactively running the LandTrendr (Landsat-based detection of Trends in Disturbance and Recovery) algorithms for clicked pixels, imported shapefiles or drawn polygons resulting in time series charts of NDVI. This repository includes three scripts (LandTrendAPP.js, LandTrendr-UI.js, and LandTrendr.js).

**Getting started:**

The tool packaged as a Google Earth Engine can be found here (link to Earth Engine App).

Alternatively, if you want to access the tool's source code, you can add the repository to your Google Earth Engine scripts by clicking here (link to add to repository), it will be dispalyer in the Reader section. The visualization tool is accessible by running LandTrendAPP.js.

Parameters for the LandTrendr algorithms can be adjusted in the left-hand panel, and clicking the map, inserting a shapefile or drawing
a polygon in the map will interactively display LandTrendr inputs and segmentation results for the selected pixel or area in a set of 
charts in the right-hand panel. 

Additional LandTrendr utilities are included in LandTrendr.js and a description of the original LandTrendr utilities can be found [here](https://emapr.github.io/LT-GEE/). A manual 
