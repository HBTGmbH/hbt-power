FROM docker.io/azul/zulu-openjdk-alpine:13-jre
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} pwr-profile-service.jar
# Heap limit and giving unused heap back to the OS after a minute without GC (#293). Measured need and headroom:
# docs/arc42/07-verteilungssicht.md. JAVA_TOOL_OPTIONS from the deployment replaces this as a whole.
ENV JAVA_TOOL_OPTIONS="-Xmx384m -XX:G1PeriodicGCInterval=60000"
CMD ["java", \
     "-jar", \
      "pwr-profile-service.jar"]
