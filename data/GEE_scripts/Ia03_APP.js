// File name: Ia03_APP.js
// APP name: ViWi (Vegetation Index Wiertsema & Partners)
// Description: This script runs the application for NDVI trend analysis.
// Date: 28-06-2022
// Authors: Persa Koutsouradi (persa.koutsouradi@wur.nl)
//          Shoyo Nakamura (shoyo.nakamura@wur.nl)
//          Kristie Swinkels (kristie.swinkels@wur.nl)
//          Davey de Groot (davey.degroot@wur.nl)
//          Marieke Buuts (marieke.buuts@wur.nl)
// Course: Remote Sensing and GIS integration at Wageningen University in the Netherlands
// License: Apache License 2.0
// Sources used: https://emapr.github.io/LT-GEE/index.html

// TODO: When you draw a polygon and plot NDVI trend in the RGB Change Options,
// The polygon size should be approximately 13km * 13 km. Alternatively, you can change the scale value in line 1018 and 1101 so that you can investigate polygon size of scale*scale.

// ==================================================================================================
// Sourcing the other 2 files.
ui.root.clear();

var ltgee = require('users/pkourtis95/ACT:I_PROJECT_SCRIPTS/Ia_LandTrendr/Ia01_Function.js');  
var ltgeeUI = require('users/pkourtis95/ACT:I_PROJECT_SCRIPTS/Ia_LandTrendr/Ia02_UI.js');  



//===============================================================================================================
//================SET UP PRIMARY PANELS==========================================================================
//===============================================================================================================
// control panel
var controlPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {width: '400px'}
});
 
// map panel
var map = ui.Map();
map.style().set({cursor:'crosshair'});
map.setOptions('HYBRID');

// plots panel
var plotPanel = ui.SplitPanel({
  style: {width: '400px', stretch: 'vertical'},
  orientation: 'vertical'
});

//panel options
var colYearsPanel = ltgeeUI.colYearsPanel();
var colDatesPanel = ltgeeUI.colDatesPanel();
var indexSelectPanel = ltgeeUI.indexSelectPanel();
var paramPanel = ltgeeUI.paramPanel();
var rgbYearsPanel = ltgeeUI.rgbYearsPanel();
var rgbYears = ltgeeUI.rgbYearsGet(rgbYearsPanel);
var deltaButtonRG = ltgeeUI.deltaButtonRG();
var deltaButtonGB = ltgeeUI.deltaButtonGB();
var timeSeriesButton = ltgeeUI.timeSeriesButton();

var maskPanel = ltgeeUI.maskSelectPanel();
var bufferPanel = ltgeeUI.bufferPanel({});
var coordsPanel = ltgeeUI.coordsPanel();
var drawPanel = ltgeeUI.drawPolygonPanel();
var submitButton = ltgeeUI.submitButton();
var epsgPanel = ltgeeUI.epsgPanel();  
var fileNamePanel = ltgeeUI.fileNamePanel();  
var folderNamePanel = ltgeeUI.folderNamePanel();  

//download options 
var downloadPanel = ltgeeUI.DownloadPanel();
var DownloadButton = ltgeeUI.downloadButton();

var colYearsPanelTS = ltgeeUI.colYearsPanel();
var colDatesPanelTS = ltgeeUI.colDatesPanel();
var maskPanelTS = ltgeeUI.maskSelectPanel();
var coordsPanelTS = ltgeeUI.coordsPanel();
var bufferPanelTS = ltgeeUI.bufferPanel({panelLabel: 'Define a pixel size for time series (m)', varLabel:'Size:', defVar: 30});
var submitButtonTS = ltgeeUI.TimeSeriesButton();
var ndviButtonTS = ltgeeUI.ndviButton();
var DSNRPanelbox = ltgeeUI.DSNRPanel(); 
var YODButton = ltgeeUI.YODButton();

var assetButton = ltgeeUI.assetButton();
var LayerOverlayPanel = ltgeeUI.LayerOverlayPanel();

//===============================================================================================================
//===========SET UP CONTROL PANEL ELEMENTS ================================================================================
//===============================================================================================================

// Landtrendr drop panel//

var LTparamsCtrlButton = ui.Button({label: 'LandTrendr Options >>', style:{stretch: 'horizontal', color:'black'}});

LTparamsCtrlButton.onClick(function(){

  var InfoHolder = ui.Panel([
    ui.Label('LandTrendr Options Usage', {fontWeight: 'bold'}),
    ui.Label('1) Define Start Year and End Year options in control panel. 1985 to the most recent completed year is recommented.  '),
    ui.Label('2) Define Start Date and End Date. This is the date window in which Landsat imagery is collected and then composited for each year. '),
    ui.Label('3) Select a band or index to be segmented by Landtrendr.'),
    ui.Label('4) Select a band or index to be fitted to the above band or index by Landtrendr.'),
    ui.Label('5) Define maxSegments; Maximum number of segments to be fitted on the time series.'),
    ui.Label('6) Define spikeThreshold; threshold for dampening the spikes (1.0 means no dampening).'),
    ui.Label('7) Define vertexCountOvershoot; The inital model can overshoot the maxSegments + 1 vertices by this amount. Later, it will be prunned down to maxSegments + 1'),
    ui.Label('8) Define preventOneYearRecovery; Prevent segments that represent one year recoveries.'),
    ui.Label('9) Define recoveryThreshold; If a segment has a recovery rate faster than 1/recoveryThreshold (in years), then the segment is disallowed.'),
    ui.Label('10) Define pvalThreshold; If the p-value of the fitted model exceeds this threshold, then the current model is discarded and another one is fitted using the Levenberg-Marquardt optimizer .'),
    ui.Label('11) Define bestModelProportion; Takes the model with most vertices that has a p-value that is at most this proportion away from the model with lowest p-value.'),
    ui.Label('12) Define minObservationsNeeded; Min observations needed to perform output fitting.'),
    ui.Label('13) Proceed to the next options.'),
    ui.Label('____________________________________________________'),
  ]);
  
  if(LTparamsCtrlPanel.style().get('shown')){
    plotPanel.setFirstPanel(InfoHolder);
    LTparamsCtrlButton.setLabel('LandTrendr Options >>');
    LTparamsCtrlPanel.style().set('shown', false);
  } else{
    LTparamsCtrlButton.setLabel('LandTrendr Options <<');
    LTparamsCtrlPanel.style().set('shown', true);
    rgbChangeCtrlButton.setLabel('RGB Change Options >>');
    rgbChangeCtrlPanel.style().set('shown', false);
    tsCtrlButton.setLabel('Pixel Time Series Options >>');
    tsCtrlPanel.style().set('shown', false);
    YODCtrlButton.setLabel('Change Filter Options >>');
    YODCtrlPanel.style().set('shown', false);
    downloadCtrlButton.setLabel('Download Options >>');
    downloadCtrlPanel.style().set('shown', false);
    overlayParamsCtrlButton.setLabel('Asset Overlay Options >>');
    overlayParamsCtrlPanel.style().set('shown', false);

    plotPanel.setFirstPanel(InfoHolder);

  }
});

var LTparamsCtrlPanel = ui.Panel(null, null, {stretch: 'horizontal', shown: false});

// add LandTrendr mapping options to Landtrendr drop panel
LTparamsCtrlPanel.add(colYearsPanel);
LTparamsCtrlPanel.add(colDatesPanel);
LTparamsCtrlPanel.add(indexSelectPanel);
LTparamsCtrlPanel.add(paramPanel);

// Asset Overlay drop panel//
var overlayParamsCtrlButton = ui.Button({label: 'Asset Overlay Options >>', style:{stretch: 'horizontal', color:'black'}});

