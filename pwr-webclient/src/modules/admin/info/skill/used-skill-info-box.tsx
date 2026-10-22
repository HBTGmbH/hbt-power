import * as React from 'react';
import {Typography} from '@material-ui/core';
import CallMerge from '@material-ui/icons/CallMerge';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {PwrButton} from '../../../general/pwr-button';
import {ConsultantInfo} from '../../../../model/ConsultantInfo';
import {PwrSpacer} from '../../../general/pwr-spacer_module';
import {ProfileElementInfo} from '../profile-element-layout';

interface UsedSkillInfoBoxProps {
    skillName?: string;
    /** "Skill => Category => … => Root", see SkillReducer; undefined without a category */
    skillHierarchy?: string;
    usedBy?: Array<ConsultantInfo>;

    onOpenEdit(skillName: string): void;
}

/**
 * The categories from the root down; an alias ends with the skill of the tree it belongs to
 */
function toPath(skillName: string, hierarchy: string): string {
    const [treeName, ...categories] = hierarchy.split(' => ');
    const path = categories.reverse();
    return (treeName === skillName ? path : [...path, treeName]).join(' › ');
}

export const UsedSkillInfoBox = (props: UsedSkillInfoBoxProps) => {
    const merge = props.skillName && <PwrButton color="primary" text={PowerLocalize.get('Action.Merge')}
                                                icon={<CallMerge/>}
                                                onClick={() => props.onOpenEdit(props.skillName)}/>;
    return <ProfileElementInfo name={props.skillName} action={merge} usedBy={props.usedBy}>
        <PwrSpacer size="tight"/>
        <Typography variant="body2" color="textSecondary">
            {props.skillHierarchy
                ? toPath(props.skillName, props.skillHierarchy)
                : PowerLocalize.get('AdminClient.Infos.UsedSkills.NoCategory')}
        </Typography>
    </ProfileElementInfo>;
};
