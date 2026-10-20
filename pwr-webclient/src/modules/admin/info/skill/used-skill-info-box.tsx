import * as React from 'react';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {List, ListItem, ListSubheader, Paper} from '@material-ui/core';
import CallMerge from '@material-ui/icons/CallMerge';
import {PwrButton} from '../../../general/pwr-button';
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
                <PwrButton
                    color={'primary'}
                    variant={'contained'}
                    text={PowerLocalize.get('Action.Merge')}
                    icon={<CallMerge/>}
                    onClick={() => this.props.onOpenEdit(this.props.skillName)}
                />
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
