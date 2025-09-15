import { GridData } from '../models/grid.model.js';
import { processGeeTile } from '../services/gee.js';
import { getFreshnessThreshold } from '../utils/cache.util.js';

export const processGridTile = async (req, res) => {
  const { tileId, geometry } = req.body;
  const userId = req.user._id;

  if (!tileId || !geometry) {
    return res.status(400).json({ error: 'tileId and geometry are required.' });
  }

  try {
    // 1. Check for a fresh cache entry
    const freshnessThreshold = getFreshnessThreshold(2.5)
    const cachedData = await GridData.findOne({
      user: userId,
      tileId: tileId,
      createdAt: { $gte: freshnessThreshold },
    });

    if (cachedData) {
      console.log(`Cache HIT for tile: ${tileId}`);
      return res.status(200).json({
        source: 'cache',
        ndvi: cachedData.ndvi,
        savi: cachedData.savi,
      });
    }

    console.log(`Cache MISS for tile: ${tileId}. Processing with GEE.`);
    
    // 2. If no fresh cache, process with GEE
    const geeResults = await processGeeTile(geometry);

    // 3. Update the cache (upsert) and send response
    const newGridData = {
      user: userId,
      tileId: tileId,
      dateRange: geeResults.dateRange,
      ndvi: geeResults.ndvi,
      savi: geeResults.savi,
    };

    await GridData.findOneAndUpdate(
      { user: userId, tileId: tileId },
      newGridData,
      { upsert: true, new: true } // Upsert: create if not found, new: return new doc
    );

    res.status(200).json({
        source: 'gee',
        ndvi: geeResults.ndvi,
        savi: geeResults.savi,
      });

  } catch (error) {
    console.error(`Error processing grid tile ${tileId}:`, error);
    res.status(500).json({ error: 'An error occurred during GEE processing.' });
  }
};
