// File name: Ib01_APP.js
// APP name: ViWi (Vegetation Index Wiertsema & Partners)
// Description: This script runs the application for NDVI slope trend analysis.
// Date: 28-06-2022
// Authors: Persa Koutsouradi (persa.koutsouradi@wur.nl)
//          Shoyo Nakamura (shoyo.nakamura@wur.nl)
//          Kristie Swinkels (kristie.swinkels@wur.nl)
//          Davey de Groot (davey.degroot@wur.nl)
//          Marieke Buuts (marieke.buuts@wur.nl)
// Course: Remote Sensing and GIS integration at Wageningen University in the Netherlands
// License: Apache License 2.0
// Sources used:https://code.earthengine.google.com/6f77dca2e8a17407db20ecf9b9fc83a4

// =============================================================================================

 //set default center of map to Lauwersmeer
Map.setCenter(6.228197, 53.374121, 11); 

///// USER VARIABLES /////
var startYear = 1985;
var endYear = 2021;
var referenceYear = endYear-1;
var cityName = 'Groningen';
var myCity = ee.FeatureCollection("FAO/GAUL/2015/level0")
                  //filter for entry that equals the UN country name 'Netherlands'
                  .filter(ee.Filter.eq('ADM0_NAME', 'Netherlands')); 

// upldoad your shapefile to the gee, and set here its address
//var myCity = ee.FeatureCollection('projects/ee-davey265/assets/Lauwersmeer2')
/////////////////////////

var myCityGeometry = myCity.first().geometry();


function getAnnualGreenness(){
  var L7coll = ee.ImageCollection("LANDSAT/LE07/C01/T1_ANNUAL_GREENEST_TOA"),
      L4coll = ee.ImageCollection("LANDSAT/LT04/C01/T1_ANNUAL_GREENEST_TOA"),
      L5coll = ee.ImageCollection("LANDSAT/LT05/C01/T1_ANNUAL_GREENEST_TOA"),
      L8coll = ee.ImageCollection("LANDSAT/LC08/C01/T1_ANNUAL_GREENEST_TOA");
  
  // correcting the collection data to make them compatible with Landsat 8
  function green_2012_correct(input) {
    return (input.multiply(0.9352)).add(0.0490).copyProperties(input,['system:time_start'])
  }
  function green_L45_correct(input) {
      return (input.multiply(0.979)).add(0.002).copyProperties(input,['system:time_start']);
  }
  var L7coll_corr = L7coll.map(green_2012_correct)
  var L4coll_corr_1 = L4coll.map(green_L45_correct)
  var L4coll_corr_2 = L4coll_corr_1.map(green_2012_correct)
  var L5coll_corr_1 = L5coll.map(green_L45_correct)
  var L5coll_corr_2 = L5coll_corr_1.map(green_2012_correct)

  // merge collections
  var collection = ee.ImageCollection(L4coll_corr_2.merge(L5coll_corr_2).merge(L7coll_corr).merge(L8coll)).select('greenness')

  // compute the annual median
  var annualGreenness = ee.List.sequence(startYear,endYear,1).map(function(year){
    year = ee.Number(year)
    var mdn = ee.Image(collection
      .filter(ee.Filter.calendarRange(year, year, 'year'))
      .median()).rename('greenness')
    var yrimg = ee.Image.constant(year.subtract(startYear)).rename('year').float()
    var img = yrimg.addBands(mdn)
    img = img.set('system:time_start', ee.Date.fromYMD(year, 1, 1).millis())
    return img
    })
  return ee.ImageCollection(annualGreenness)
}
  
  
  
