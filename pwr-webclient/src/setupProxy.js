// Picked up by react-scripts' dev server. Only active for `npm run start:local`.
const path = require('path');
const {createProxyMiddleware} = require('http-proxy-middleware');

// Same routing as ingress + pwr-edge-service: /api/<service>/** -> <service>/**
const SERVICES = {
    'pwr-profile-service': 9004,
    'pwr-skill-service': 9003,
    'pwr-report-service': 9005,
    'pwr-statistics-service': 9007,
    'pwr-view-profile-service': 9008,
};

module.exports = function (app) {
    if (process.env.REACT_APP_LOCAL_DEV !== 'true') {
        return;
    }
    app.get('/config.js', (req, res) => res.sendFile(path.resolve(__dirname, '../config.local.js')));
    Object.entries(SERVICES).forEach(([service, port]) => {
        app.use(`/api/${service}`, createProxyMiddleware({
            target: `http://localhost:${port}`,
            pathRewrite: {[`^/api/${service}`]: ''},
        }));
    });
};
