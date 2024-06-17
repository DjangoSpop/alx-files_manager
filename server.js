const express = require('express');

const app = express();

// connect to mongoDb

const connectDB = require('./utils/db');
const fileRoutes = require('./routes/files'); // Import the fileRoutes module

connectDB();
// Set up middleware

app.use(express.json());
app.use('/api/files', fileRoutes);
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
