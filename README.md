# Skimming the surface: Analysis of vegetation stress in Lauwersmeer using remote sensing techniques 

This repository contains all reports, data, and scripts created by students from Wageningen University & Research commissioned by Wiertsema & Partners to analyze vegetation stress in the Lauwersmeer area using remote sensing techniques.

##  Exploring NDVI time series using the NDVI slope and the LandTrendr application

**These tools can be used to compute and visualize NDVI time series of a single Landsat pixel or of a drawn polygon.**

The scripts in the `/data/GEE_scripts/...` folder of this repository facilitate interactively running the NDVI slope and the LandTrendr (Landsat-based detection of Trends in Disturbance and Recovery) applications. The Theil Sen Regression algorithm of the LandTrendr application for clicked pixels or drawn polygons results in time series charts of NDVI. This repository folder includes four scripts (`Ia03_APP.js`, `Ia02_UI.js`, `Ia01_Function.js` and `Ib01_APP.js`).

**Getting started:**

The NDVI slope application can be found [here](https://code.earthengine.google.com/462b5d8c3488a9754392e8a9e050a2f0).The LandTrendr tool packaged as a Google Earth Engine application can be found [here](https://code.earthengine.google.com/70cd203347663ea507e15368f6c759e1). A step-by-step manual (including download link) on how to use both of the applications can be found [here](https://github.com/MBuuts/DORA_ViWi_App/blob/main/Reports/Manual_Applications_GEE.pdf). 

Alternatively, if you want to access the tool's source code, you can add the repository to your Google Earth Engine scripts by clicking [here](https://code.earthengine.google.com/?accept_repo=users/geewiertsema/NDVI_Apps), it will be displayed in the Reader section. The visualization tool is accessible by running `Ia03_APP.js`.   
_Note: the scripts accessed with these links will be shown in the reader section scipts in the Reader section cannot be modified. Access to modifiable scripts will be given to the Google Earth Engine account of Wiertsema & Partners._

***Description of scripts. Can just be a short description.***  

The `Ia01_Function.js` file contains functions that are necessary to run the `Ia03_APP.js` file. 
The `Ia02_UI.js` file contains user interface settings that are applied to the `Ia03_APP.js` file.
The `Ia03_APP.js` file runs the application for NDVI trend analysis.
The `Ib01_APP.js` file runs the application for NDVI slope trend analysis.

Additional LandTrendr utilities are included in `Ia01_Function.js`. More explanations about the application settings can be found in the `Manual_Applications_GEE.pdf`.

In the `/Data/...` folder, besides the Google Earth Engine scripts you can also find different formats of the potential monitoring locations. A description of how these monitoring locations were selected can be found in the `Project_Report.pdf`.

## Reports

Project deliverables can be found in the `/Reports/...` folder of this repository. This folder includes four files (`Manual_Applications_GEE.pdf`, `report.pdf`, `Project_Proposal.pdf`, and `Data_Management_Plan.pdf`). 

**[`Project_Proposal.pdf`](https://github.com/MBuuts/DORA_ViWi_App/blob/main/Reports/Project_Proposal.pdf) contains:**
- An introduction into the problem
- A short description about the study area
- A description of the problem analysis
- A description of the objectives
- A description of the project approach
- A description of the quality frame and control
- A description of the products and deliverables
- A description of the project management

**[`Report.pdf`]() contains:**
- Some background information about vegetation stress and how this can be observed by remote sensing and vegetation indices
- An introduction into the final outputs
- A short description of the study area
- A description of the objectives
- A description of the methods and materials
- Results:
  - Stress trends (NDVI) in the Natura-2000 area 
  - A map with high stress locations in the agricultural area
  - A figure showing the correlation between vegetation stress and elevation
- A description about the reproducibility of the application and the scripts
- A description of the limitations and recommendations
- An appendix containing a step-by-step manual on how to do a correlation with elevation in QGIS

**[`Manual_Application_GEE.pdf`](https://github.com/MBuuts/DORA_ViWi_App/blob/main/Reports/Manual_Applications_GEE.pdf) contains:**
- A short and quick manual on how to use the NDVI slope and the LandTrendr application using only default settings
- An elaborate manual on the different settings and parameters of the LandTrendr application
- An explanation of how to interpret the output of the applications
- FAQ

**[`Data_Management_Plan.pdf`](https://github.com/MBuuts/DORA_ViWi_App/blob/main/Reports/Data_Management_Plan.pdf) contains:**
- A short description of the project
- A description of the data management roles of the team members
- A description of the type of project data, software choices, and data size
- A description of the structure of data and information
- A description of documentation and metadata
- A description of data sharing and ownership
- A description of long term storage


## Authors and contact information

Shoyo Nakamura | shoyo.nakamura@wur.nl  
Persa Koutsouradi | persa.koutsouradi@wur.nl  
Kristie Swinkels | kristie.swinkels@wur.nl  
Davey de Groot | davey.degroot@wur.nl  
Marieke Buuts | marieke.buuts@wur.nl  


## License

Copyright 2022 S. Nakamura, P. Koutsouradi, K. Swinkels, D. de Groot, M. Buuts 

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.


## Citations (_sources_)

Kennedy, R. E., Yang, Z., Gorelick, N., Braaten, J., Cavalcante, L., Cohen, W. B., & Healey, S. (2018). Implementation of the LandTrendr algorithm on google earth engine. Remote Sensing, 10(5), 691.






