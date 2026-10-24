import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Tooltip} from '@material-ui/core';
import {ApplicationState} from '../../reducers/reducerIndex';
import {LoginStatus} from '../../model/LoginStatus';
import {loadConsultantNames, selectConsultantName} from '../../reducers/consultant-names/ConsultantNameActionCreator';

/**
 * Loads the names of the consultants once after the login (#216)
 */
export const ConsultantNamesLoader = () => {
    const dispatch = useDispatch();
    const loggedIn = useSelector((state: ApplicationState) => state.crossCutting.loginStatus === LoginStatus.SUCCESS);
    const requested = useSelector((state: ApplicationState) => state.consultantNames.requested);
    React.useEffect(() => {
        if (loggedIn && !requested) {
            dispatch(loadConsultantNames() as any);
        }
    }, [loggedIn, requested, dispatch]);
    return null;
};

interface PwrConsultantNameProps {
    initials: string;
    /** Shown as long as the app does not know the consultant's short name */
    fullName: string;
}

/**
 * A consultant named by the short name (#216), the full name in the tooltip
 */
export const PwrConsultantName = (props: PwrConsultantNameProps) => {
    const name = useSelector((state: ApplicationState) => selectConsultantName(state, props.initials));
    if (!name || name.shortName === name.fullName) {
        return <>{name ? name.fullName : props.fullName}</>;
    }
    return <Tooltip title={name.fullName}>
        <span>{name.shortName}</span>
    </Tooltip>;
};

/** A consultant to put in order by the name the app shows */
export interface NamedConsultant {
    initials: string;
    /** Shown as long as the app does not know the consultant's short name */
    fullName: string;
}

/**
 * Compares consultants by the name {@link PwrConsultantName} shows, ignoring case and accents; the same name by the
 * initials. For every list of who uses something, which is shown by short name (#238).
 */
export function useByShownName(): (a: NamedConsultant, b: NamedConsultant) => number {
    const names = useSelector((state: ApplicationState) => state.consultantNames.names);
    const shown = (consultant: NamedConsultant) =>
        names[consultant.initials] ? names[consultant.initials].shortName : consultant.fullName;
    return (a, b) => shown(a).localeCompare(shown(b), 'de', {sensitivity: 'base'})
        || a.initials.localeCompare(b.initials, 'de', {sensitivity: 'base'});
}
