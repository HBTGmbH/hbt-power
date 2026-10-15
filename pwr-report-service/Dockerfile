FROM openjdk:13-alpine
COPY target/pwr-report-service-*.jar pwr-report-service.jar
ENV LC_ALL de_DE.UTF-8
ENV LANG de_DE.UTF-8
ENV LANGUAGE de_DE.UTF-8
CMD ["java", "-jar", "pwr-report-service.jar"]

