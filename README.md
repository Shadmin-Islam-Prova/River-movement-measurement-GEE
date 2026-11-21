# River-movement-measurement-GEE
Landsat-based river channel migration, erosion and accretion of Jamuna, Padma and Meghna (GEE) rivers during dry season.

Three rivers:

- **Jamuna:** from the Bangladesh border to 24.05°N (NS flow)
- **Padma:** from the Ganges entry near Chapai Nawabganj to the Meghna confluence at Chandpur (WE flow)
- **Meghna:** from Bhairab to 22.6°N (NS flow)
Reach boundaries are drawn by hand and can be re-adjusted.

## Data

- Landsat 5 TM, Landsat 7 ETM+, Landsat 8 OLI and Landsat 9 OLI
- USGS Collection 2 Level-2 surface reflectance
- Considered dry seasons: December to March, cloud cover below 60%
- Epochs: 1990, 1995, 2000, 2005, 2010, 2015, 2020 and 2025 (Each epoch used two dry seasons around the epoch year)

## Method

1. Mask clouds, cloud shadows and saturated pixels using the QA bands.
2. Build a median composite for each epoch.
3. Calculating MNDWI = (Green − SWIR1) / (Green + SWIR1).
4. Set the water threshold with Otsu for each epoch. The threshold is limited to −0.3 to 0.3. A fixed threshold can be used instead.
5. Keep only connected water patches of at least 500 pixels (about 0.45 km²).
6. Erosion is land in the earlier epoch that becomes water in the later epoch. Accretion is the opposite.
7. Cut each reach into strips about 2.2 km wide. In each strip, find the outermost water pixel on each side. These positions are the bank lines.

## Outputs
Outputs will be saved to the Google Drive folder `GEE_river_migration`.

| File | Content |
|---|---|
| `River_area_erosion_accretion.csv` | Water area, erosion and accretion (km²) for each reach and period |
| `River_banks_Jamuna.csv`, `River_banks_Padma.csv`, `River_banks_Meghna.csv` | Bank positions (metres, UTM 46N) for each strip and epoch |
| `River_water_masks.tif` (optional) | Water maps for each epoch, for use in QGIS or ArcGIS |
