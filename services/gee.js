import ee from '@google/earthengine';


function maskS2Clouds(image) {
  const qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  const cloudBitMask = 1 << 10;
  const cirrusBitMask = 1 << 11;

  // A pixel is considered clear if both flags are set to 0.
  const mask = qa.bitwiseAnd(cloudBitMask).eq(0)
                 .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  // Return the image with the mask applied. We also scale the reflectance values.
  // Sentinel-2 SR data is scaled by 10000. Dividing by this value gives us the
  // actual surface reflectance, a value between 0 and 1.
  return image.updateMask(mask).divide(10000);
}


export const processGeeTile = (geometry) => {
  // We wrap the entire GEE logic in a Promise to handle the asynchronous callbacks.
  return new Promise((resolve, reject) => {
    try {
      // 1. Define Area of Interest (AOI)
      // Convert the incoming GeoJSON geometry into a GEE Geometry object.
      const aoi = ee.Geometry(geometry);

      // 2. Define Date Range
      // We create a 14-day lookback window from the current moment.
      const endDate = ee.Date(Date.now());
      const startDate = endDate.advance(-14, 'day');

      // 3. Load, Filter, and Process Image Collection
      const s2Collection = ee.ImageCollection('COPERNICUS/S2_SR')
        .filterDate(startDate, endDate)
        .filterBounds(aoi)
        // Pre-filter to remove images that are mostly cloudy. This is an
        // efficient way to reduce the number of images to process.
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
        // Apply our cloud masking function to every image in the collection.
        .map(maskS2Clouds);

      // 4. Create a Cloud-Free Composite
      // The median() reducer takes all images in the collection for each pixel
      // and calculates the median value. This is a robust way to remove clouds
      // and create a single, representative image.
      const composite = s2Collection.median().clip(aoi);

      // 5. Calculate Vegetation Indices
      // NDVI = (NIR - Red) / (NIR + Red)
      // For Sentinel-2, NIR is band 'B8' and Red is band 'B4'.
      const ndvi = composite.normalizedDifference(['B8', 'B4']);

      // SAVI = [(NIR - Red) / (NIR + Red + L)] * (1 + L)
      // We use an expression for more complex formulas. L (soil factor) is 0.5.
      const savi = composite.expression(
        '(NIR - RED) / (NIR + RED + 0.5) * 1.5', {
          'NIR': composite.select('B8'),
          'RED': composite.select('B4'),
        }
      );

      // 6. Define Visualization Parameters for the map layers
      const commonVisParams = {
        min: -0.2,
        max: 0.9,
        // A perceptually uniform color palette for vegetation.
        palette: ['#440154', '#3b528b', '#21908d', '#5dc863', '#fde725'],
      };
      
      // 7. Generate Map IDs and Tokens
      // getMap() is an asynchronous operation with a callback. We wrap each call
      // in a Promise to use them with async/await or Promise.all.
      const getNdviMap = new Promise((res, rej) => {
        ndvi.getMap(commonVisParams, (map, err) => err ? rej(err) : res(map));
      });
      const getSaviMap = new Promise((res, rej) => {
        savi.getMap(commonVisParams, (map, err) => err ? rej(err) : res(map));
      });

      // We run both requests in parallel to save time.
      Promise.all([getNdviMap, getSaviMap])
        .then(([ndviMap, saviMap]) => {
          // Once both requests are complete, resolve the main promise.
          resolve({
            dateRange: { start: startDate.getInfo(), end: endDate.getInfo() },
            ndvi: { mapId: ndviMap.mapid, token: ndviMap.token, visParams: commonVisParams },
            savi: { mapId: saviMap.mapid, token: saviMap.token, visParams: commonVisParams },
          });
        })
        .catch(reject); // If either getMap call fails, reject the main promise.

    } catch (error) {
      // Catch any synchronous errors during the setup phase.
      console.error('An error occurred during GEE processing setup:', error);
      reject(error);
    }
  });
};