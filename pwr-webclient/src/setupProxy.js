// Picked up by react-scripts' dev server. Only active for `npm run start:local`.
const path = require('path');
const {createProxyMiddleware} = require('http-proxy-middleware');
const {buildInfo} = require('../compileBuildInfo');

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
    // The image gets build_info.json from the CI build; locally it describes the working copy at the start of the dev
    // server, like the commit in the bundle (withCommit.js), so a local commit doesn't announce a new version (#247)
    const info = buildInfo();
    app.get('/build_info.json', (req, res) => res.json(info));
    // The edge itself only publishes its app info, under its own prefix (management.endpoints.web.base-path)
    app.use('/api/pwr-edge-service', createProxyMiddleware({
        target: 'http://localhost:9000',
        pathRewrite: {'^/api': ''},
    }));
    // REACT_APP_LOCAL_USER=<initials>: a user without admin role (#350); the headers the edge sets from the token, so
    // the services check like in production. Without, no headers: a call not through the edge, which may do everything.
    const localUser = (process.env.REACT_APP_LOCAL_USER || '').trim();
    const userHeaders = localUser
        ? {'X-Pwr-User-Login': localUser + '@localhost', 'X-Pwr-User-Initials': localUser, 'X-Pwr-User-Admin': 'false'}
        : {};
    Object.entries(SERVICES).forEach(([service, port]) => {
        app.use(`/api/${service}`, createProxyMiddleware({
            target: `http://localhost:${port}`,
            pathRewrite: {[`^/api/${service}`]: ''},
            headers: userHeaders,
        }));
    });
};
