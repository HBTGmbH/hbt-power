import * as React from 'react';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {NameEntity} from '../../../../reducers/profile-new/profile/model/NameEntity';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ProfileServiceClient} from '../../../../clients/ProfileServiceClient';
import {AdminActionCreator} from '../../../../reducers/admin/AdminActionCreator';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import {PwrConfirmActions, PwrFormActions} from '../../../general/pwr-form-actions';
import {PwrListTable} from '../../../general/pwr-list-table';
import {PwrSpacer} from '../../../general/pwr-spacer_module';
import {PwrButton} from '../../../general/pwr-button';

/** Names compare ignoring case and spaces at the ends, like in the database (#207, #215) */
const sameName = (a: string, b: string) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * The short names of the consultants with these initials (#216), the initials of those the app doesn't know
 */
export function useConsultantShortNames(): (initials: Array<string>) => string {
    const names = useSelector((state: ApplicationState) => state.consultantNames.names);
    return initials => initials.map(value => names[value] ? names[value].shortName : value).join(', ');
}

interface NameEntityChangeDialogProps {
    open: boolean;
    /** Renaming asks to merge if the new name is that of another element of the type (#227) */
    mode: 'rename' | 'merge';
    nameEntity: NameEntity;
    /** All elements of its type */
    entities: Array<NameEntity>;
    typeLabel: string;

    onClose(): void;

    /** The element that is left, to select it */
    onDone(result: NameEntity): void;
}

interface MergeQuestion {
    target: NameEntity;
    sourceUsers: Array<string>;
    targetUsers: Array<string>;
}

/**
 * Renames a profile element or merges it into another one of its type, in all profiles (#227). Before a merge the
 * dialog names both elements with the number of profiles using them.
 */
export const NameEntityChangeDialog = (props: NameEntityChangeDialogProps) => {
    const dispatch = useDispatch();
    const shortNames = useConsultantShortNames();
    const [name, setName] = useState(props.nameEntity.name);
    const [target, setTarget] = useState<NameEntity | null>(null);
    const [question, setQuestion] = useState<MergeQuestion | null>(null);

    useEffect(() => {
        setName(props.nameEntity.name);
        setTarget(null);
        setQuestion(null);
    }, [props.open, props.nameEntity]);

    const others = props.entities.filter(entity => entity.id !== props.nameEntity.id);
    const trimmed = name.trim();
    const renameDisabled = trimmed.length === 0 || trimmed === props.nameEntity.name;

    const askToMerge = (mergeTarget: NameEntity) => {
        const client = ProfileServiceClient.instance();
        Promise.all([client.getNameEntityUsers(props.nameEntity.id), client.getNameEntityUsers(mergeTarget.id)])
            .then(([sourceUsers, targetUsers]) => setQuestion({target: mergeTarget, sourceUsers, targetUsers}))
            .catch(console.error);
    };

    const rename = () => {
        // Another element of the type has the name: that is a merge, which the admin decides
        const conflict = others.find(other => sameName(other.name, trimmed));
        if (conflict) {
            askToMerge(conflict);
            return;
        }
        props.onClose();
        dispatch(AdminActionCreator.AsyncRenameNameEntity(props.nameEntity, trimmed, props.onDone) as any);
    };

    const merge = () => {
        const mergeTarget = question.target;
        props.onClose();
        dispatch(AdminActionCreator.AsyncMergeNameEntity(props.nameEntity, mergeTarget, props.onDone) as any);
    };

    const title = PowerLocalize.getFormatted(props.mode === 'rename' ? 'AdminClient.NameEntity.Rename.Title'
        : 'AdminClient.NameEntity.Merge.Title', props.nameEntity.name);

    const renderQuestion = () => <>
        <Typography variant="body1">
            {PowerLocalize.getFormatted(props.mode === 'rename' ? 'AdminClient.NameEntity.Merge.Exists'
                : 'AdminClient.NameEntity.Merge.Question', question.target.name, props.typeLabel)}
        </Typography>
        <PwrSpacer/>
        <PwrListTable label={title}
                      items={[{entity: props.nameEntity, users: question.sourceUsers}, {entity: question.target, users: question.targetUsers}]}
                      itemKey={row => String(row.entity.id)}
                      columns={[
                          {header: PowerLocalize.get('AdminClient.Overview.Name'), render: row => row.entity.name},
                          {
                              header: PowerLocalize.get('AdminClient.Overview.Info.UsedBy'),
                              render: row => row.users.length > 0
                                  ? PowerLocalize.getFormatted('AdminClient.NameEntity.Profiles', row.users.length, shortNames(row.users))
                                  : PowerLocalize.get('AdminClient.Overview.Info.UsedByNobody')
                          }
                      ]}/>
        <PwrSpacer/>
        <Typography variant="body2">
            {PowerLocalize.getFormatted('AdminClient.NameEntity.Merge.Summary', props.nameEntity.name, question.target.name)}
        </Typography>
        <PwrSpacer size="tight"/>
        <Typography variant="body2" color="textSecondary">
            {PowerLocalize.get('AdminClient.NameEntity.Merge.Irreversible')}
        </Typography>
    </>;

    const renderInput = () => props.mode === 'rename'
        ? <TextField label={PowerLocalize.get('AdminClient.NameEntity.Rename.NewName')} value={name} autoFocus fullWidth
                     onChange={event => setName(event.target.value)}
                     onKeyDown={event => {
                         if (event.key === 'Enter' && !renameDisabled) {
                             rename();
                         }
                     }}
                     helperText={PowerLocalize.get('AdminClient.NameEntity.Rename.Help')}/>
        : <Autocomplete<NameEntity, false, false, false>
            options={others}
            value={target}
            openOnFocus
            noOptionsText={PowerLocalize.get('AdminClient.NameEntity.Merge.NoTarget')}
            openText={PowerLocalize.get('AdminClient.NameEntity.Merge.OpenList')}
            closeText={PowerLocalize.get('AdminClient.NameEntity.Merge.CloseList')}
            getOptionLabel={entity => entity.name}
            getOptionSelected={(option, value) => option.id === value.id}
            onChange={(event, value) => setTarget(value)}
            renderInput={params => <TextField {...params} autoFocus
                                              label={PowerLocalize.get('AdminClient.NameEntity.Merge.Target')}/>}/>;

    return <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{question ? renderQuestion() : renderInput()}</DialogContent>
        <DialogActions>
            {question
                ? <PwrConfirmActions confirmText={PowerLocalize.get('Action.Merge')} onConfirm={merge}
                                     rejectText={PowerLocalize.get('Action.Cancel')} onReject={props.onClose}/>
                : props.mode === 'rename'
                    ? <PwrFormActions editing noSpace saveText={PowerLocalize.get('AdminClient.NameEntity.Rename.Action')}
                                      saveIcon="edit" saveDisabled={renameDisabled} onSave={rename} onCancel={props.onClose}/>
                    : <PwrFormActions editing noSpace saveText={PowerLocalize.get('Action.Next')} saveIcon="arrow_forward"
                                      saveDisabled={!target} onSave={() => askToMerge(target)} onCancel={props.onClose}/>}
        </DialogActions>
    </Dialog>;
};

interface UnusedNameEntitiesDialogProps {
    open: boolean;
    type: string;
    typeLabel: string;

    onClose(): void;
}

/**
 * Deletes the elements of a type that no profile uses (#227). The list comes from the database; deleting checks
 * again, so an element a consultant took in the meantime stays.
 */
export const UnusedNameEntitiesDialog = (props: UnusedNameEntitiesDialogProps) => {
    const dispatch = useDispatch();
    const [unused, setUnused] = useState<Array<NameEntity> | undefined>(undefined);

    useEffect(() => {
        if (props.open) {
            ProfileServiceClient.instance().getUnusedNameEntities(props.type)
                .then(setUnused)
                .catch(error => {
                    console.error(error);
                    props.onClose();
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.open, props.type]);

    const deleteUnused = () => {
        props.onClose();
        dispatch(AdminActionCreator.AsyncDeleteUnusedNameEntities(props.type) as any);
    };

    // Forgotten only once the dialog has faded out, so it shows the list until then
    return <Dialog open={props.open && unused !== undefined} onClose={props.onClose} fullWidth maxWidth="sm"
                   TransitionProps={{onExited: () => setUnused(undefined)}}>
        <DialogTitle>{PowerLocalize.getFormatted('AdminClient.NameEntity.Unused.Title', props.typeLabel)}</DialogTitle>
        <DialogContent>
            <Typography variant="body1">
                {unused && unused.length > 0
                    ? PowerLocalize.getFormatted('AdminClient.NameEntity.Unused.Content', unused.length)
                    : PowerLocalize.get('AdminClient.NameEntity.Unused.None')}
            </Typography>
            {unused && unused.length > 0 && <>
                <PwrSpacer/>
                <PwrListTable label={PowerLocalize.getFormatted('AdminClient.NameEntity.Unused.Title', props.typeLabel)}
                              items={unused}
                              itemKey={entity => String(entity.id)}
                              columns={[{header: PowerLocalize.get('AdminClient.Overview.Name'), render: entity => entity.name}]}/>
            </>}
        </DialogContent>
        <DialogActions>
            {unused && unused.length > 0
                ? <PwrConfirmActions destructive confirmText={PowerLocalize.get('Action.Delete')} onConfirm={deleteUnused}
                                     rejectText={PowerLocalize.get('Action.Cancel')} onReject={props.onClose}/>
                : <PwrButton variant="contained" color="primary" text={PowerLocalize.get('Action.Close')}
                             onClick={props.onClose}/>}
        </DialogActions>
    </Dialog>;
};
