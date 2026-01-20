// middleware/auth.js
module.exports = function requireGrafanaAuth(req, res, next) {
  if (req.session && req.session.grafanaCookie) {
    next(); // User is logged in, allow request to proceed
  } else {
    res.status(401).json({ error: 'Unauthorized: Please log in with your Grafana account' });
  }
};