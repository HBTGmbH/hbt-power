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
## Framework-Agnostic Components
* Try to use components from /modules/general as much as possible. These aim to streamline the visuals of power.
### Buttons
* Try to use the PwrButton or PwrIconButton component. As per material-design guide, use
    * Icon buttons in toolbars and action bars
    * Normal buttons in other contexts
* Buttons should always have an icon. Icon buttons require a tooltip while normal buttons should always
be as descriptive as possible. 
* Buttons with an icon should have their icon on the right. 