overlayParamsCtrlButton.onClick(function(){
  var InfoHolder = ui.Panel([
    ui.Label('Asset Overlay Options Usage', {fontWeight: 'bold'}),
    ui.Label('1) Define the path to an asset. This asset will be loaded into the map view as a layer. The asset path can be found by clicking on an asset (go to the assets tab) and recording the path under "Table ID". '),
    ui.Label('2) Optional, define a name to call the loaded asset.'),
    ui.Label('3) Optional, define the color of the asset.'),
    ui.Label('____________________________________________________'),
  ]);
  
  if(overlayParamsCtrlPanel.style().get('shown')){
    plotPanel.setFirstPanel(InfoHolder);
    overlayParamsCtrlButton.setLabel('Asset Overlay Options >>');
    overlayParamsCtrlPanel.style().set('shown', false);
  } else{
    overlayParamsCtrlButton.setLabel('Asset Overlay Options <<');
    overlayParamsCtrlPanel.style().set('shown', true);
    rgbChangeCtrlButton.setLabel('RGB Change Options >>');
    rgbChangeCtrlPanel.style().set('shown', false);
    tsCtrlButton.setLabel('Pixel Time Series Options >>');
    tsCtrlPanel.style().set('shown', false);
    YODCtrlButton.setLabel('Change Filter Options >>');
    YODCtrlPanel.style().set('shown', false);
    downloadCtrlButton.setLabel('Download Options >>');
    downloadCtrlPanel.style().set('shown', false);
    LTparamsCtrlButton.setLabel('LandTrendr Options >>');
    LTparamsCtrlPanel.style().set('shown', false);

    plotPanel.setFirstPanel(InfoHolder);

  }
});

var overlayParamsCtrlPanel = ui.Panel(null, null, {stretch: 'horizontal', shown: false});

// asset file path text box
overlayParamsCtrlPanel.add(LayerOverlayPanel);
overlayParamsCtrlPanel.add(assetButton);

// rgb drop panel//
var rgbChangeCtrlButton = ui.Button({label: 'RGB Change Options >>', style:{stretch: 'horizontal', color:'black'}});
rgbChangeCtrlButton.onClick(function(){

  var InfoHolder = ui.Panel([
    ui.Label('RGB Change Usage', {fontWeight: 'bold'}),
    ui.Label('1) Define years to represent red, green, and blue color in the final RGB composite. The Red Year value is the year value for the Full Time Series Dispaly image.'),
    ui.Label('2) Define Masking options. Each item selected will be masked out as nodata to the best of it ability  '),
    ui.Label('3) Optionally define a pixel coordinate set to view the time series of, alternatively you’ll simply click on the map. Note that the coordinates are in units of latitude and longitude formatted as decimal degrees (WGS 84 EPSG:4326). Also note that when you click a point on the map, the coordinates of the point will populate these entry boxes.'),
    ui.Label('4) Define a buffer around the center point defined by a map click or provided in the longitude and latitude coordinate. The units are in kilometers. It will draw and clip the map to the bounds of the square region created by the buffer around the point of interest.'),
    ui.Label('5) Optionally Draw a polygon by clicking the check box. Then click on the map to draw a polygon that will be the extent of the imagery displayed. To remove the polygon and us the point buffer extent simply uncheck the draw box. '),
    ui.Label('6) Click the Plot NDVI trend button to add a graph of NDVI trend from 1985-2021.'),
    ui.Label('7) Click the Add RGB Imagery button to add red year, green year, and blue year composite to the map view. The extent of the imagery displayed is define by a point buffer or drawn polygon.'),
    ui.Label('8) Click the Add RED to Green Delta button to add an image of magnitude and direction from the red year to the green year to the map view. The extent of the imagery displayed is define by a point buffer or drawn polygon.'),
    ui.Label('9) Click the Add Green To Blue Delta button to add an image of magnitude and direction from the green year to the blue year to the map view. The extent of the imagery displayed is define by a point buffer or drawn polygon.'),
    ui.Label('10) Click the Add Full Time Series Imagery to add an image of the whole time series'),
  ]);  
  
  if(rgbChangeCtrlPanel.style().get('shown')){
    plotPanel.setFirstPanel(InfoHolder);
    rgbChangeCtrlButton.setLabel('RGB Change Options >>');
    rgbChangeCtrlPanel.style().set('shown', false);
  } else{
    rgbChangeCtrlButton.setLabel('RGB Change Options <<');
    rgbChangeCtrlPanel.style().set('shown', true);
    tsCtrlButton.setLabel('Pixel Time Series Options >>');
    tsCtrlPanel.style().set('shown', false);
    LTparamsCtrlButton.setLabel('LandTrendr Options >>');
    LTparamsCtrlPanel.style().set('shown', false);
    downloadCtrlButton.setLabel('Download Options >>');
    downloadCtrlPanel.style().set('shown', false);
    YODCtrlButton.setLabel('Change Filter Options >>');
    YODCtrlPanel.style().set('shown', false);
    overlayParamsCtrlButton.setLabel('Asset Overlay Options >>');
    overlayParamsCtrlPanel.style().set('shown', false);
    
    plotPanel.setFirstPanel(InfoHolder);
    
  }
});

var rgbChangeCtrlPanel = ui.Panel(null, null, {stretch: 'horizontal', shown: false});

// add rgb mapping options to rgb change drop panel 
rgbChangeCtrlPanel.add(rgbYearsPanel);
rgbChangeCtrlPanel.add(maskPanel);
rgbChangeCtrlPanel.add(coordsPanel);
rgbChangeCtrlPanel.add(bufferPanel);
rgbChangeCtrlPanel.add(drawPanel);
rgbChangeCtrlPanel.add(ndviButtonTS);
rgbChangeCtrlPanel.add(submitButton);
rgbChangeCtrlPanel.add(deltaButtonRG);
rgbChangeCtrlPanel.add(deltaButtonGB);
rgbChangeCtrlPanel.add(timeSeriesButton);

// Download drop panel//
var downloadCtrlButton = ui.Button({label: 'Data Download Options >>', style:{stretch: 'horizontal', color:'black'}});
downloadCtrlButton.onClick(function(){
  var InfoHolder = ui.Panel([
    ui.Label('Download Usage', {fontWeight: 'bold'}),
    ui.Label('1) Define the output imagery projection in the form of a EPSG code.'),
    ui.Label('2) Define a file name prefix. Image information such as selected years and other info will be appended the file name prefix.'),
    ui.Label('3) Define a folder name prefix to store the imagery in your Google Drive. Image information such as selected years and other info will be appended the folder name prefix. Also, each image represented by a checked box will be downloaded into its own folder. This will help manage mergers of image chucks if necessary.'),
    ui.Label('4) Select the checkboxs for the data you wish to download.'),
    ui.Label('5) Click the Download Data button to start tasks.'),
    ui.Label('6) Look under the Tasks tab for the export processes.'),
    ui.Label('7) Click the RUN button to start the downloading process to your Google Drive. Each process will create its own folder in your google drive and save data to those locations. '),
    ui.Label('____________________________________________________'),
  ]);    
  if(downloadCtrlPanel.style().get('shown')){
    plotPanel.setFirstPanel(InfoHolder);
    downloadCtrlButton.setLabel('Download Options >>');
    downloadCtrlPanel.style().set('shown', false);
    
  } else{
    downloadCtrlButton.setLabel('Download Options <<');
    downloadCtrlPanel.style().set('shown', true);
    rgbChangeCtrlButton.setLabel('RGB Change Options >>');
    rgbChangeCtrlPanel.style().set('shown', false);
    tsCtrlButton.setLabel('Pixel Time Series Options >>');
    tsCtrlPanel.style().set('shown', false);
    LTparamsCtrlButton.setLabel('LandTrendr Options >>');
    LTparamsCtrlPanel.style().set('shown', false);
    YODCtrlButton.setLabel('Change Filter Options >>');
    YODCtrlPanel.style().set('shown', false);
    overlayParamsCtrlButton.setLabel('Asset Overlay Options >>');
    overlayParamsCtrlPanel.style().set('shown', false);
    
    plotPanel.setFirstPanel(InfoHolder);

  }
});

var downloadCtrlPanel = ui.Panel(null, null, {stretch: 'horizontal', shown: false});

downloadCtrlPanel.add(epsgPanel); 
downloadCtrlPanel.add(fileNamePanel); 
downloadCtrlPanel.add(folderNamePanel);  
downloadCtrlPanel.add(downloadPanel);
downloadCtrlPanel.add(DownloadButton); 

