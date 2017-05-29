import * as React from 'react';
import {PowerToolbar} from './power-toolbar_module';
import {ProfileSnackbar} from '../profile/profile-status-snackbar_module';
import {List, ListItem, Menu, Paper} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Link} from 'react-router';


export class PowerClient extends React.Component<{}, {}> {


    private iDontCareAboutDesign = () => {
        alert("Das ist mir sowas von egal.");
        alert("Kauf einen Designer ein.");
    };

    render() {
        return <div>
            <PowerToolbar/>
            <div className="row"  >
                <div className="col-md-2">
                    <Paper zDepth={0} style={{width: "100%"}}>
                        <List>
                            <Link to="/app/home"><ListItem primaryText={PowerLocalize.get('Menu.Home')} /></Link>
                            <Link to="/app/profile"><ListItem primaryText={PowerLocalize.get('Menu.BaseData')} /></Link>
                            <Link to="/app/view"><ListItem primaryText={PowerLocalize.get("Menu.Views")} /></Link>
                            <Link to="/app/reports"><ListItem primaryText={PowerLocalize.get("Menu.Reports")} /></Link>
                            <ListItem onClick={this.iDontCareAboutDesign} primaryText="Das Design ist doof!" />
                        </List>
                    </Paper>
                </div>
                <div className="col-md-9">
                    {this.props.children}
                </div>
            </div>

            <ProfileSnackbar/>
        </div>
    }

}
