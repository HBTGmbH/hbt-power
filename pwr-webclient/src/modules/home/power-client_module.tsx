import * as React from 'react';
import {PowerToolbar} from './power-toolbar_module';
import {ProfileSnackbar} from './profile/profile-status-snackbar_module';


export class PowerClient extends React.Component<{}, {}> {

    render() {
        return <div>
            <PowerToolbar/>
            <div style={{marginTop: "30px"}}>
                {this.props.children}
            </div>

            <ProfileSnackbar/>
        </div>
    }

}
