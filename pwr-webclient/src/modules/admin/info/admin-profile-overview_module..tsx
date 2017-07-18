import * as React from 'react';
import {Tab, Tabs} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {NameEntityOverview} from './name-entity-overview_module';
import {UsedSkillOverview} from './used-skill-overview_module';

interface AdminProfileOverviewProps {

}

interface AdminProfileOverviewState {

}

export class AdminProfileOverview extends React.Component<AdminProfileOverviewProps, AdminProfileOverviewState> {

    render() {
        return (<Tabs style={{marginTop: "8px"}}>
            <Tab label={PowerLocalize.get("AdminClient.Overview.NameEntity")}>
                <NameEntityOverview/>
            </Tab>
            <Tab label={PowerLocalize.get("AdminClient.Overview.Skills")}>
                <UsedSkillOverview/>
            </Tab>
        </Tabs>);
    }
}
