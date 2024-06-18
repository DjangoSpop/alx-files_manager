import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import router from './routes/index';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  }
};

connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use('/', router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