function computeKendallTauAndPval(annualGreenness){
  var ktau = annualGreenness.select('greenness').reduce(ee.Reducer.kendallsCorrelation())
  // COMPUTING THE p-value, AS THE "reduce" FUNCTION RETURN A p-value UNIFORMLY NULL

  // approximating the std.dev. of kendall tau as a normal distribution 
  ktau = ktau.select('greenness_tau')
  var n = endYear - startYear + 1
  var ktvar = 2*(2*n + 5)/(9*n*(n-1))
  var ktstdev = Math.sqrt(ktvar)
  // computing the z-value of ktau in normalized cooridnates
  var z = ktau.abs().divide(ktstdev)

  // getting the p-value as 1 - the cumulate normal distribution at z
  var cdf = z.divide(Math.sqrt(2)).erf().add(1).divide(2)
  var pvalue = cdf.multiply(-1).add(1).rename('greenness_tau_pvalue')
  // multiplying by 2 because the test is 2-tailed
  pvalue = pvalue.multiply(2)
  var result = ktau.addBands(pvalue)
  return result
}  
  


function computeSenRegression(annualGreenness){
  var regression = annualGreenness.reduce(ee.Reducer.sensSlope())
  regression = regression.rename('greenness_slope', 'greenness_intercept')
  // computing the kendall tau and its significance
  var ktau = computeKendallTauAndPval(annualGreenness)
  return regression.addBands(ktau)
}

function getUrbanGreenInfrastructureMask(annualGreenness){
  var thrshld = .4
  return annualGreenness.select('greenness').reduce(ee.Reducer.max()).gt(thrshld).rename('ugi_mask').float()
}

function getGreennessRef(annualGreenness){
  var refColl = annualGreenness.filter(ee.Filter.calendarRange(referenceYear-1, referenceYear+1, 'year'))
  var greennessRef = refColl.select('greenness').reduce(ee.Reducer.mean()).float().rename('greenness_ref')
  return greennessRef
}

// Computing annual greenness and estimating the regression
var annualGreenness = getAnnualGreenness()
var reg = computeSenRegression(annualGreenness)
var mask = getUrbanGreenInfrastructureMask(annualGreenness)
reg = reg.addBands(mask).float()
var greennessRef = getGreennessRef(annualGreenness)
reg = reg.addBands(greennessRef).float()

// Plotting
function ColorBar(palette) {
  return ui.Thumbnail({
    image: ee.Image.pixelLonLat().select(0),
    params: {
      bbox: [0, 0, 1, 0.1],
      dimensions: '200x20',
      format: 'png',
      min: 0,
      max: 1,
      palette: palette,
    },
    style: {stretch: 'horizontal', margin: '0px 8px'},
  });
}

function makeLegend(low, mid, high, palette) {
  var labelPanel = ui.Panel(
      [
        ui.Label(low, {margin: '4px 8px'}),
        ui.Label(mid, {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
        ui.Label(high, {margin: '4px 8px'})
      ],
      ui.Panel.Layout.flow('horizontal'));
  return ui.Panel([ColorBar(palette), labelPanel])
}

var palette = ['800000', 'FF2000', 'FF8000', 'FFFF00', 'CCCCCC', '66FF66', '00FF00', '009900', '003300']
Map.addLayer(reg.select('ugi_mask').clip(myCityGeometry), {min:0, max:1, palette:['white', 'green']}, 'urban green infrastructure mask (green=ugi, white=no ugi)')
Map.addLayer(reg.select('greenness_tau_pvalue').clip(myCityGeometry), {min:0, max:1}, 'pval (black=0, green=1)')
Map.addLayer(reg.select('greenness_slope').clip(myCityGeometry), {min:-.03, max:.03, palette:palette}, 'slope')
Map.addLayer(reg.select('greenness_ref').clip(myCityGeometry), {min:0, max:1, palette:palette}, 'greenness (btw 0 and 1)')
Map.add(makeLegend('slope: -0.03', 0, '0.03 (yr^-1)', palette))


// Export results
function exportImage(band){
  Export.image.toDrive({image:reg.select(band), description:cityName+'_'+band, scale:10, region:myCityGeometry})
}
exportImage('greenness_slope')
exportImage('greenness_intercept')
exportImage('greenness_tau')
exportImage('greenness_tau_pvalue')
exportImage('ugi_mask')
exportImage('greenness_ref')
