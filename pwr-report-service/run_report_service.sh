#!/bin/bash
java -jar /usr/share/power2/report/pwr-profile-service-0.0.1-SNAPSHOT.jar --spring.config.location=/etc/power2/report/application.yml --spring.profiles.active=production
