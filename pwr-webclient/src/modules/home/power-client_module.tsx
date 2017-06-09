import * as React from 'react';
import {PowerToolbar} from './power-toolbar_module';
import {ProfileSnackbar} from './profile/profile-status-snackbar_module';


export class PowerClient extends React.Component<{}, {}> {


    private iDontCareAboutDesign = () => {
        alert("Das Interessiert den Entwickler leider nicht.");
        alert("Dafür sollte man einen Designer einkaufen.");
    };

    render() {
        return <div>
            <PowerToolbar/>
            <div className="row" style={{marginTop: "30px"}}>
                <div className="col-md-9 col-md-offset-2">
                    {this.props.children}
                </div>
            </div>

            <ProfileSnackbar/>
        </div>
    }

}