// pixel time series panel//
var tsCtrlButton = ui.Button({label: 'Pixel Time Series Options >>', style:{stretch: 'horizontal', color:'black'}});
tsCtrlButton.onClick(function(){
  var InfoHolder = ui.Panel([
    ui.Label('Pixel Time Series Usage', {fontWeight: 'bold'}),
    ui.Label('1) Select spectral indices and bands to view. You can select one or two.'),
    ui.Label('2) Define pixel size for time series (m)'),
    ui.Label('3) Identify location with one of two options:'),
    ui.Label('  a) Click on the map. The coordinates of the point will populate the latitude and longitude (coordinates are in units of latitude and longitude formatted as decimal degrees (WGS 84 EPSG:4326).'),
    ui.Label('  b) Enter pixel coordinates in decimal degrees.'),
    ui.Label('4) If you want to change anything about the run, but keep the pixel coordinate, make the changes and then hit the ReSubmit Pixel button.'),
    ui.Label('____________________________________________________'),
  ]); 
  
  if(tsCtrlPanel.style().get('shown')){

    plotPanel.setFirstPanel(InfoHolder);
    tsCtrlButton.setLabel('Pixel Time Series Options >>');
    tsCtrlPanel.style().set('shown', false);
  } else{
    tsCtrlButton.setLabel('Pixel Time Series Options <<');
    tsCtrlPanel.style().set('shown', true);
    rgbChangeCtrlButton.setLabel('RGB Change Options >>');
    rgbChangeCtrlPanel.style().set('shown', false);
    LTparamsCtrlButton.setLabel('LandTrendr Options >>');
    LTparamsCtrlPanel.style().set('shown', false);
    downloadCtrlButton.setLabel('Download Options >>');
    downloadCtrlPanel.style().set('shown', false);
    YODCtrlButton.setLabel('Change Filter Options >>');
    YODCtrlPanel.style().set('shown', false);
    overlayParamsCtrlButton.setLabel('Asset Overlay Options >>');
    overlayParamsCtrlPanel.style().set('shown', false);
    
    plotPanel.setFirstPanel(InfoHolder);

  }
});

var tsCtrlPanel = ui.Panel(null, null, {stretch: 'horizontal', shown: false, padding: '0px'});

// pixel time series options
var indexBoxesTSdict = ltgeeUI.indexSelectPanelTS();
var indexBoxesTS = indexBoxesTSdict.ui;
var indexListTS = indexBoxesTSdict.list;

var indexLabelTS = ui.Label('Select Indices', {fontWeight : 'bold'});
var indexPanelTS = ui.Panel(
 
  [
    ui.Panel([indexBoxesTS[0]], null, {stretch: 'horizontal'}), 
  ],
  ui.Panel.Layout.Flow('horizontal'), {stretch: 'horizontal'}
);
indexBoxesTS[0].setValue(1);

var indexSelectPanelTS = ui.Panel([indexLabelTS,indexPanelTS], null, {stretch: 'horizontal'});

// Time Series Options
// add pixel time series options to pixel time series drop panel
tsCtrlPanel.add(indexSelectPanelTS);
tsCtrlPanel.add(bufferPanelTS);
tsCtrlPanel.add(coordsPanelTS);
tsCtrlPanel.add(submitButtonTS);


// #######################################################################################
// ###### YOD filter #####################################################################
// #######################################################################################

// YOD Change button and panel//===============================================================================================================
var YODCtrlButton = ui.Button({label: 'Change Filter Options >>', style:{stretch: 'horizontal', color:'black'}});

YODCtrlButton.onClick(function(){
  
  var InfoHolder = ui.Panel([
    ui.Label('Change Filter Usage', {fontWeight: 'bold'}),
    ui.Label('1) Define the vegetation change type you are interested in - either vegetation gain or loss.'),
    ui.Label('2) Define the vegetation change sort - should the change be the greatest, least, longest, etc. This applies only if there are multiple vegetation changes of a given type in a pixel time series. It is a relative qualifier for a pixel time series.'),
    ui.Label('3) Optionally filter changes by the year of detection. Adjust the sliders to constrain the results to a given range of years. The filter is only applied if the Filter by Year box is checked.'),
    ui.Label('4) Optionally filter changes by magnitude. Enter a threshold value and select a conditional operator. For example, if you selected the change type as vegetation loss defined by NDVI and wanted only high magnitude losses shown, you would maybe want to keep only those pixels that had greater than 0.4 NDVI units loss - you would set value as 0.4 and select the > operator.The filter is only applied if the Filter by Magnitude box is checked.'),
    ui.Label('5) Optionally filter by change event duration. Enter a threshold value and select a conditional operator. For example, if you only want to display change events that occurred rapidly, you would maybe set the value as 2 (years) and the operator as < to retain only those changes that completed within a single year. The filter is only applied if the Filter by Duration box is checked.'),
    ui.Label('6) Optionally filter by a minimum disturbance patch size, as defined by 8-neighbor connectivity of pixels having the same year of change detection. The value is the minimum number of pixel in a patch. The filter is only applied if the Filter by MMU box is checked.'),
    ui.Label('7) Click the add imagery to add image to the map viewer. '),
    ui.Label('____________________________________________________'),
  ]); 
  
  if(YODCtrlPanel.style().get('shown')){
    plotPanel.setFirstPanel(InfoHolder);
    YODCtrlButton.setLabel('Change Filter Options >>');
    YODCtrlPanel.style().set('shown', false);
  } else{
    YODCtrlButton.setLabel('Change Filter Options <<');
    YODCtrlPanel.style().set('shown', true);
    downloadCtrlButton.setLabel('Download Options >>');
    downloadCtrlPanel.style().set('shown', false);
    rgbChangeCtrlButton.setLabel('RGB Change Options >>');
    rgbChangeCtrlPanel.style().set('shown', false);
    tsCtrlButton.setLabel('Pixel Time Series Options >>');
    tsCtrlPanel.style().set('shown', false);
    LTparamsCtrlButton.setLabel('LandTrendr Options >>');
    LTparamsCtrlPanel.style().set('shown', false);
    overlayParamsCtrlButton.setLabel('Asset Overlay Options >>');
    overlayParamsCtrlPanel.style().set('shown', false);
    
    plotPanel.setFirstPanel(InfoHolder);
  }
});
var YODCtrlPanel = ui.Panel(null, null, {stretch: 'horizontal', shown: false});

// disturbance mapping panel
var changeTypeList = ['Loss','Gain'];
var changeTypeFilter = ui.Panel(
  [ui.Label({value:'Select Vegetation Change Type:', style:{color:'blue'}}),ui.Select({items:changeTypeList, value:'Loss', style:{stretch: 'horizontal'}})], ui.Panel.Layout.Flow('horizontal')
);

var distTypeList = ['Greatest','Least','Newest','Oldest','Fastest','Slowest'];
var distTypeFilter = ui.Panel(
  [ui.Label({value:'Select Vegetation Change Sort:', style:{color:'blue'}}),ui.Select({items:distTypeList, value:'Greatest', style:{stretch: 'horizontal'}})], ui.Panel.Layout.Flow('horizontal')
);

var yearFilter = ltgee.yearPanel();
yearFilter.remove(yearFilter.widgets().get(0));
yearFilter.insert(0, ui.Checkbox({label:'Filter by Year:', value:1, style:{color:'blue'}}));
yearFilter.widgets().get(1).style().set('padding', '0px 0px 0px 20px');
yearFilter.widgets().get(2).style().set('padding', '0px 0px 0px 20px');

var opList = ['>', '<'];
var magFilter = ui.Panel(
  [
    ui.Checkbox({label:'Filter by Magnitude (0-1000):', value:1,style:{color:'blue'}}),
    ui.Panel(
      [
        ui.Label('Value:'),
        ui.Textbox({value:100, style:{stretch: 'horizontal'}}),
        ui.Label('Operator:'),
        ui.Select({items:opList, value:'>', style:{stretch: 'horizontal'}})
      ], ui.Panel.Layout.Flow('horizontal'), {stretch: 'horizontal', padding: '0px 0px 0px 20px'})
  ],
  null,
  {stretch: 'horizontal'}
);


var durFilter = ui.Panel(
  [
    ui.Checkbox({label:'Filter by Duration:', value:1, style:{color:'blue'}}),
    ui.Panel(
      [
        ui.Label('Value:'),
        ui.Textbox({value:9, style:{stretch: 'horizontal'}}),
        ui.Label('Operator:'),
        ui.Select({items:opList, value:'>', style:{stretch: 'horizontal'}})
      ], ui.Panel.Layout.Flow('horizontal'), {stretch: 'horizontal', padding: '0px 0px 0px 20px'})
  ],
  null,
  {stretch: 'horizontal'}
);

var prevalFilter = ui.Panel(
  [
    ui.Checkbox({label:'Filter by Pre-Dist Value:', style:{color:'blue'}}),
    ui.Panel(
      [
        ui.Label('Value:'),
        ui.Textbox({value:400, style:{stretch: 'horizontal'}}),
        ui.Label('Operator:'),
        ui.Select({items:opList, value:'>', style:{stretch: 'horizontal'}})
      ], ui.Panel.Layout.Flow('horizontal'), {stretch: 'horizontal', padding: '0px 0px 0px 20px'})
  ],
  null,
  {stretch: 'horizontal'}
);


