// River migration of the Jamuna, Padma and Meghna rivers, Bangladesh
// Landsat 5/7/8/9 Collection 2 Level-2 surface reflectance
// GEE (JavaScript)
var EPOCHS = [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025];
var DRY_START_MONTH = 12;    var DRY_END_MONTH = 3;
var MAX_CLOUD = 60;           // cloud cover limit (in %)
var MIN_PATCH_PIXELS = 500;   // water patches smaller than this are removed (500 px = 0.45 km2)
var USE_OTSU = true;          // true = Otsu threshold per epoch
var FIXED_THRESHOLD = 0.0;    // used only when USE_OTSU = false
var STRIP_STEP = 0.02;        // strip width in degree
var SCALE = 30;
var CRS = 'EPSG:32646';       // UTM zone 46N
var DRIVE_FOLDER = 'GEE_river_migration';

// RIVER REACHES 
// 'NS' = river flows north to south, strips are cut across latitude.


// 'EW' = river flows west to east, strips are cut across longitude.
// Jamuna: Bangladesh border to 24.05 N (just above the Padma confluence).
var reachInfo = [
  {name: 'Jamuna', orient: 'NS', coords: [[89.45, 25.90], [90.00, 25.90], [90.00, 24.05], [89.45, 24.05]]},

  // Padma: Ganges entry near Chapai Nawabganj to the Meghna confluence at Chandpur.
 {name: 'Padma', orient: 'EW', coords: [[88.10, 24.90], [88.65, 24.55], [89.05, 24.25], [89.45, 24.05], [90.00, 24.05], [90.30, 23.65], [90.68, 23.38], [90.52, 23.15], [90.15, 23.30], [89.70, 23.65],
    [89.00, 23.90], [88.55, 24.20], [88.05, 24.60]]},
