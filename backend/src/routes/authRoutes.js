const express = require('express');
const router = express.Router();
const { loginGrafana, pingGrafana, checkSession, logoutGrafana } = require('../controllers/grafanaController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Session management endpoints for Grafana authentication
 */

// Authorisation handlers
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in to Grafana and start a backend session
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login succeeded
 *       '401':
 *         description: Invalid credentials
 *       '500':
 *         description: Unexpected error communicating with Grafana
 */
router.post('/login', loginGrafana);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Terminate the current Grafana session
 *     tags: [Auth]
 *     responses:
 *       '200':
 *         description: Session removed successfully
 *       '500':
 *         description: Failed to destroy session
 */
router.post('/logout', logoutGrafana);

/**
 * @swagger
 * /auth/check-session:
 *   get:
 *     summary: Check if a Grafana session exists for the current user
 *     tags: [Auth]
 *     responses:
 *       '200':
 *         description: Session is active
 *       '401':
 *         description: Session is missing or expired
 */
router.get('/check-session', checkSession);

// Will be removed eventually
/**
 * @swagger
 * /auth/ping:
 *   get:
 *     summary: Ping the Grafana health endpoint
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       '200':
 *         description: Grafana responded successfully
 *       '500':
 *         description: Grafana is unreachable
 */
router.get('/ping', pingGrafana);

module.exports = router;