var mmuFilter = ui.Panel(
  [
    ui.Checkbox({label:'Filter by MMU:', value:1,style:{color:'blue'}}),
    ui.Textbox({value:6, style:{stretch: 'horizontal'}}) 
  ],
  ui.Panel.Layout.Flow('horizontal'),
  {stretch: 'horizontal'}
);

var DSNRPanelbox = ltgeeUI.DSNRPanel(); 
var YODButton = ltgeeUI.YODButton();

YODCtrlPanel.add(changeTypeFilter);
YODCtrlPanel.add(distTypeFilter);
YODCtrlPanel.add(yearFilter);
YODCtrlPanel.add(magFilter);
YODCtrlPanel.add(durFilter);
YODCtrlPanel.add(mmuFilter);
YODCtrlPanel.add(YODButton);

// add the drop buttons and drop panels to control panel
controlPanel.add(LTparamsCtrlButton);
controlPanel.add(LTparamsCtrlPanel);
controlPanel.add(overlayParamsCtrlButton);
controlPanel.add(overlayParamsCtrlPanel);
controlPanel.add(rgbChangeCtrlButton);
controlPanel.add(rgbChangeCtrlPanel);
controlPanel.add(tsCtrlButton);
controlPanel.add(tsCtrlPanel);
controlPanel.add(YODCtrlButton);
controlPanel.add(YODCtrlPanel);
controlPanel.add(downloadCtrlButton);
controlPanel.add(downloadCtrlPanel);

/// plot panel children
var plotsPanelLabel = ui.Label('Pixel Time Series Plots', {fontWeight: 'bold', stretch: 'horizontal'});
var plotHolder = ui.Panel({style: {stretch: 'horizontal'}});

var InfoHolder = ui.Panel([
    ui.Label('Usage Options', {fontWeight: 'bold'}),
    ui.Label('Click options in left panel to display usage option description.'),
    ui.Label('____________________________________________________'),
]); 

plotHolder = plotHolder.clear();
// add plot panel children to parent
plotPanel.setSecondPanel(plotHolder);    
plotHolder.add(plotsPanelLabel);
// add plot panel children to parent
plotPanel.setFirstPanel(InfoHolder);    

//===============================================================================================================
//===========SET UP MAPPING, PIXEL PLOT AND DOWNLOAD FUNCTIONS ==================================================
//===============================================================================================================

// rgb change mapping function //
var plotTheMap = function(){
  var coords = ltgeeUI.coordsGet(coordsPanel);
  var runParams = ltgeeUI.getParams(paramPanel);
  runParams.timeSeries = ee.ImageCollection([]);
  var colYrs = ltgeeUI.colYearsGet(colYearsPanel);
  var colDates = ltgeeUI.colDatesGet(colDatesPanel);
  var index = ltgeeUI.indexSelectGet(indexSelectPanel)[0];
  var importedLyrcheckbox = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[9];
  var importedLyr1 = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[0];
  
  var ftvlist = [];
  ftvlist.push(ltgeeUI.indexSelectGet(indexSelectPanel)[1]); 

  var rgbYears = ltgeeUI.rgbYearsGet(rgbYearsPanel);
  var masked = ltgeeUI.getMaskSelect(maskPanel);   
  var aoi;
  var selectDraw = ltgeeUI.getDrawPolygon(drawPanel);
  if (selectDraw === true ){
    aoi = getAverageElevation();
    map.centerObject(aoi);
    
    //console.log('Draw Polygon')
  }else if(importedLyrcheckbox === true){
    aoi = ee.FeatureCollection(importedLyr1).geometry();
    map.centerObject(aoi);
    
  }else{
    var buffer = ltgeeUI.getBuffer(bufferPanel);
    buffer = buffer*1000;
    var point = ee.Geometry.Point(coords.lon, coords.lat).buffer(200);
    aoi = point.buffer(buffer).bounds();
    map.centerObject(aoi);

  }
  var rgbVis = ltgee.mapRGBcomposite(index, colYrs.startYear, colYrs.endYear, colDates.startDate, colDates.endDate, rgbYears.red, rgbYears.green, rgbYears.blue, aoi, runParams, 2, masked, ftvlist);
  map.layers().set(0, ui.Map.Layer(rgbVis,null,'RGB Change'));
};

// asset mapping function //
var assetHandler = function(assetPath, assetName, assetColor, mapLayer, useAsCenter) {
  if (assetPath != 'file/path/to/asset') {
    var aoiVis = {color: assetColor, fillColor:'#66000000'};
    var table = ee.FeatureCollection(assetPath).style(aoiVis);
    map.layers().set(mapLayer, ui.Map.Layer(table, {}, assetName));
  }
};

var plotAsset = function(){
  var importedLyr = ltgeeUI.lyrOverlayGet(LayerOverlayPanel);
  
  var ok1 = assetHandler(importedLyr[0], importedLyr[3], importedLyr[6], 8, true);
  var ok2 = assetHandler(importedLyr[1], importedLyr[4], importedLyr[7], 9, false);
  var ok3 = assetHandler(importedLyr[2], importedLyr[5], importedLyr[8], 10, false);
  
};

// rg delta mapping function//
var plotTheRGDeltaMap = function(){
  var coords = ltgeeUI.coordsGet(coordsPanel);
  var runParams = ltgeeUI.getParams(paramPanel);
  runParams.timeSeries = ee.ImageCollection([]);
  var colYrs = ltgeeUI.colYearsGet(colYearsPanel);
  var colDates = ltgeeUI.colDatesGet(colDatesPanel);
  var index = ltgeeUI.indexSelectGet(indexSelectPanel)[0];
  var importedLyrcheckbox = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[9]; 
  var importedLyr1 = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[0];
  
  var ftvlist = [];
  ftvlist.push(ltgeeUI.indexSelectGet(indexSelectPanel)[1]); 

  var rgbYears = ltgeeUI.rgbYearsGet(rgbYearsPanel);
  var masked = ltgeeUI.getMaskSelect(maskPanel);   
  var aoi;
  var selectDraw = ltgeeUI.getDrawPolygon(drawPanel);
  if (selectDraw === true ){
    aoi = getAverageElevation();
    map.centerObject(aoi);
  }else if(importedLyrcheckbox === true){
    aoi = ee.FeatureCollection(importedLyr1).geometry();
    map.centerObject(aoi);
    
  }else{
    var buffer = ltgeeUI.getBuffer(bufferPanel);
    buffer = buffer*1000;
    var point = ee.Geometry.Point(coords.lon, coords.lat).buffer(200);
    aoi = point.buffer(buffer).bounds();
    map.centerObject(aoi);
  }
  var lt = ltgee.runLT(colYrs.startYear, colYrs.endYear, colDates.startDate, colDates.endDate, aoi, index, ftvlist, runParams, masked);
  var ftvStack = ltgee.getFittedData(lt, colYrs.startYear, colYrs.endYear, index, ftvlist).toShort();
  
  //calculate magnitude and direction imagery
  var MagnitudeRG = ftvStack.expression(
    'vert2 == 0 ? 0 : (vert1 > vert2 ? -1*(vert1 - (vert2)) : vert2 - (vert1))', {
    'vert1': ftvStack.select(rgbYears.red.toString()), 
    'vert2': ftvStack.select(rgbYears.green.toString())         
    }).clip(aoi);
  var fittedMagnitudeImageRG = ee.Image.cat(MagnitudeRG).rename([rgbYears.red.toString()+'_'+rgbYears.green.toString()]);
  
  var stretchRG = ltgee.stdDevStretch(fittedMagnitudeImageRG, aoi, 3);
  var VISparamsRG = {"opacity":1,"bands":[rgbYears.red.toString()+'_'+rgbYears.green.toString()],"min":stretchRG[0],"max":stretchRG[1],"gamma":1};
  map.layers().set(1, ui.Map.Layer(fittedMagnitudeImageRG,{},rgbYears.red.toString()+'_'+rgbYears.green.toString()+'_Delta').setVisParams(VISparamsRG));

};

