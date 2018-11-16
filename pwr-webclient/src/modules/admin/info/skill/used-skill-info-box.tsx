import * as React from 'react';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {Button, Icon, List, ListItem, ListSubheader, Paper} from '@material-ui/core';
import {ConsultantInfo} from '../../../../model/ConsultantInfo';
import {PwrIconHeader} from '../../../general/pwr-icon-header';

interface UsedSkillInfoBoxProps {
    skillName?: string;
    skillHierarchy?: string;
    usedBy?: Array<ConsultantInfo>;

    onOpenEdit(skillName: string): void;
}

interface UsedSkillInfoBoxState {

}

export class UsedSkillInfoBox extends React.Component<UsedSkillInfoBoxProps, UsedSkillInfoBoxState> {

    private renderHierarchy = () => {
        if (this.props.skillHierarchy) {
            return this.props.skillHierarchy;
        } else {
            return 'Keine Kategorisierung vorhanden';
        }
    };

    private renderUsedBy = () => {
        if (!this.props.usedBy) {
            return <></>;
        } else {
            return this.props.usedBy.map(consultant => <ListItem
                key={consultant.initials()}>{consultant.getFullName()}</ListItem>);
        }
    };

    render() {
        if (!this.props.skillName) {
            return <></>;
        }
        return (<Paper id="admin-info-panel">
            <PwrIconHeader muiIconName={'info_outline'} title={'Info'}/>
            <ListSubheader>{PowerLocalize.get('AdminClient.Infos.UsedSkills.SkillQualifier')}</ListSubheader>
            <span className="padding-left-32px">{this.props.skillName}</span>
            <ListSubheader>{PowerLocalize.get('AdminClient.Infos.UsedSkills.SkillHiearchy')}</ListSubheader>
            <div className="padding-left-32px">
                {
                    this.renderHierarchy()
                }
            </div>
            <div className="padding-left-32px">
                <Button
                    color={'primary'}
                    variant={'raised'}
                    onClick={() => this.props.onOpenEdit(this.props.skillName)}
                    className="mui-margin"
                >
                    {PowerLocalize.get('Action.Edit')}
                    <Icon className="material-icons">edit</Icon>
                </Button>
            </div>
            <ListSubheader>{PowerLocalize.get('AdminClient.Infos.UsedSkills.UsedBy')}</ListSubheader>
            <List>
                {
                    this.renderUsedBy()
                }
            </List>
        </Paper>);
    }
}
