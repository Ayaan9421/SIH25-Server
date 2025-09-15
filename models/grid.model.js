import mongoose from 'mongoose';

const gridDataSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tileId: {
      type: String,
      required: true,
      trim: true,
    },
    dateRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    ndvi: {
      mapId: { type: String, required: true },
      token: { type: String, required: true },
    },
    savi: {
      mapId: { type: String, required: true },
      token: { type: String, required: true },
    },
  },
  { timestamps: true }
);

// Compound index for efficient cache lookups
gridDataSchema.index({ user: 1, tileId: 1, createdAt: -1 });

// TTL index to automatically delete documents after 3 hours (10800 seconds)
// This keeps the collection clean of expired GEE links.
gridDataSchema.index({ createdAt: 1 }, { expireAfterSeconds: 10800 });


export const GridData = mongoose.model('GridData', gridDataSchema);
