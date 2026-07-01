const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

connectDB().then(() => {
  app.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    console.log(`Swagger docs available at http://localhost:${env.port}/api-docs`);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
