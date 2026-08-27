const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salon_crm';

app.use(cors());
app.use(express.json());

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

app.use('/api', routes);

// Centralized error handling
app.use(errorHandler);

mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    const id = ret._id;
    delete ret._id;
    delete ret.__v;
    return { id, ...ret };
  }
});

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Salon CRM API Running');
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