// gb delta mapping function//
var plotTheGBDeltaMap = function(){
  var coords = ltgeeUI.coordsGet(coordsPanel);
  var runParams = ltgeeUI.getParams(paramPanel);
  runParams.timeSeries = ee.ImageCollection([]);
  var colYrs = ltgeeUI.colYearsGet(colYearsPanel);
  var colDates = ltgeeUI.colDatesGet(colDatesPanel);
  var index = ltgeeUI.indexSelectGet(indexSelectPanel)[0];
  var importedLyrcheckbox = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[9]; 
  var importedLyr1 = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[0];
  
  var ftvlist = [];
  ftvlist.push(ltgeeUI.indexSelectGet(indexSelectPanel)[1]); 

  var rgbYears = ltgeeUI.rgbYearsGet(rgbYearsPanel);
  var masked = ltgeeUI.getMaskSelect(maskPanel);   
  var aoi;
  var selectDraw = ltgeeUI.getDrawPolygon(drawPanel);
  if (selectDraw === true ){
    aoi = getAverageElevation();
    map.centerObject(aoi);
  }else if(importedLyrcheckbox === true){
    aoi = ee.FeatureCollection(importedLyr1).geometry();
    map.centerObject(aoi);
    
  }else{
    var buffer = ltgeeUI.getBuffer(bufferPanel);
    buffer = buffer*1000;
    var point = ee.Geometry.Point(coords.lon, coords.lat).buffer(200);
    aoi = point.buffer(buffer).bounds();
    map.centerObject(aoi);
  }
  var lt = ltgee.runLT(colYrs.startYear, colYrs.endYear, colDates.startDate, colDates.endDate, aoi, index, ftvlist, runParams, masked);
  var ftvStack = ltgee.getFittedData(lt, colYrs.startYear, colYrs.endYear, index, ftvlist).toShort();
  
  var MagnitudeGB = ftvStack.expression(
    'vert2 == 0 ? 0 : (vert1 > vert2 ? -1*(vert1 - (vert2)) : vert2 - (vert1))', {
    'vert1': ftvStack.select(rgbYears.green.toString()),
    'vert2': ftvStack.select(rgbYears.blue.toString())           
    }).clip(aoi);
  var fittedMagnitudeImageGB = ee.Image.cat(MagnitudeGB).rename([rgbYears.green.toString()+'_'+rgbYears.blue.toString()]);
  
  var stretchGB = ltgee.stdDevStretch(fittedMagnitudeImageGB, aoi, 3);
  var VISparamsGB = {"opacity":1,"bands":[rgbYears.green.toString()+'_'+rgbYears.blue.toString()],"min":stretchGB[0],"max":stretchGB[1],"gamma":1};
  map.layers().set(2, ui.Map.Layer(fittedMagnitudeImageGB,{},rgbYears.green.toString()+'_'+rgbYears.blue.toString()+'_Delta').setVisParams(VISparamsGB));
};

// Fulltime Series mapping function//
var fullTimeSeriesMap = function(){
  var coords = ltgeeUI.coordsGet(coordsPanel);
  var runParams = ltgeeUI.getParams(paramPanel);
  runParams.timeSeries = ee.ImageCollection([]);
  var colYrs = ltgeeUI.colYearsGet(colYearsPanel);
  var colDates = ltgeeUI.colDatesGet(colDatesPanel);
  var index = ltgeeUI.indexSelectGet(indexSelectPanel)[0];
  var importedLyrcheckbox = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[9]; 
  var importedLyr1 = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[0];
  
  var ftvlist = [];
  ftvlist.push(ltgeeUI.indexSelectGet(indexSelectPanel)[1]); 

  var rgbYears = ltgeeUI.rgbYearsGet(rgbYearsPanel);
  var masked = ltgeeUI.getMaskSelect(maskPanel);   
  var aoi;
  var selectDraw = ltgeeUI.getDrawPolygon(drawPanel);
  if (selectDraw === true ){
    aoi = getAverageElevation();
    map.centerObject(aoi);
  }else if(importedLyrcheckbox === true){
    aoi = ee.FeatureCollection(importedLyr1).geometry();
    map.centerObject(aoi);
    
  }else{
    var buffer = ltgeeUI.getBuffer(bufferPanel);
    buffer = buffer*1000;
    var point = ee.Geometry.Point(coords.lon, coords.lat).buffer(200);
    aoi = point.buffer(buffer).bounds();
    map.centerObject(aoi);
  }
  var lt = ltgee.runLT(colYrs.startYear, colYrs.endYear, colDates.startDate, colDates.endDate, aoi, index, ftvlist, runParams, masked);
  var ftvStack = ltgee.getFittedData(lt, colYrs.startYear, colYrs.endYear, index, ftvlist).toShort().clip(aoi);

  var stretchGB = ltgee.stdDevStretch(ftvStack, aoi, 3);
  var VISparamsGB = {"opacity":1,"bands":[rgbYears.red.toString()],"min":stretchGB[0],"max":stretchGB[1],"gamma":1};
  map.layers().set(3, ui.Map.Layer(ftvStack,{},'Full Time Series').setVisParams(VISparamsGB));
};

