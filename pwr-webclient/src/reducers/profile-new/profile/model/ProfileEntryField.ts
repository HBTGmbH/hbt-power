import {ProfileEntry} from './ProfileEntry';
import {Profile} from './Profile';

export type ProfileEntryField  = keyof Profile & Array<ProfileEntry>;