
import * as React from 'react';
import {AppBar, Snackbar} from 'material-ui';
import {ConsultantDashboard} from './consultant-dashboard_module';
import {connect} from 'react-redux';
import {PowerToolbar} from './power-toolbar_module';
import {ConsultantProfile} from './profile/profile_module';
class PowerClientModule extends React.Component<{}, {}> {

    render() {
        return (
        <div>
            <PowerToolbar/>
            <ConsultantProfile/>
        </div>
        );
    }
}


export const PowerClient: React.ComponentClass<{}> = connect()(PowerClientModule);