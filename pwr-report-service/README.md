# About
Built for HBT's profile management application, pwr-report-service is a microservice wrapper around [Eclipse Birt](https://www.eclipse.org/birt/).
It transforms the pwr-view-profile-service datamodel into a datamodel the HBT templates understand and renders them as .docx.

# Technology
* Spring Boot 
* Spring Cloud Netflix
* Eclipse BIRT
* MySQL

# Getting Started
Please refer to [pwr-profile-service Readme](https://github.com/HBTGmbH/pwr-profile-service) for a setup guide. 

# Run With Docker
Requirements:
* Docker
* Docker-Compose

Steps:
1. Build the service ```mvn package```
2. Build the image ``docker image build -t pwr-report-service:master .``
3. Set the image location in the ``docker-compose.yaml`` to a location on your filesystem (absolute path)
4. Run the app: ``docker-compuse up``
