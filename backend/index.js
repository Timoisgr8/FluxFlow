const app = require('./src/app.js');
const docsApp = require('./src/docs/server');

const PORT = process.env.PORT || 3000;
const SWAGGER_PORT = process.env.SWAGGER_PORT || 3002;

const backendServer = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});

backendServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Port ${PORT} already in use. Backend API routes will not be served by this process.`);
  } else {
    throw err;
  }
});

const docsServer = docsApp.listen(SWAGGER_PORT, '0.0.0.0', () => {
  console.log(`Swagger docs available at http://localhost:${SWAGGER_PORT}/api-docs`);
});

docsServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Unable to serve Swagger docs because port ${SWAGGER_PORT} is already in use.`);
  } else {
    throw err;
  }
});
