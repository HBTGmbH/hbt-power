# Skill Service
Please refer to pwr-profile-service for more information on how to set up a development environment for this service

## Setup
As usual, this project comes with an IntelliJ project setup and 3 preconfigured
IntelliJ run configuration. If you want to alter these run configurations, please clone and then
edit the clones configurations.
* localDev for local development with service discovery
* localDevNoEureka for local development without service discovery
* bootstrapDatabase to create the DB schema

For more information, see pwr-profile-service

## Swagger-UI
http://localhost:9003/webjars/swagger-ui/3.20.9/index.html?url=http://localhost:9003/v2/api-docs

## Lucene
The skill service uses hibernate search to provide fast typeaheads for skills. You will need to build an index
to use this feature. 
hibernate:
  search:
    default:
      directory_provider: local
      indexBase: /usr/share/power2/skill/index
You will need to perform the following setup steps:
1. Set the property ```hibernate.search.default.directory_provider=local```
2. Set the property ```hibernate.search.default.indexBase=<some directory>```
3. Launch the service
4. Call the ``/skill/lucene/index`` endpoint