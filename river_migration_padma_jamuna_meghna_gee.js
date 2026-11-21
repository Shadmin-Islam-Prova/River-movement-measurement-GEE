// Jamuna, Padma and Meghna rivers movement check (1990-2025)
// Landsat 5/7/8/9 Collection 2 Level-2 surface reflectance
// GEE
var EPOCHS = [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025];
var DRY_START_MONTH = 12;    var DRY_END_MONTH = 3;
var MAX_CLOUD = 60;           // cloud cover limit in %
var MIN_PATCH_PIXELS = 500;   // water patches smaller than 500 px are removed (500 px = 0.45 km2)
var USE_OTSU = true;          // true = Otsu threshold per epoch
var FIXED_THRESHOLD = 0.0;    // used only when USE_OTSU = false
var STRIP_STEP = 0.02;        // strip width in degree
var SCALE = 30;
var CRS = 'EPSG:32646';       // UTM zone 46N
var DRIVE_FOLDER = 'GEE_river_migration';

// RIVER REACHES 
// 'NS' = river flows north to south, strips are cut across latitude


// 'EW' = river flows west to east, strips are cut across longitude
// Jamuna: Bangladesh border to 24.05 N (just above the Padma confluence)
var reachInfo = 
  [
  {name: 'Jamuna', orient: 'NS', coords: [[89.45, 25.90], [90.00, 25.90], [90.00, 24.05], [89.45, 24.05]]},

  // Padma: Ganges entry near Chapai Nawabganj to the Meghna confluence at Chandpur.
 {name: 'Padma', orient: 'EW', coords: [[88.10, 24.90], [88.65, 24.55], [89.05, 24.25], [89.45, 24.05], [90.00, 24.05], [90.30, 23.65], [90.68, 23.38], [90.52, 23.15], [90.15, 23.30], [89.70, 23.65],
    [89.00, 23.90], [88.55, 24.20], [88.05, 24.60]]},
// Meghna: Bhairab to 22.6 N (north of Bhola)
  {name: 'Meghna', orient: 'NS', coords: [[90.80, 24.15], [91.10, 24.15], [90.95, 23.60], [90.85, 23.25], [91.05, 22.60],
    [90.45, 22.60], [90.52, 23.15], [90.68, 23.38], [90.55, 23.62]]}
];

var reaches = ee.FeatureCollection(reachInfo.map(function(r) 
                                                 {
  return ee.Feature(ee.Geometry.Polygon([r.coords], null, false),
                    {reach: r.name, orient: r.orient});
}));
var studyArea = reaches.geometry();
// LANDSAT Image Acquisition 
function cloudMask(img) 
{
  var qa = img.select('QA_PIXEL');
  // bit 1 = dilated cloud, bit 3 = cloud, bit 4 = cloud shadow
  var clear = qa.bitwiseAnd(1 << 1).eq(0)
    .and(qa.bitwiseAnd(1 << 3).eq(0))
    .and(qa.bitwiseAnd(1 << 4).eq(0));
  var notSaturated = img.select('QA_RADSAT').eq(0);
  return clear.and(notSaturated);
}

// Landsat 5 TM and Landsat 7 ETM+
function prepL57(img) 
{
  var sr = img.select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'],
                      ['Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2']) .multiply(0.0000275).add(-0.2);
 return ee.Image(sr.updateMask(cloudMask(img))
                    .copyProperties(img, ['system:time_start']));
  }
 
// Landsat 8 and 9 OLI
function prepL89(img) {
  var sr = img.select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'],
                      ['Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2'])
              .multiply(0.0000275).add(-0.2); 
   return ee.Image(sr.updateMask(cloudMask(img))
                    .copyProperties(img, ['system:time_start']));
}
// Landsat 8 and 9 OLI
function prepL89(img) {
  var sr = img.select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'],
                      ['Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2'])
              .multiply(0.0000275).add(-0.2);
  return ee.Image(sr.updateMask(cloudMask(img))
                    .copyProperties(img, ['system:time_start']));
}
 
// Dry-season images from Dec (year-1) to Mar (year+1).
// This uses two dry seasons around each epoch year.
function landsatDry(year) {
  var start = ee.Date.fromYMD(year - 1, 12, 1);
  var end = ee.Date.fromYMD(year + 1, 4, 1);
  var filt = ee.Filter.and(
    ee.Filter.bounds(studyArea),
    ee.Filter.date(start, end),
    ee.Filter.calendarRange(DRY_START_MONTH, DRY_END_MONTH, 'month'),
    ee.Filter.lt('CLOUD_COVER', MAX_CLOUD));
 
  var col = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2').filter(filt).map(prepL57)
    .merge(ee.ImageCollection('LANDSAT/LC08/C02/T1_L2').filter(filt).map(prepL89))
    .merge(ee.ImageCollection('LANDSAT/LC09/C02/T1_L2').filter(filt).map(prepL89));
 
