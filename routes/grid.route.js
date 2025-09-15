import { processGridTile } from "../controllers/grid.controller.js";
import express from 'express'

const router = express.Router()

router.post('/process', processGridTile)

export default router;