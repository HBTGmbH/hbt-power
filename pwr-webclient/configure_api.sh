#!/bin/sh
sed "s|#POWER_PROFILE_SERVICE_URL|$POWER_PROFILE_SERVICE_URL|g" /usr/share/nginx/html/config.js -i
sed "s|#POWER_SKILL_SERVICE_URL|$POWER_SKILL_SERVICE_URL|g" /usr/share/nginx/html/config.js -i
sed "s|#POWER_VIEW_PROFILE_SERVICE_URL|$POWER_VIEW_PROFILE_SERVICE_URL|g" /usr/share/nginx/html/config.js -i
sed "s|#POWER_REPORT_SERVICE_URL|$POWER_REPORT_SERVICE_URL|g" /usr/share/nginx/html/config.js -i
sed "s|#POWER_STATISTICS_SERVICE_URL|$POWER_STATISTICS_SERVICE_URL|g" /usr/share/nginx/html/config.js -i
sed "s|#POWER_LOCALE_PATH|$POWER_LOCALE_PATH|g" /usr/share/nginx/html/config.js -i
sed "s|#POWER_IMAGE_PATH|$POWER_IMAGE_PATH|g" /usr/share/nginx/html/config.js -i
nginx -g "daemon off;"