FROM openjdk:13-alpine
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} pwr-profile-service.jar
CMD ["java", \
     "-jar", \
      "pwr-profile-service.jar"]
