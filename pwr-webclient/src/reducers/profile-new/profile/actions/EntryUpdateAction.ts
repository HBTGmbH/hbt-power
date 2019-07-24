import {AbstractAction} from '../../../profile/database-actions';
import {ProfileEntry} from '../model/ProfileEntry';
import {ProfileEntryField} from '../model/ProfileEntryField';
import {ActionType} from '../../../ActionType';

export interface EntryUpdateAction extends AbstractAction {
    entry: ProfileEntry;
    field: ProfileEntryField;
}

export function entryUpdateAction(entry:ProfileEntry,field:ProfileEntryField) :EntryUpdateAction{
    return {
        type:ActionType.UpdateEntrySuccessful,
        entry:entry,
        field:field
    }
}