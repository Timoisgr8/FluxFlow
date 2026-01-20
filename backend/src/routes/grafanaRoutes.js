const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * @swagger
 * tags:
 *   - name: Grafana
 *     description: Routes that proxy Grafana HTTP APIs
 *   - name: Influx
 *     description: Lazy-loaded InfluxDB metadata via Grafana datasource
 */

const {
  getUserDataGrafana,
  getUserFoldersGrafana,
  getUserDashboardsGrafana,
  getDashboardJsonGrafana,

  getInfluxBuckets,
  getBucketMetadata,

  proxyPanelUpdate,
  proxyDashboardUpdate,
  proxyDashboardCreate,
  proxyDashboardDelete,
  createDashboardGrafana,
  createPanelInDashboard,

} = require('../controllers/grafanaController');

// Authorisation handlers
/**
 * @swagger
 * /grafana/user-folders:
 *   get:
 *     summary: List Grafana folders accessible to the current user
 *     tags: [Grafana]
 *     responses:
 *       '200':
 *         description: Folder list returned by Grafana
 *       '401':
 *         description: Missing or invalid Grafana session
 *       '500':
 *         description: Failed to fetch folders from Grafana
 */
router.get('/user-folders', getUserFoldersGrafana);

/**
 * @swagger
 * /grafana/user-dashboards:
 *   get:
 *     summary: List dashboards within a Grafana folder
 *     tags: [Grafana]
 *     parameters:
 *       - in: query
 *         name: folderUid
 *         schema:
 *           type: string
 *         required: true
 *         description: Grafana folder UID to inspect
 *     responses:
 *       '200':
 *         description: Dashboards that belong to the folder
 *       '400':
 *         description: Missing folderUid query parameter
 *       '401':
 *         description: Missing or invalid Grafana session
 *       '404':
 *         description: Folder not found
 *       '500':
 *         description: Failed to fetch dashboards from Grafana
 */
router.get('/user-dashboards', getUserDashboardsGrafana);

/**
 * @swagger
 * /grafana/user-data:
 *   get:
 *     summary: Retrieve the current Grafana user profile
 *     tags: [Grafana]
 *     responses:
 *       '200':
 *         description: Grafana user details
 *       '401':
 *         description: Missing or invalid Grafana session
 *       '403':
 *         description: User does not have permission to access Grafana user info
 *       '500':
 *         description: Failed to fetch Grafana user data
 */
router.get('/user-data', getUserDataGrafana);

// New route for dashboard JSON by UID
/**
 * @swagger
 * /grafana/api/dashboards/uid/{uid}:
 *   get:
 *     summary: Retrieve a Grafana dashboard definition by UID
 *     tags: [Grafana]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: Grafana dashboard UID
 *     responses:
 *       '200':
 *         description: Dashboard JSON returned by Grafana
 *       '400':
 *         description: Missing dashboard UID
 *       '401':
 *         description: Missing or invalid Grafana session
 *       '404':
 *         description: Dashboard not found
 *       '500':
 *         description: Failed to retrieve dashboard JSON
 */
router.get('/api/dashboards/uid/:uid', getDashboardJsonGrafana);

// New lazy-load Influx metadata routes
/**
 * @swagger
 * /grafana/influxdb/buckets:
 *   get:
 *     summary: List available InfluxDB buckets through Grafana
 *     tags: [Influx]
 *     responses:
 *       '200':
 *         description: Array of bucket names
 *       '401':
 *         description: Missing or invalid Grafana session
 *       '500':
 *         description: Failed to fetch buckets
 */
router.get('/influxdb/buckets', getInfluxBuckets);

/**
 * @swagger
 * /grafana/influxdb/metadata:
 *   get:
 *     summary: Retrieve measurements, fields, and tags for an InfluxDB bucket
 *     tags: [Influx]
 *     parameters:
 *       - in: query
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: InfluxDB bucket name
 *     responses:
 *       '200':
 *         description: InfluxDB metadata grouped by measurement, fields, and tags
 *       '400':
 *         description: Missing bucket query parameter
 *       '401':
 *         description: Missing or invalid Grafana session
 *       '500':
 *         description: Failed to retrieve bucket metadata
 */
router.get('/influxdb/metadata', getBucketMetadata);

/**
 * @swagger
 * /grafana/dashboard/panel-update:
 *   post:
 *     summary: Update the Flux query of a Grafana panel
 *     tags: [Grafana]
 *     deprecated: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - folderUid
 *               - dashboardUid
 *               - panelId
 *               - newQuery
 *             properties:
 *               folderUid:
 *                 type: string
 *               dashboardUid:
 *                 type: string
 *               panelId:
 *                 type: integer
 *               newQuery:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Panel updated successfully
 *       '400':
 *         description: Request missing required parameters
 *       '401':
 *         description: Missing or invalid Grafana session
 *       '404':
 *         description: Panel not found
 *       '500':
 *         description: Failed to proxy panel update
 */
router.post('/dashboard/panel-update', proxyPanelUpdate); // deprecated

/**
 * @swagger
 * /grafana/dashboard/update:
 *   post:
 *     summary: Save updates to an existing Grafana dashboard
 *     tags: [Grafana]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dashboard
 *               - folderUid
 *             properties:
 *               dashboard:
 *                 type: object
 *                 description: Full Grafana dashboard payload
 *               folderUid:
 *                 type: string
 *                 description: Grafana folder UID containing the dashboard
 *     responses:
 *       '200':
 *         description: Dashboard updated successfully
 *       '400':
 *         description: Request missing required parameters
 *       '401':
 *         description: Missing or invalid Grafana session
 *       '500':
 *         description: Failed to proxy dashboard update
 */
router.post('/dashboard/update', proxyDashboardUpdate);

/**
 * @swagger
 * /grafana/dashboard/create:
 *   post:
 *     summary: Create a new Grafana dashboard
 *     tags: [Grafana]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dashboard:
 *                 type: object
 *                 description: Optional dashboard payload to override defaults
 *               overwrite:
 *                 type: boolean
 *               folderUid:
 *                 type: string
 *               folderId:
 *                 type: integer
 *               message:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Dashboard created successfully
 *       '400':
 *         description: Missing dashboard payload
 *       '401':
 *         description: Missing or invalid Grafana session
 *       '500':
 *         description: Failed to proxy dashboard creation
 */
router.post('/dashboard/create', proxyDashboardCreate);

/**
 * @swagger
 * /grafana/dashboard/delete/{uid}:
 *   delete:
 *     summary: Delete a Grafana dashboard
 *     tags: [Grafana]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: Grafana dashboard UID to delete
 *     responses:
 *       '200':
 *         description: Dashboard deleted successfully
 *       '400':
 *         description: Missing dashboard UID
 *       '401':
 *         description: Missing or invalid Grafana session
 *       '500':
 *         description: Failed to proxy dashboard deletion
 */
router.delete('/dashboard/delete/:uid', proxyDashboardDelete);
module.exports = router;
