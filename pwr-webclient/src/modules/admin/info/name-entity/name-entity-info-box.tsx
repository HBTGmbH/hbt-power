import * as React from 'react';
import {List, ListItem, ListSubheader} from '@material-ui/core';
import {PwrIconHeader} from '../../../general/pwr-icon-header';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';

interface NameEntityInfoBoxProps {
    name: string;
    usedBy: Array<string>;
}

interface NameEntityInfoBoxState {

}

class NameEntityInfoBoxModule extends React.Component<NameEntityInfoBoxProps, NameEntityInfoBoxState> {

    private renderUsedBy = () => {
        return <List style={{paddingTop: '5px'}}>
            {this.props.usedBy.map((value, key) => <ListItem style={{paddingLeft: '30px', paddingTop: '5px'}}
                                                             key={key}>{value}</ListItem>)}
        </List>;
    };

    render() {
        return (<div>
            <PwrIconHeader title={'Info'} muiIconName={'info_outline'}/>
            <ListSubheader>{PowerLocalize.get('AdminClient.Overview.NameEntity.Info.Name')}</ListSubheader>
            <span className="padding-left-32px">{this.props.name}</span>
            <ListSubheader>{PowerLocalize.get('AdminClient.Overview.NameEntity.Info.UsedBy')}</ListSubheader>
            {this.renderUsedBy()}
        </div>);
    }
}

export const NameEntityInfoBox = NameEntityInfoBoxModule;
