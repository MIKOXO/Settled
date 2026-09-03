import { catchAsync } from '../utils/catchAsync.js';
import * as placesService from '../services/placesService.js';

export const searchPlaces = catchAsync(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      data: null,
      error: { message: 'Query parameter q is required' },
    });
  }
  const results = await placesService.searchPlaces(q.trim());
  res.status(200).json({
    success: true,
    data: { results },
    error: null,
  });
});
