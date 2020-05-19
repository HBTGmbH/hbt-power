FROM openjdk:8
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} pwr-edge-service.jar
CMD ["java", "-jar", "pwr-edge-service.jar"]
