const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  // Add any other fields you need for your file manager
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
