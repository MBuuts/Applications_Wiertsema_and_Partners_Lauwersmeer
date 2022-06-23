var extent_NL = ee.FeatureCollection("FAO/GAUL/2015/level0")
                  .filter(ee.Filter.eq('ADM0_NAME', 'Netherlands')); //filter for entry that equals the UN country name 'Lebanon'

var Start_period = ee.Date('2020-01-01')
var End_period = ee.Date(new Date().getTime())

var sentinel_dataset = ee.ImageCollection("COPERNICUS/S2_SR")
    .filterBounds(extent_NL)
    .filterDate(Start_period, End_period)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
    // .map(maskS2clouds)

var collection = sentinel_dataset.map(function(image) {
  return image.select().addBands(image.normalizedDifference(['B8', 'B4'])).rename('NDVI')
});

// UI widgets needs client-side data. evaluate()
// to get client-side values of start and end period
ee.Dictionary({start: Start_period, end: End_period})
  .evaluate(renderSlider) 

function renderSlider(dates) {
  var slider = ui.DateSlider({
    start: dates.start.value, 
    end: dates.end.value, 
    period: 30, // Every 5 days
    onChange: renderDateRange,
    style: ({position: 'bottom-right'})
  })
  Map.add(slider)
}



function renderDateRange(dateRange) {
  var image = collection
    .filterDate(dateRange.start(), dateRange.end())
    .median()
    .clip(extent_NL)
  
  var vis = {min: 0, max: 1, palette: [
    'FFFFFF', 'CE7E45', 'FCD163', '66A000', '207401',
    '056201', '004C00', '023B01', '012E01', '011301'
  ]}  
  var layer = ui.Map.Layer(image, vis, 'NDVI')
  Map.layers().reset([layer])
}


