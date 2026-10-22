// Config for `npm run start:local`: the dev server serves this file as /config.js
// and proxies /api/<service> to the locally running services (see src/setupProxy.js).
const POWER_PROFILE_SERVICE_URL = "/api/pwr-profile-service";
const POWER_SKILL_SERVICE_URL = "/api/pwr-skill-service";
const POWER_VIEW_PROFILE_SERVICE_URL = "/api/pwr-view-profile-service";
const POWER_REPORT_SERVICE_URL = "/api/pwr-report-service";
const POWER_STATISTICS_SERVICE_URL = "/api/pwr-statistics-service";

const CLIENT_BUILD_INFO_LOCATION = "/build_info.json";

const POWER_APP_PATH = "";

const GLOBAL_OPTIONS = {
    greetings: ["Moin", "Hallo", "Ahoi", "Willkommen"]
};

// Unused locally: authentication is disabled in local dev mode
const POWER_AZURE_TENANT_ID = '';
const POWER_AZURE_CLIENT_ID = '';
