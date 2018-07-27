import * as React from 'react';
import {Tab, Tabs, Theme, withTheme} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {NameEntityOverview} from './name-entity/name-entity-overview_module';
import {UsedSkillOverview} from './used-skill-overview_module';

interface AdminProfileOverviewProps {
    theme: Theme;
}

interface AdminProfileOverviewState {
    index: number;
}

//mui v0.2 Tabs -> style={{marginTop: "8px"}}
class AdminProfileOverviewModule extends React.Component<AdminProfileOverviewProps, AdminProfileOverviewState> {

    constructor(props: AdminProfileOverviewProps) {
        super(props);
        this.state = {
            index: 0
        };
    }

    private setIndex = (event: any, value: number) => {
        this.setState({
            index: value
        });
    };

    render() {
        return (
            <div>
                <div className="admin-app-bar-spacer"/>
                <div style={{paddingTop: '8px'}}>
                    <Tabs fullWidth
                          centered
                          value={this.state.index}
                          style={{backgroundColor: this.props.theme.palette.primary.main}}
                          indicatorColor={'secondary'}
                          textColor={'secondary'}
                          onChange={this.setIndex}>
                        <Tab label={PowerLocalize.get('AdminClient.Overview.NameEntity')} value={0}/>
                        <Tab label={PowerLocalize.get('AdminClient.Overview.Skills')} value={1}/>
                    </Tabs>
                    {this.state.index === 0 ? <NameEntityOverview/> : null}
                    {this.state.index === 1 ? <UsedSkillOverview/>: null}
                </div>
            </div>)
    }
}

export const AdminProfileOverview = withTheme()(AdminProfileOverviewModule);