// fitted rgb change and delta download function//
var downloadTheMap = function(){
  // gets user selected options
  var imagesToDownload = ltgeeUI.getdownloadpanel(downloadPanel);
  var coords = ltgeeUI.coordsGet(coordsPanel);
  var runParams = ltgeeUI.getParams(paramPanel);
  runParams.timeSeries = ee.ImageCollection([]);
  var colYrs = ltgeeUI.colYearsGet(colYearsPanel);
  var colDates = ltgeeUI.colDatesGet(colDatesPanel);
  var index = ltgeeUI.indexSelectGet(indexSelectPanel)[0];
  var ftvlist = [];
  ftvlist.push(ltgeeUI.indexSelectGet(indexSelectPanel)[1]); 
  var rgbYears = ltgeeUI.rgbYearsGet(rgbYearsPanel);
  var masked = ltgeeUI.getMaskSelect(maskPanel); 
  var importedLyrcheckbox = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[9]; 
  var importedLyr1 = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[0];
  var aoi;
  var selectDraw = ltgeeUI.getDrawPolygon(drawPanel);
  var epsgCode = ltgeeUI.getEPSG(epsgPanel);
  var fileName = ltgeeUI.getFileName(fileNamePanel);
  var folderName = ltgeeUI.getFolderName(folderNamePanel);
  var DSNRopt = false;
  var yearsInTime = ee.List.sequence(colYrs.startYear, colYrs.endYear);
  //handle for draw polygon or coordinate buffer
  if (selectDraw === true ){
    aoi = getAverageElevation();
  }else if(importedLyrcheckbox === true){
    aoi = ee.FeatureCollection(importedLyr1).geometry();
    map.centerObject(aoi);
    
  }else{
    var buffer = ltgeeUI.getBuffer(bufferPanel);
    buffer = buffer*1000;
    var point = ee.Geometry.Point(coords.lon, coords.lat).buffer(200);
    aoi = point.buffer(buffer).bounds();
  }
  
  //run landtrendr
  var lt = ltgee.runLT(colYrs.startYear, colYrs.endYear, colDates.startDate, colDates.endDate, aoi, index, ftvlist, runParams, masked);
  // landtrendr fitted imagery time series 
  var ftvStack = ltgee.getFittedData(lt, colYrs.startYear, colYrs.endYear, index, ftvlist).toShort();

  // export options 
  for(var i in imagesToDownload){
    // RGB image
    if(imagesToDownload[i] === 1){
      // exports RGB image 1 
      Export.image.toDrive({
        image:ftvStack.select([rgbYears.red.toString(),rgbYears.green.toString(),rgbYears.blue.toString()])
          .clip(aoi)
          .unmask(-9999), 
        description: fileName+'-RGB-'+rgbYears.red.toString()+"-"+rgbYears.green.toString()+"-"+rgbYears.blue.toString(), 
        folder:folderName+'-RGB-'+rgbYears.red.toString()+"-"+rgbYears.green.toString()+"-"+rgbYears.blue.toString(), 
        fileNamePrefix: fileName+'-RGB-'+rgbYears.red.toString()+"-"+rgbYears.green.toString()+"-"+rgbYears.blue.toString(), 
        region:aoi, 
        scale:30, 
        crs:"EPSG:"+epsgCode,
        maxPixels: 1e13 
      });      
      print('tasked RGB image');
    }
    // RG Delta image
    if(imagesToDownload[i] === 2){
      //calculate magnitude and direction imagery
      var MagnitudeRG = ftvStack.expression(
        'vert2 == 0 ? 0 : (vert1 > vert2 ? -1*(vert1 - (vert2)) : vert2 - (vert1))', {
        'vert1': ftvStack.select(rgbYears.red.toString()),
        'vert2': ftvStack.select(rgbYears.green.toString())           
        });
      // renames image
      var fittedMagnitudeImageRG = ee.Image.cat(MagnitudeRG).rename([rgbYears.red.toString()+'_'+rgbYears.green.toString()]);
    
      // exports RG image 2
      Export.image.toDrive({
        image:fittedMagnitudeImageRG
          .clip(aoi)
          .unmask(-9999), 
        description: fileName+'-'+rgbYears.red.toString()+"-"+rgbYears.green.toString()+"-magnitude-and-direction", 
        folder:folderName+'-'+rgbYears.red.toString()+"-"+rgbYears.green.toString()+"-magnitude-and-direction", 
        fileNamePrefix: fileName+'-'+rgbYears.red.toString()+"-"+rgbYears.green.toString()+"-magnitude-and-direction", 
        region:aoi, 
        scale:30, 
        crs:"EPSG:"+epsgCode,
        maxPixels: 1e13 
      });
      print('tasked RG Delta image');
    }
    if(imagesToDownload[i] === 3){
      //calculate magnitude and direction imagery
      var MagnitudeGB = ftvStack.expression(
        'vert2 == 0 ? 0 : (vert1 > vert2 ? -1*(vert1 - (vert2)) : vert2 - (vert1))', {
        'vert1': ftvStack.select(rgbYears.green.toString()),
        'vert2': ftvStack.select(rgbYears.blue.toString())           
        });
        
      var fittedMagnitudeImageGB = ee. Image.cat(MagnitudeGB).rename([rgbYears.green.toString()+'_'+rgbYears.blue.toString()]);
      
      // exports Gb image 3
      Export.image.toDrive({
        image:fittedMagnitudeImageGB
          .clip(aoi)
          .unmask(-9999), 
        description: fileName+'-'+rgbYears.green.toString()+"-"+rgbYears.blue.toString()+"-magnitude-and-direction", 
        folder:folderName+'-'+rgbYears.green.toString()+"-"+rgbYears.blue.toString()+"-magnitude-and-direction", 
        fileNamePrefix: fileName+'-'+rgbYears.green.toString()+"-"+rgbYears.blue.toString()+"-magnitude-and-direction", 
        region:aoi, 
        scale:30, 
        crs:"EPSG:"+epsgCode,
        maxPixels: 1e13 
      });     
      print('tasked GB Delta image');
    }
    // exports Change filter imagery
    if(imagesToDownload[i] === 4){
      // get disturbance mapping parameters
      var distParams = {};
      distParams.index = index;
      distParams.delta = changeTypeFilter.widgets().get(1).getValue();
      distParams.sort = distTypeFilter.widgets().get(1).getValue();
      
      var distYearsFilter = ltgee.getYears(yearFilter);
      
      distParams.year = {
        checked: yearFilter.widgets().get(0).getValue(), 
        start: parseInt(distYearsFilter.startYear), 
        end: parseInt(distYearsFilter.endYear)
      };

      distParams.mag = {
        checked: magFilter.widgets().get(0).getValue(),
        value: parseFloat(magFilter.widgets().get(1).widgets().get(1).getValue()),
        operator: magFilter.widgets().get(1).widgets().get(3).getValue().toString()
      };
      
      if (DSNRopt === true ){distParams.mag.dsnr = true; console.log('DSNR')}  
      
      distParams.dur = {
        checked: durFilter.widgets().get(0).getValue(),
        value: parseFloat(durFilter.widgets().get(1).widgets().get(1).getValue()),
        operator: durFilter.widgets().get(1).widgets().get(3).getValue().toString()
      };
      
      distParams.preval = {
        checked: prevalFilter.widgets().get(0).getValue(),
        value: parseFloat(prevalFilter.widgets().get(1).widgets().get(1).getValue()),
        operator: prevalFilter.widgets().get(1).widgets().get(3).getValue().toString()
      };
      
      distParams.mmu = {
        checked: mmuFilter.widgets().get(0).getValue(),
        value: parseInt(mmuFilter.widgets().get(1).getValue())
      };

      // get the disturbance map layers
      var distImg = ltgee.getChangeMap(lt, distParams);
      console.log(distImg)
      
      Export.image.toDrive({
        image:distImg.select(['yod','mag','dur']).short() 
          .clip(aoi)
          .unmask(-9999), 
        description: fileName+'-'+distParams.year.start.toString()+"-"+ distParams.year.end.toString()+"-YOD-Mag-Dur", 
        folder:folderName+'-'+distParams.year.start.toString()+"-"+ distParams.year.end.toString()+"-YOD-Mag-Dur", 
        fileNamePrefix: fileName+'-'+distParams.year.start.toString()+"-"+ distParams.year.end.toString()+"-YOD-Mag-Dur", 
        region:aoi, 
        scale:30, 
        crs:"EPSG:"+epsgCode,
        maxPixels: 1e13 
      });      
      print('tasked change imagery');
      
    }
    //Full time series image export
    if(imagesToDownload[i] === 5){
      
      for (var jj=0; jj<=1+(colYrs.endYear-colYrs.startYear); jj++) {

        Export.image.toDrive({
        image:ftvStack.select(jj)
        .clip(aoi)
        .unmask(-9999), 
        description: fileName+'-'+(jj+colYrs.startYear).toString()+"-ofFullFittedTimeSeries", 
        folder:folderName+'-'+(jj+colYrs.startYear).toString()+"-ofFullFittedTimeSeries", 
        fileNamePrefix: fileName+'-'+(jj+colYrs.startYear).toString()+"-ofFullFittedTimeSeries", 
        region:aoi, 
        scale:30, 
        crs:"EPSG:"+epsgCode,
        maxPixels: 1e13 
        });      
        
      }
    }
  }

  // make a dictionary of the run info
  var runInfo = ee.Dictionary({
    'Coordinates': coords, 
    'LandTrendr_Params': runParams, 
    'Collection_Years': colYrs, 
    'Collection_Dates': colDates,
    'Index': index,
    'RGB_Years': rgbYears,
    'Masks': masked,
    'Buffer': buffer/1000,
    'EPSG': epsgCode
  });

  var runInfo = ee.FeatureCollection(ee.Feature(null, runInfo));

  // EXPORT STUFF
  // export the run info.
  Export.table.toDrive({
    collection: runInfo,
    description: fileName+"-LT-Run-Info-Data",
    folder: folderName+"-LT-Run-Info-Data" ,
    fileNamePrefix: fileName+"-LT-Run-Info-Data",
    fileFormat: 'CSV'
  });

};         

// function to draw plots of source and fitted time series to panel//
var plotTimeSeries = function(){  
  plotHolder = plotHolder.clear();
  var Index = ltgeeUI.indexSelectGet(indexSelectPanel)[0];
  var runParams = ltgeeUI.getParams(paramPanel);
  var colYrs = ltgeeUI.colYearsGet(colYearsPanel);
  var colDates = ltgeeUI.colDatesGet(colDatesPanel);
  var coords = ltgeeUI.coordsGet(coordsPanelTS);
  var buffer = ltgeeUI.getBuffer(bufferPanelTS);
  print(buffer);
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var pixel = point.buffer(ee.Number(buffer).divide(2)).bounds();
  var displayPixel = point.buffer(ee.Number(250)).bounds();
  map.layers().set(7, ui.Map.Layer(pixel, {color:'FF0000'}, 'Target'));
  var doTheseIndices = [];
  indexBoxesTS.forEach(function(name, index) {
    
    var isChecked = indexBoxesTS[index].getValue();
    if(isChecked){
      doTheseIndices.push([indexListTS[index][0],indexListTS[index][1]]);
    }
  });
  
  // make an annual SR collection
  var annualSRcollection = ltgee.buildSRcollection(colYrs.startYear, colYrs.endYear, colDates.startDate, colDates.endDate, pixel);

  // for each selected index, draw a plot to the plot panel
  doTheseIndices.forEach(function(name, index) {
    var annualLTcollection = ltgee.buildLTcollection(annualSRcollection, name[0], []);

    runParams.timeSeries = annualLTcollection;
    var lt = ee.Algorithms.TemporalSegmentation.LandTrendr(runParams);
    var chart = chartPoint(lt, pixel, name[0], name[1], buffer);
    plotHolder.add(chart);
  });
};

