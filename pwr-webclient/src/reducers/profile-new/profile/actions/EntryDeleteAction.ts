import {AbstractAction} from '../../../profile/database-actions';
import {ProfileEntryField} from '../model/ProfileEntryField';
import {ActionType} from '../../../ActionType';

export interface EntryDeleteAction extends AbstractAction {
    id: number;
    field: ProfileEntryField;
}

export function entryDeleteAction(id: number, field: ProfileEntryField): EntryDeleteAction {
    return {
        type: ActionType.DeleteEntrySuccessful,
        id: id,
        field: field
    };
}