# Getting Started
* Download NodeJS 10
* Download NPM
* Clone this repository `git clone https://github.com/HBTGmbH/pwr-webclient`
* Copy the `sample_config.js` into `config.js`. It should be preconfigured for the HBT Power Dev System (only reachable with a VPN connection)
    * For experimenting purposes, you can switch to the HBT Power Production system by using `https://power.hbt.de` as base URL instead
    of `https://power02.corp.hbt.de`.
    * The config determines which APIs are called. It has to be set, otherwise you'll see a lot of errors.
* `npm install`
* `npm run start`
* Open your browser, navigate to `localhost:3000/power`. You should see the HBT Power profile selection screen

## Structure
* All .tsx files are located in the `modules` directory
    * `modules/admin` contains the admin space
    * `modules/home` is the profile editing space
    * `modules/general` contains shared components
    * `modules/metadata` contains metadata like build information
    * `modules/navigation` contains navigation related components
* pwr-webclient uses redux as state management. Everything redux-related is in the `reducers` folder
* The `model` folder contains a commonly shared data model
* `localization` contains the webclients localization feature
* `clients` are wrappers around axios that enable a streamlined communcation with the power-API, including centralized error handling
with notifications
* `utils`...contains utilities

# Working locally
* `config.js` is still in a reworking phase. For now, profile + skill service are already using the new configuration
* Start the service locally
* Set the URL in `config.js`.
    * For the pwr-profile-service, set `POWER_PROFILE_SERVICE_URL` to `http://localhost:9004` (Default profile service port)
    * For the pwr-skill-service, set `POWER_SKILL_SERVICE_URL` to `http://localhost:<port>`  (Default skill service port)
* Authorization & Authentication is done by the central HBT gateway. Therefor, when working locally, authorization is not necessary. 
* To get some testdata, simply go into the admin panel and create a new consultant. You can then begin to edit the profile.

# Guidelines
## Quick notes - dos and dont's
* Do use the `PowerLocalizer` to render output text
* Do use string values in enums, especially when they are used by redux. 
## http clients
### tl;dr usage
To use the http clients, simply use the ``instance()`` function:

```js
ProfileServiceClient.instance()
    .getBuildInfo()
    .then(buildInfo => {/* do stuff*/})
```
### Info
This webclient comes with a bunch of pre-built webclients that communicate with the backend APIs. Each of these clients takes
care of cross cutting concerns:
* If applicable, the `requestPending` value is set, indicting that a loading spinner is to be show
* On request end, the `requestPending` value is set to `false`, removing the spinner
* The client automatically extracts the payload, discarding meta-information of the response (which should not be needed.)
* If an error occurs, the client will use the webclients `Alerts` to display an error to the user. 
    * Errors are always re-thrown, so you can later catch them again to perform custom error logic.

## Framework-Agnostic Components
* Try to use components from /modules/general as much as possible. These aim to streamline the visuals of power.
### Buttons
* Try to use the PwrButton or PwrIconButton component. As per material-design guide, use
    * Icon buttons in toolbars and action bars
    * Normal buttons in other contexts
* Buttons should always have an icon. Icon buttons require a tooltip while normal buttons should always
be as descriptive as possible. 
* Buttons with an icon should have their icon on the right. 
