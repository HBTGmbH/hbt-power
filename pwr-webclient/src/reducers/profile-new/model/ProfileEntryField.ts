import {Profile} from './Profile';
import {ProfileEntry} from './ProfileEntry';

export type ProfileEntryField  = keyof Profile & Array<ProfileEntry>;