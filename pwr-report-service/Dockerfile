FROM docker.io/azul/zulu-openjdk-alpine:13-jre
# BIRT lays out text via AWT, which needs fontconfig and at least one font on Alpine
RUN apk add --no-cache fontconfig ttf-dejavu
COPY target/pwr-report-service-*.jar pwr-report-service.jar
ENV LC_ALL de_DE.UTF-8
ENV LANG de_DE.UTF-8
ENV LANGUAGE de_DE.UTF-8
CMD ["java", "-jar", "pwr-report-service.jar"]

