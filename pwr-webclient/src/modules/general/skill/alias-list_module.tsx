import * as React from 'react';
import {useState} from 'react';
import * as Immutable from 'immutable';
import {List, ListItem, ListItemSecondaryAction, ListItemText, TextField, Typography} from '@material-ui/core';
import {PwrSpacer} from '../pwr-spacer_module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {PwrIconButton} from '../pwr-icon-button';
import {compareNames} from '../../../utils/Comparators';

interface AliasListProps {
    /** Name of the skill or profile element the aliases belong to */
    name: string;
    aliases: Immutable.List<string>;

    onAliasAdd(alias: string): void;

    onAliasDelete(alias: string): void;
}

/**
 * Shows the aliases (other spellings) of a skill or profile element (#270) and lets the admin add and remove them.
 */
export const AliasList = (props: AliasListProps) => {
    const [newAlias, setNewAlias] = useState('');

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
    </div>;
};
