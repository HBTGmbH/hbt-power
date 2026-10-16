FROM docker.io/azul/zulu-openjdk-alpine:13-jre
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} pwr-profile-service.jar
CMD ["java", \
     "-jar", \
      "pwr-profile-service.jar"]
