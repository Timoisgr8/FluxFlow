const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const docsApp = express();

docsApp.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      supportedSubmitMethods: [],
      docExpansion: 'none',
    },
    customCss: `
      .swagger-ui .topbar .auth-wrapper { display: none !important; }
      .swagger-ui .try-out { display: none !important; }
    `,
  })
);
docsApp.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

module.exports = docsApp;
