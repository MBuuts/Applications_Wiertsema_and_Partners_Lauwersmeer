///// USER VARIABLES /////
var startYear = 1985
var endYear = 2018
var referenceYear = endYear-1
var cityName = 'Padua'
var myCity = ee.FeatureCollection("FAO/GAUL/2015/level0")
                  .filter(ee.Filter.eq('ADM0_NAME', 'Netherlands')); //filter for entry that equals the UN country name 'Lebanon'

// upldoad your shapefile to the gee, and set here its address
//var myCity = ee.FeatureCollection('projects/ee-davey265/assets/Lauwersmeer2')
/////////////////////////

var myCityGeometry = myCity.first().geometry()


function getAnnualGreenness(){
  var L7coll = ee.ImageCollection("LANDSAT/LE07/C01/T1_ANNUAL_GREENEST_TOA"),
      L4coll = ee.ImageCollection("LANDSAT/LT04/C01/T1_ANNUAL_GREENEST_TOA"),
      L5coll = ee.ImageCollection("LANDSAT/LT05/C01/T1_ANNUAL_GREENEST_TOA"),
      L8coll = ee.ImageCollection("LANDSAT/LC08/C01/T1_ANNUAL_GREENEST_TOA")
  
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

  //print(ee.ImageCollection(collection))
  //print(ee.ImageCollection(collection.filter(ee.Filter.calendarRange(2000, 2000, 'year'))))
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
  // (this is valid only if you have enough years, say > 10)
  // var(kt) ~ 2*(2n+5)/[9n*(n-1)]
  ktau = ktau.select('greenness_tau')
  var n = endYear - startYear + 1
  var ktvar = 2*(2*n + 5)/(9*n*(n-1))
  var ktstdev = Math.sqrt(ktvar)
  // computing the z-value of ktau in normalized cooridnates
  var z = ktau.abs().divide(ktstdev)

  // getting the p-value as 1 - the cumulate normal distribution at z
  // the normal cdf is given by {1 + erf[z/sqrt(2)]}/2
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
  ///// mann kendall test /////
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

// computing annual greenness and estimating the regression
var annualGreenness = getAnnualGreenness()
var reg = computeSenRegression(annualGreenness)
var mask = getUrbanGreenInfrastructureMask(annualGreenness)
reg = reg.addBands(mask).float()
var greennessRef = getGreennessRef(annualGreenness)
reg = reg.addBands(greennessRef).float()

// plotting
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

function exportImage(band){
  Export.image.toDrive({image:reg.select(band), description:cityName+'_'+band, scale:10, region:myCityGeometry})
}
exportImage('greenness_slope')
exportImage('greenness_intercept')
exportImage('greenness_tau')
exportImage('greenness_tau_pvalue')
exportImage('ugi_mask')
exportImage('greenness_ref')
