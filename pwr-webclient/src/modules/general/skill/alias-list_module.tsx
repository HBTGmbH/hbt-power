import * as React from 'react';
import {useState} from 'react';
import * as Immutable from 'immutable';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    TextField,
    Typography
} from '@material-ui/core';
import {PwrSpacer} from '../pwr-spacer_module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {PwrIconButton} from '../pwr-icon-button';
import {compareNames} from '../../../utils/Comparators';
import {PwrConfirmActions} from '../pwr-form-actions';

interface AliasListProps {
    /** Name of the skill or profile element the aliases belong to */
    name: string;
    aliases: Immutable.List<string>;

    onAliasAdd(alias: string): void;

    onAliasDelete(alias: string): void;

    /** Makes the alias the name, the name an alias (#331); after a question, without it no button */
    onAliasPromote?(alias: string): void;
}

/**
 * Shows the aliases (other spellings) of a skill or profile element (#270) and lets the admin add and remove them,
 * and make one of them the name (#331).
 */
export const AliasList = (props: AliasListProps) => {
    const [newAlias, setNewAlias] = useState('');
    const [promoting, setPromoting] = useState<string | null>(null);

    const promote = () => {
        props.onAliasPromote(promoting);
        setPromoting(null);
    };

    const canAdd = newAlias.trim().length > 0;

    const add = () => {
        if (canAdd) {
            props.onAliasAdd(newAlias.trim());
            setNewAlias('');
        }
    };

    const sortedAliases = props.aliases.sort(compareNames);

    return <div>
        {sortedAliases.isEmpty()
            ? <Typography variant="body2" color="textSecondary">
                {PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Alias.None', props.name)}
            </Typography>
            : <List dense>
                {sortedAliases.map(alias => <ListItem key={alias}>
                    <ListItemText primary={alias}/>
                    <ListItemSecondaryAction>
                        {props.onAliasPromote && <PwrIconButton
                            iconName={'upgrade'}
                            tooltip={PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Alias.Promote', alias)}
                            onClick={() => setPromoting(alias)}
                        />}
                        <PwrIconButton
                            iconName={'delete'}
                            tooltip={PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Alias.Delete', alias)}
                            onClick={() => props.onAliasDelete(alias)}
                        />
                    </ListItemSecondaryAction>
                </ListItem>).toArray()}
            </List>}
        <PwrSpacer size="tight"/>
        <div style={{display: 'flex', alignItems: 'center'}}>
            <TextField
                label={PowerLocalize.get('AdminClient.Info.SkillTree.Alias.New')}
                value={newAlias}
                onChange={e => setNewAlias(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        add();
                    }
                }}
                style={{flexGrow: 1}}
            />
            <PwrIconButton
                iconName={'add'}
                tooltip={PowerLocalize.get('AdminClient.Info.SkillTree.Alias.Add')}
                disabled={!canAdd}
                onClick={add}
            />
        </div>
        <Dialog open={promoting !== null} onClose={() => setPromoting(null)} maxWidth={'sm'}>
            <DialogTitle>{PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Alias.Promote.Title', promoting || '')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Alias.Promote.Content', promoting || '', props.name)}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <PwrConfirmActions confirmText={PowerLocalize.get('AdminClient.Info.SkillTree.Alias.Promote.Action')}
                                   onConfirm={promote} onReject={() => setPromoting(null)}/>
            </DialogActions>
        </Dialog>
    </div>;
};
