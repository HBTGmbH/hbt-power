FROM openjdk:8
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} pwr-edge-service.jar
CMD ["java", \
    "-Deureka.client-service-url.defaultZone=http://localhost:8761/eureka", \
     "-Dlogging.file=/logs/pwr-edge.log", \
     "-jar", \
      "pwr-edge-service.jar" \
     ]
