import * as React from 'react';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import {StatisticsActionCreator} from '../../../../reducers/statistics/StatisticsActionCreator';
import {AdminActionCreator} from '../../../../reducers/admin/AdminActionCreator';
import {SkillServiceClient} from '../../../../clients/SkillServiceClient';
import {APISkillServiceSkill} from '../../../../model/skill/SkillServiceSkill';
import {PwrConfirmActions, PwrFormActions} from '../../../general/pwr-form-actions';
import {PwrButton} from '../../../general/pwr-button';
import {PwrSpacer} from '../../../general/pwr-spacer_module';
import {MergeSkillDialog} from '../skill/merge-skill-dialog_module';
import {useConsultantShortNames} from '../name-entity/name-entity-dialogs';

/**
 * Who uses the skill, from the copy of the statistics, which knows it under its name in the skill tree (#208);
 * undefined while loading or without statistics
 */
function useSkillUsers(skillName: string, load: boolean) {
    const dispatch = useDispatch();
    const usage = useSelector((state: ApplicationState) => state.statisticsReducer.skillUsageInfo.get(skillName));
    useEffect(() => {
        if (load && skillName) {
            dispatch(StatisticsActionCreator.AsyncRequestSkillUsageInfo(skillName) as any);
        }
    }, [load, skillName, dispatch]);
    return usage;
}

const useStyles = makeStyles(theme => ({
    destructive: {
        color: theme.palette.error.main,
    },
}));

interface SkillRenameDialogProps {
    open: boolean;
    skillId: number;
    skillName: string;

    onClose(): void;
}

/**
 * Renames a skill of the skill tree, in the tree and in all profiles (#228). If the new name is another skill or its
 * alias, the dialog asks whether to merge into that skill instead (#205).
 */
export const SkillRenameDialog = (props: SkillRenameDialogProps) => {
    const dispatch = useDispatch();
    const users = useSkillUsers(props.skillName, props.open);
    const [name, setName] = useState(props.skillName);
    const [conflict, setConflict] = useState<APISkillServiceSkill | null>(null);

    useEffect(() => {
        setName(props.skillName);
        setConflict(null);
    }, [props.open, props.skillName]);

    const trimmed = name.trim();
    const renameDisabled = trimmed.length === 0 || trimmed === props.skillName;

    const rename = () => {
        SkillServiceClient.instance().getSkillByName(trimmed)
            .then(skill => {
                if (skill && skill.id && skill.id !== props.skillId) {
                    setConflict(skill);
                    return;
                }
                props.onClose();
                dispatch(AdminActionCreator.AsyncRenameSkill(props.skillName, trimmed) as any);
            })
            .catch(console.error);
    };

    const merge = () => {
        props.onClose();
        dispatch(AdminActionCreator.AsyncMergeSkill(props.skillName, conflict.qualifier, undefined, conflict.qualifier) as any);
    };

    const isAlias = conflict && conflict.qualifier.toLowerCase() !== trimmed.toLowerCase();
    return <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
        <DialogTitle>{PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Rename.Title', props.skillName)}</DialogTitle>
        <DialogContent>
            {conflict
                ? <>
                    <Typography variant="body1">
                        {isAlias
                            ? PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Rename.ExistsAsAlias', trimmed, conflict.qualifier)
                            : PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Rename.Exists', conflict.qualifier)}
                    </Typography>
                    <PwrSpacer size="tight"/>
                    <Typography variant="body1">
                        {PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Rename.MergeQuestion', props.skillName, conflict.qualifier)}
                    </Typography>
                    <PwrSpacer size="tight"/>
                    <Typography variant="body2" color="textSecondary">
                        {PowerLocalize.get('AdminClient.Infos.UsedSkills.Merge.Irreversible')}
                    </Typography>
                </>
                : <>
                    <TextField label={PowerLocalize.get('AdminClient.Info.SkillTree.Rename.NewName')} value={name}
                               autoFocus fullWidth onChange={event => setName(event.target.value)}
                               onKeyDown={event => {
                                   if (event.key === 'Enter' && !renameDisabled) {
                                       rename();
                                   }
                               }}/>
                    <PwrSpacer size="tight"/>
                    <Typography variant="body2" color="textSecondary">
                        {PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Rename.Usage', users ? users.size : '…')}
                    </Typography>
                </>}
        </DialogContent>
        <DialogActions>
            {conflict
                ? <PwrConfirmActions confirmText={PowerLocalize.get('Action.Merge')} onConfirm={merge}
                                     rejectText={PowerLocalize.get('Action.Cancel')} onReject={props.onClose}/>
                : <PwrFormActions editing noSpace saveText={PowerLocalize.get('AdminClient.Info.SkillTree.Rename.Action')}
                                  saveIcon="edit" saveDisabled={renameDisabled} onSave={rename} onCancel={props.onClose}/>}
        </DialogActions>
    </Dialog>;
};

interface SkillDeleteDialogProps {
    open: boolean;
    skillName: string;

    onClose(): void;
}

/**
 * Deleting a skill from the tree (#229): unused, it is deleted after its name was entered twice, as before. Used, the
 * admin chooses: merge it into another skill (#205) or remove it from all profiles, which needs the name twice too.
 */
export const SkillDeleteDialog = (props: SkillDeleteDialogProps) => {
    const dispatch = useDispatch();
    const classes = useStyles();
    const users = useSkillUsers(props.skillName, props.open);
    const [merging, setMerging] = useState(false);
    const statisticsAvailable = useSelector((state: ApplicationState) => state.statisticsReducer.available);
    const shortNames = useConsultantShortNames();

    useEffect(() => setMerging(false), [props.open, props.skillName]);

    const unused = users !== undefined && users.size === 0;
    useEffect(() => {
        if (props.open && unused) {
            props.onClose();
            dispatch(AdminActionCreator.AsyncDeleteSkillEverywhere(props.skillName, 0) as any);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.open, unused]);

    const remove = () => {
        props.onClose();
        dispatch(AdminActionCreator.AsyncDeleteSkillEverywhere(props.skillName, users ? users.size : 1) as any);
    };

    if (merging) {
        return <MergeSkillDialog open={props.open} skillToMerge={props.skillName} skillInfo={users}
                                 onClose={props.onClose}/>;
    }
    // Without statistics nobody is known to use it: the admin still chooses
    const known = users !== undefined || !statisticsAvailable;
    return <Dialog open={props.open && known && !unused} onClose={props.onClose} fullWidth maxWidth="sm">
        <DialogTitle>{PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Delete.Title', props.skillName)}</DialogTitle>
        <DialogContent>
            <Typography variant="body1">
                {PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Delete.Used', props.skillName,
                    users ? users.size : '?', users ? shortNames(users.map(user => user.initials()).toArray()) : '')}
            </Typography>
        </DialogContent>
        <DialogActions>
            <PwrButton variant="contained" color="primary" text={PowerLocalize.get('Action.Merge')}
                       onClick={() => setMerging(true)} disabled={!users}/>
            <PwrButton color="primary" className={classes.destructive}
                       text={PowerLocalize.get('AdminClient.Info.SkillTree.Delete.Remove')} onClick={remove}/>
            <PwrButton color="primary" text={PowerLocalize.get('Action.Cancel')} onClick={props.onClose}/>
        </DialogActions>
    </Dialog>;
};
