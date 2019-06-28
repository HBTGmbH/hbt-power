import {AbstractAction} from '../../profile/database-actions';
import {ProfileEntryField} from '../model/ProfileEntryField';

export interface EntryDeleteAction extends AbstractAction {
    id: number;
    field: ProfileEntryField;
}