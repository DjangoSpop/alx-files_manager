const express = require('express');

const router = express.Router();
const redisClient = require('../utils/redis');

const File = mongoose.model('File');
router.get('/:id', async (req, res) => {
  const fileId = req.params.id;

  // Check if the file data is cached in Redis
  redisClient.get(`file:${fileId}`, async (err, cachedData) => {
    if (err) {
      console.error('Redis error:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (cachedData) {
      // Serve the cached data
      return res.json(JSON.parse(cachedData));
    }

    try {
      // Fetch the file data from MongoDB
      const file = await File.findById(fileId);

      if (!file) {
        return res.status(404).send('File not found');
      }

      // Cache the file data in Redis
      redisClient.setex(`file:${fileId}`, 3600, JSON.stringify(file));

      res.json(file);
    } catch (err) {
      console.error('MongoDB error:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

module.exports = router;
