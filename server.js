require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connect = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/discounts', require('./routes/discounts'));
app.use('/api/settings',  require('./routes/settings'));
app.use('/api/upload',    require('./routes/upload'));

// Health check
app.get('/', (req, res) => res.json({ status: 'ADHD API running' }));

const PORT = process.env.PORT || 3001;

connect()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => { console.error('DB connection failed:', err); process.exit(1); });
