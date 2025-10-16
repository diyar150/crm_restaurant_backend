const express = require('express');
const cors = require('cors');
const path = require('path'); // Import path module
const app = express();
const routes = require('./src/routes/routes'); 
//const logger = require('./src/utils/logger');

// ✅ Enable CORS before routes
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true // optional: only if using cookies or auth headers
}));

app.use(express.json());

// ✅ Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// ✅ Now define your routes
app.use('/api', routes);

// Logger setup
//logger.info('Logger is set up and ready for use');

// Define port (you can also get this from an environment variable or config)
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});