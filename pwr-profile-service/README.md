[![Build Status](https://travis-ci.org/HBTGmbH/pwr-profile-service.svg?branch=travis)](https://travis-ci.org/HBTGmbH/pwr-profile-service)

# Profile Service #
## About ##
Build for HBT's profile management suite, the profile service gathers and consolidates marketable master data
for all employees. It provides access to the core object profile and administrative functions to keep data clean.

## Technology
This service is a spring boot based (micro) service that uses relational database (preconfigured MySQL) as persistence layer.
API documentation is provided by swagger.

## Getting Started

To get started, you have to bootstrap the database:
1. Clone this repository ``git clone https://github.com/HBTGmbH/pwr-profile-service.git``
2. Import the project into an IDE of your choosing and add it as maven project. An IntelliJ project configuration is provided within this repository. 
3. Copy the ``application.yml`` from ``configuration`` to ``/src/main/resources`` 
4. Edit the ``bootstrapDatabase`` profile and configure your own database
5. Bootstrap the database bei either
    1. Creating and running a spring boot run configuration and setting the ``spring.profiles.active`` system property to ``bootstrapDatabase``
    2. Running ```mvnw spring-boot:run -Dspring.profiles.active=bootstrapDatabase```
That's it. You are done. Once the container has started successfully, your database schema should have been bootstrapped. You are now ready
for local development. 

## Exploring the application

1. Create a new run configuration, call it ``Profile Service (Local)``
2. Go to the ``application.yml`` in ``/src/main/resources`` 
3. Go to the ``localDevNoEureka`` profile and configure it to use your database. 
4. Set the system property ``spring.profiles.active`` to ``localDevNoEureka``
5. Launch

Go to a browser of your choice and open the following url:
[http://localhost:9004/webjars/swagger-ui/3.20.9/index.html?url=http://localhost:9004/v2/api-docs#/](http://localhost:9004/webjars/swagger-ui/3.20.9/index.html?url=http://localhost:9004/v2/api-docs#/)

This is the services swagger documentation. You can try it out, create a new consultant, a profile, and add some data to it.

## Contributing

Before you start contributing:
* Make sure you imported the provided code style settings. 
* Make sure your development environment is set. You will need
    * Java 8 or higher
    * Maven 3
    * A relational database (MySQL is precondigured)
    * A rough understanding about spring boot.

If you are unfamiliar with spring boot, take a look at the [spring boot guides](https://spring.io/guides);

### Branch Workflow
This service is using a feature-branch workflow. 
1. When working on a feature or bugfix, create a new branch either from master or development
    * Bugfixes should be created from the development branch
    * Features should be created from the master branch
2. Develop your feature or bugfix. 
    * When committing, make sure to create a short, meaningful initial message. If you have more to document in the commit
    message itself, move it to a new line. (Todo: Example)
3. Once you are done, create a pull request from your branch to the development branch.


 
