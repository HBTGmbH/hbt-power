import {ProfileEntry} from '../model/ProfileEntry';
import {ProfileEntryField} from '../model/ProfileEntryField';
import {AbstractAction} from '../../profile/database-actions';
import {ActionType} from '../../ActionType';

export interface EntryLoadAction extends AbstractAction {
    entry: Array<ProfileEntry>,
    field: ProfileEntryField
}

export function entryLoadAction(entry: Array<ProfileEntry>, field: ProfileEntryField) : EntryLoadAction {
    return {
        type: ActionType.LoadEntriesAction,
        entry: entry,
        field: field
    };
}