var chartPoint = function(lt, pixel, index, indexFlip, scale) {
  var pixelTimeSeriesData = ltPixelTimeSeriesArray(lt, pixel, indexFlip, scale);
  return ui.Chart(pixelTimeSeriesData.ts, 'LineChart',
            {
              'title' : 'Index: '+index + ' | Fit RMSE:'+ (Math.round(pixelTimeSeriesData.rmse * 100) / 100).toString(),
             
              'hAxis': 
                {
                  'title': 'Year',
                  'format':'####',
                  'gridlines': {'count':5}
                },
              'vAxis':
                {
                  'title': 'Spectral Value',
                  'maxValue': 1,
                  'minValue': -1  
                },
              'series':{
                0: {
                  'color': '#cccccc',
                  'lineWidth': 8
                }, 
                1: {
                  'color': '#dd0000',
                  'lineWidth': 3
                }
              },
              'legend': {'position':'bottom'},
            },
            {'columns': [0, 1, 2]}
          );

};

// =============================================================================================
	
	function ltPolygonTimeSeriesArray(lt, aoi, indexFlip, scale){
	  var polygonTS = ltPolygonTimeSeries(lt, aoi, scale);
	  if(polygonTS.LandTrendr === null){polygonTS.LandTrendr = [[0,0],[0,0],[0,0]]}
	  var data = [['Year', 'Original', 'Fitted']];
	  var len = polygonTS.LandTrendr[0].length;
	  for (var i = 0; i < len; i++) {
	    data = data.concat([[polygonTS.LandTrendr[0][i], polygonTS.LandTrendr[1][i]*indexFlip, polygonTS.LandTrendr[2][i]*indexFlip]]);
	  }
	  return {ts:data, rmse:polygonTS.rmse};
	}
	
	var ltPolygonTimeSeries = function(img, aoi, scale) {
	  return img.reduceRegion({
	   reducer: 'first',
	   geometry: aoi,
	   // TODO: When you draw a polygon and plot NDVI trend in the RGB Change Options,
	   // the polygon size should be approximately 13km * 13km
	   scale: 100  // (m). 
	  }).getInfo();
	};
	
	var chartPoint_aoi = function(lt, pixel, index, indexFlip, scale) {
	  var polygonTimeSeriesData = ltPolygonTimeSeriesArray(lt, pixel, indexFlip, scale);
	  return ui.Chart(polygonTimeSeriesData.ts, 'LineChart',
	            {
	              'title' : 'Index: '+index + ' | Fit RMSE:'+ (Math.round(polygonTimeSeriesData.rmse * 100) / 100).toString(),
	              'hAxis': 
	                {
	                  'title': 'Year',
	                  'format':'####',
	                  'gridlines': {'count':5}
	                },
	              'vAxis':
	                {
	                  'title': 'Spectral Value',
	                  'maxValue': 1,
	                  'minValue': -1  
	                },
	              'series':{
	                0: {
	                  'color': '#cccccc',
	                  'lineWidth': 8
	                }, 
	                1: {
	                  'color': '#dd0000',
	                  'lineWidth': 3
	                }
	              },
	              'legend': {'position':'bottom'},
	            },
	            {'columns': [0, 1, 2]}
	          );
	};
	
	// function to draw plots of source and fitted time series to panel//
	var plotTimeSeries2 = function(){ 
	  var coords = ltgeeUI.coordsGet(coordsPanel);
	  var importedLyrcheckbox = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[0];
	  var importedLyr1 = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[0];
	  var aoi;
	  var selectDraw = ltgeeUI.getDrawPolygon(drawPanel);
	  if (selectDraw === true ){
	    aoi = getAverageElevation();
	    map.centerObject(aoi);
	  }else if(importedLyrcheckbox === true){
	    aoi = ee.FeatureCollection(importedLyr1).geometry();
	    map.centerObject(aoi);
	  }else{
	    var buffer = ltgeeUI.getBuffer(bufferPanel);
	    buffer = buffer*1000;
	    var point = ee.Geometry.Point(coords.lon, coords.lat).buffer(200);
	    aoi = point.buffer(buffer).bounds();
	    map.centerObject(aoi);
	  }
	  plotHolder = plotHolder.clear();
	  var Index = ltgeeUI.indexSelectGet(indexSelectPanel)[0];
	  var runParams = ltgeeUI.getParams(paramPanel);
	  var colYrs = ltgeeUI.colYearsGet(colYearsPanel);
	  var colDates = ltgeeUI.colDatesGet(colDatesPanel);
	  map.layers().set(7, ui.Map.Layer(aoi, {color:'FF0000'}, 'Target'));
	  var doTheseIndices = [];
	  indexBoxesTS.forEach(function(name, index) {
	    
	    var isChecked = indexBoxesTS[index].getValue();
	    if(isChecked){
	      doTheseIndices.push([indexListTS[index][0],indexListTS[index][1]]);
	    }
	  });
	  
	  // make an annual SR collection
	  var annualSRcollection = ltgee.buildSRcollection(colYrs.startYear, colYrs.endYear, colDates.startDate, colDates.endDate, aoi);
	
	  // for each selected index, draw a plot to the plot panel
	  doTheseIndices.forEach(function(name, index) {
	    var annualLTcollection = ltgee.buildLTcollection(annualSRcollection, name[0], []);
	
	    runParams.timeSeries = annualLTcollection;
	    var lt = ee.Algorithms.TemporalSegmentation.LandTrendr(runParams);
	   // TODO: When you draw a polygon and plot NDVI trend in the RGB Change Options,
	   // the polygon size should be approximately 13km * 13km
	    var scale = 13000;  // (m).  
	    var chart = chartPoint_aoi(lt, aoi, name[0], name[1], scale);
	    plotHolder.add(chart);
	  });
	};

//==============================================================================================================================
// RETURN LT RESULTS FOR A SINGLE PIXEL AS AN OBJECT//
var ltPixelTimeSeries = function(img, pixel, scale) {
  return img.reduceRegion({
   reducer: 'first',
   geometry: pixel,
   scale: scale
  }).getInfo();
};

//==============================================================================================================================
// PARSE OBJECT RETURNED FROM 'getPoint' TO ARRAY OF SOURCE AND FITTED//
function ltPixelTimeSeriesArray(lt, pixel, indexFlip, scale){
  var pixelTS = ltPixelTimeSeries(lt, pixel, scale);
  if(pixelTS.LandTrendr === null){pixelTS.LandTrendr = [[0,0],[0,0],[0,0]]}
  var data = [['Year', 'Original', 'Fitted']];
  var len = pixelTS.LandTrendr[0].length;
  for (var i = 0; i < len; i++) {
    data = data.concat([[pixelTS.LandTrendr[0][i], pixelTS.LandTrendr[1][i]*indexFlip, pixelTS.LandTrendr[2][i]*indexFlip]]);
  }
  return {ts:data, rmse:pixelTS.rmse};
}

//================================================================================================================================================
//==== YOD ploter 

