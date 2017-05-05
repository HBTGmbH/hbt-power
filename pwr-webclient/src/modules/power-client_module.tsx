import * as React from 'react';
import {connect} from 'react-redux';
import {PowerToolbar} from './power-toolbar_module';
import {ConsultantProfile} from './profile/profile_module';
import {ProfileSnackbar} from './profile/profile-status-snackbar_module';
class PowerClientModule extends React.Component<{}, {}> {

    render() {
        return (
        <div>
            <PowerToolbar/>
            <ConsultantProfile/>
            <ProfileSnackbar/>
        </div>
        );
    }
}


export const PowerClient: React.ComponentClass<{}> = connect()(PowerClientModule);