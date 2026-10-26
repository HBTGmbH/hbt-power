import {ApplicationState} from '../reducerIndex';
import {OIDCService} from '../../OIDCService';

/**
 * Whether the profile in the store is only read: the one of a colleague (#350). Decided by the profile shown, not the
 * URL, so while another one loads the page stays as it was.
 */
export function isProfileReadOnly(state: ApplicationState): boolean {
    const consultant = state.profileStore.consultant;
    return !OIDCService.instance().mayEditProfile(consultant ? consultant.initials : '');
}
