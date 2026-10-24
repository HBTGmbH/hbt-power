FROM docker.io/azul/zulu-openjdk-alpine:13-jre
COPY target/pwr-view-profile-service-*.jar pwr-view-profile-service.jar
# Heap limit and giving unused heap back to the OS after a minute without GC (#293). Measured need and headroom:
# docs/arc42/07-verteilungssicht.md. JAVA_TOOL_OPTIONS from the deployment replaces this as a whole.
ENV JAVA_TOOL_OPTIONS="-Xmx256m -XX:G1PeriodicGCInterval=60000"
CMD ["java", "-jar", "pwr-view-profile-service.jar"]

