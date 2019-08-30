import {SuggestionStore} from '../SuggestionStore';
import {NameEntity} from '../../profile-new/profile/model/NameEntity';

export type SuggestionField = keyof SuggestionStore & Array<NameEntity>;