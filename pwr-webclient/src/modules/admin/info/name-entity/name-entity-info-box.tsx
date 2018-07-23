import * as React from 'react';
import {Icon, List, ListItem, ListSubheader, withTheme} from '@material-ui/core';
import {NameEntity} from '../../../../model/NameEntity';
import {ConsultantInfo} from '../../../../model/ConsultantInfo';
import {ThemeProps} from '../../../../utils/ReactUtils';

interface NameEntityInfoBoxProps {
    nameEntity: NameEntity;
    usedBy: Array<ConsultantInfo>;
}

interface NameEntityInfoBoxState {

}

class NameEntityInfoBoxModule extends React.Component<NameEntityInfoBoxProps & ThemeProps, NameEntityInfoBoxState> {

    private renderUsedBy = () => {
        return <List style={{paddingTop:'5px'}}>
            {this.props.usedBy.map((value, key) => <ListItem style={{paddingLeft:'30px', paddingTop:'5px'}} key={key}>{value.initials()}</ListItem>)}
        </List>;
    };

    render() {
        // TODO lokalisieren
        return (<div >
            <div className="vertical-align" style={{ height: '56px',  backgroundColor: this.props.theme.palette.primary.main}}>
                <div style={{fontSize: 18, color: this.props.theme.palette.secondary.main}}>
                    <Icon style={{verticalAlign: 'middle'}}>
                        info_outline
                    </Icon>
                    <span style={{marginLeft: '5px'}}> Info </span>
                </div>
            </div>
            <ListSubheader>Bezeichnung</ListSubheader>
            <span style={{paddingLeft:'30px'}}>{this.props.nameEntity.name()}</span>
            <ListSubheader>Benutzt von</ListSubheader>
            {this.renderUsedBy()}
        </div>);
    }
}

export const NameEntityInfoBox = withTheme()(NameEntityInfoBoxModule);