var mapDisturbance = function(){
  var coords = ltgeeUI.coordsGet(coordsPanel);
  var runParams = ltgeeUI.getParams(paramPanel);
  runParams.timeSeries = ee.ImageCollection([]);
  var colYrs = ltgeeUI.colYearsGet(colYearsPanel);
  var colDates = ltgeeUI.colDatesGet(colDatesPanel);
  var index = ltgeeUI.indexSelectGet(indexSelectPanel)[0];
  var ftv = ltgeeUI.indexSelectGet(indexSelectPanel)[0];
  var rgbYears = ltgeeUI.rgbYearsGet(rgbYearsPanel);
  var masked = ltgeeUI.getMaskSelect(maskPanel);   
  var aoi;
  var DSNRopt = false;
  var selectDraw = ltgeeUI.getDrawPolygon(drawPanel);
    
  var importedLyrcheckbox = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[0];
  var importedLyr1 = ltgeeUI.lyrOverlayGet(LayerOverlayPanel)[0];

  if (selectDraw === true ){
    aoi = getAverageElevation();
    map.centerObject(aoi);
  }else if(importedLyrcheckbox === true){
    aoi = ee.FeatureCollection(importedLyr1).geometry();
    map.centerObject(aoi);
    
  }else{
    var buffer = ltgeeUI.getBuffer(bufferPanel);
    buffer = buffer*1000;
    var point = ee.Geometry.Point(coords.lon, coords.lat).buffer(200);
    aoi = point.buffer(buffer).bounds();
    map.centerObject(aoi);
  }
  
  print(aoi);
  
  // run landtrendr and get the segmenation information
  var lt = ltgee.runLT(colYrs.startYear, colYrs.endYear, colDates.startDate, colDates.endDate, aoi, index, [], runParams, masked);

  // get disturbance mapping parameters
  var distParams = {};
  distParams.index = index;
  distParams.delta = changeTypeFilter.widgets().get(1).getValue();
  distParams.sort = distTypeFilter.widgets().get(1).getValue();
  
  var distYearsFilter = ltgee.getYears(yearFilter);
  distParams.year = {
    checked: yearFilter.widgets().get(0).getValue(), 
    start: parseInt(distYearsFilter.startYear), 
    end: parseInt(distYearsFilter.endYear)
  };
  
  distParams.mag = {
    checked: magFilter.widgets().get(0).getValue(),
    value: parseFloat(magFilter.widgets().get(1).widgets().get(1).getValue()),
    operator: magFilter.widgets().get(1).widgets().get(3).getValue().toString()
  };
  
  if (DSNRopt === true ){distParams.mag.dsnr = true; console.log('DSNR')}  
  
  distParams.dur = {
    checked: durFilter.widgets().get(0).getValue(),
    value: parseFloat(durFilter.widgets().get(1).widgets().get(1).getValue()),
    operator: durFilter.widgets().get(1).widgets().get(3).getValue().toString()
  };

  distParams.preval = {
    checked: prevalFilter.widgets().get(0).getValue(),
    value: parseFloat(prevalFilter.widgets().get(1).widgets().get(1).getValue()),
    operator: prevalFilter.widgets().get(1).widgets().get(3).getValue().toString()
  };

  distParams.mmu = {
    checked: mmuFilter.widgets().get(0).getValue(),
    value: parseInt(mmuFilter.widgets().get(1).getValue())
  };

  // get the disturbance map layers
  var distImg = ltgee.getChangeMap(lt, distParams).clip(aoi);

  // set visualization dictionaries
  var yodVizParms = {
    min: 1985, 
    max: 2021, 
    palette: ['#9400D3', '#4B0082', '#0000FF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000']
  };
  
  var magVizParms = {
    min: 0, 
    max: 1000,
    palette: ['#0000FF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000']
  };
  
  var durVizParms = {
    min: 1,
    max: 10,
    palette: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF']
  };
  
  var preValVizParms = {
    min: 200, 
    max: 800,
    palette: ['#F1F1F1', '#FFC9B8', '#FFC183', '#E1BB4E', '#B4B61A', '#7EAF12', '#26A63A']
  };
  
  // display the disturbance attribute maps 
  map.layers().set(4, ui.Map.Layer(distImg.select(['dur']), durVizParms, 'Duration'));             // add disturbance duration to map
  map.layers().set(5, ui.Map.Layer(distImg.select(['mag']), magVizParms, 'Magnitude'));            // add magnitude to map
  map.layers().set(6, ui.Map.Layer(distImg.select(['yod']), yodVizParms, 'Year of Detection'));    // add disturbance year of detection to map

};

//==============================================================================================================================
// display initial layers//
var holder = ee.Image(0).selfMask();
map.layers().set(0, ui.Map.Layer(holder, {}, 'RGB Change', false));
map.layers().set(1, ui.Map.Layer(holder, {}, 'Red Green Delta', false));
map.layers().set(2, ui.Map.Layer(holder, {}, 'Green Blue Delta', false));
map.layers().set(3, ui.Map.Layer(holder, {}, 'Full Time Series', false));
map.layers().set(4, ui.Map.Layer(holder, {}, 'Duration', false));
map.layers().set(5, ui.Map.Layer(holder, {}, 'Magnitude', false));
map.layers().set(6, ui.Map.Layer(holder, {}, 'Year of Detection', false));
map.layers().set(7, ui.Map.Layer(holder, {}, 'TS Pixel', false));
map.layers().set(8, ui.Map.Layer(holder, {}, 'Your layer 1', false));
map.layers().set(9, ui.Map.Layer(holder, {}, 'Your layer 2', false));
map.layers().set(10, ui.Map.Layer(holder, {}, 'Your layer 3', false));

//==============================================================================================================================
// set a callback function for when the user clicks the map.//
map.onClick(function(coords) {
  if(rgbChangeCtrlPanel.style().get('shown') && ltgeeUI.getDrawPolygon(drawPanel) === false){
    coordsPanel.widgets().get(1).widgets().get(1).setValue(coords.lon);
    coordsPanel.widgets().get(1).widgets().get(3).setValue(coords.lat);
  } else if(tsCtrlPanel.style().get('shown')){
    coordsPanelTS.widgets().get(1).widgets().get(1).setValue(coords.lon);
    coordsPanelTS.widgets().get(1).widgets().get(3).setValue(coords.lat);
    plotTimeSeries();
  } 
});

//===============================================================================================================
//===========OTHER FUNCTIONS ================================================================================
//===============================================================================================================

ndviButtonTS.onClick(function(){
	  var coords = ltgeeUI.coordsGet(coordsPanelTS);
	  var buffer = 10;
	  var point = ee.Geometry.Point(coords.lon, coords.lat);
	  var pixel = point.buffer(ee.Number(buffer).divide(2)).bounds();
	  map.centerObject(pixel, 14);
	  plotTimeSeries2();
	});

//==========================================================================================================================
// set a callback function for when the user clicks submit.//
submitButtonTS.onClick(function(){
  //REK adding this to center on pixel
  var coords = ltgeeUI.coordsGet(coordsPanelTS);
  var buffer = 10;
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var pixel = point.buffer(ee.Number(buffer).divide(2)).bounds();
  map.centerObject(pixel, 14);
  plotTimeSeries();
});
//=======================================================================================================================
// set a callback function for when the user clicks submit.//
submitButton.onClick(function(){
  plotTheMap();
  if (typeof map.drawingTools().layers().get(0) !== 'undefined') {map.drawingTools().layers().get(0).setShown(false)}
  
});
//========================================================================================================================
// set a callback function for when the user clicks button.//
deltaButtonRG.onClick(function(){
  plotTheRGDeltaMap();
  if (typeof map.drawingTools().layers().get(0) !== 'undefined') {map.drawingTools().layers().get(0).setShown(false)}
});
//==============================================================================================================================
// set a callback function for when the user clicks button.//
deltaButtonGB.onClick(function(){
  plotTheGBDeltaMap();
  if (typeof map.drawingTools().layers().get(0) !== 'undefined') {map.drawingTools().layers().get(0).setShown(false)}
});
//==============================================================================================================================


//==============================================================================================================================
// set a callback function for when the user clicks submit.//
assetButton.onClick(function(){
  plotAsset();
  if (typeof map.drawingTools().layers().get(0) !== 'undefined') {map.drawingTools().layers().get(0).setShown(false)}
});
//==============================================================================================================================



//==============================================================================================================================
// set a callback function for when the user clicks submit.//
YODButton.onClick(function(){
  mapDisturbance();
  if (typeof map.drawingTools().layers().get(0) !== 'undefined') {map.drawingTools().layers().get(0).setShown(false)}
});
//==============================================================================================================================
// set a callback function for when the user clicks submit.//==============================================================================================================================
timeSeriesButton.onClick(function(){
  fullTimeSeriesMap();
  if (typeof map.drawingTools().layers().get(0) !== 'undefined') {map.drawingTools().layers().get(0).setShown(false)}
});
//==============================================================================================================================
drawPanel.widgets().get(1).onChange(function() {
  // Shows or hides the first map layer based on the checkbox's value.
  if (drawPanel.widgets().get(1).getValue()){
    map.drawingTools().setShape('polygon');
    map.drawingTools().onDraw(function(){map.drawingTools().stop()});
  }else{
    map.drawingTools().stop();
    map.drawingTools().clear();
  }
});
//==============================================================================================================================
var getAverageElevation = (function() {
  var polygon = map.drawingTools().layers().get(0).toGeometry();
  return polygon;
});

//==============================================================================================================================
//==============================================================================================================================
// set a callback function for when the user clicks download full time series//
DownloadButton.onClick(function(){
  downloadTheMap();

});

//==============================================================================================================================
//==============================================================================================================================
ui.root.add(controlPanel);
ui.root.add(map);
map.setCenter(6.228197, 53.374121, 11);  //set default center of map to Lauwersmeer
map.drawingTools().setLinked(false);
map.drawingTools().setDrawModes(['polygon']);

ui.root.add(plotPanel);









