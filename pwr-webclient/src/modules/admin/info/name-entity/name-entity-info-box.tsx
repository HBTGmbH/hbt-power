import * as React from 'react';
import {List, ListItem, ListSubheader} from '@material-ui/core';
import {NameEntity} from '../../../../model/NameEntity';
import {ConsultantInfo} from '../../../../model/ConsultantInfo';
import {PwrIconHeader} from '../../../general/pwr-icon-header';

interface NameEntityInfoBoxProps {
    nameEntity: NameEntity;
    usedBy: Array<ConsultantInfo>;
}

interface NameEntityInfoBoxState {

}

class NameEntityInfoBoxModule extends React.Component<NameEntityInfoBoxProps, NameEntityInfoBoxState> {

    private renderUsedBy = () => {
        return <List style={{paddingTop:'5px'}}>
            {this.props.usedBy.map((value, key) => <ListItem style={{paddingLeft:'30px', paddingTop:'5px'}} key={key}>{value.initials()}</ListItem>)}
        </List>;
    };

    render() {
        return (<div >
            <PwrIconHeader title={"Info"} muiIconName={"info_outline"}/>
            <ListSubheader>Bezeichnung</ListSubheader>
            <span className="padding-left-32px">{this.props.nameEntity.name()}</span>
            <ListSubheader>Benutzt von</ListSubheader>
            {this.renderUsedBy()}
        </div>);
    }
}

export const NameEntityInfoBox = NameEntityInfoBoxModule;
