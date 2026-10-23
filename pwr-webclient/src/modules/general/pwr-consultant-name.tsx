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
