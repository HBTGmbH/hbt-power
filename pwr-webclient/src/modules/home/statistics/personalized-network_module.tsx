import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ProfileNetwork} from '../../admin/statistics/profile-network_module';
import {ApplicationState} from '../../../Store';

interface PersonalizedNetworkProps {

}

interface PersonalizedNetworkLocalProps {

}

interface PersonalizedNetworkLocalState {

}

interface PersonalizedNetworkDispatch {

}

class PersonalizedNetworkModule extends React.Component<
    PersonalizedNetworkProps
    & PersonalizedNetworkLocalProps
    & PersonalizedNetworkDispatch, PersonalizedNetworkLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: PersonalizedNetworkLocalProps): PersonalizedNetworkProps {
        return {}
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): PersonalizedNetworkDispatch {
        return {}
    }

    render() {
        return (<ProfileNetwork/>);
    }
}

/**
 * @see PersonalizedNetworkModule
 * @author nt
 * @since 22.06.2017
 */
export const PersonalizedNetwork: React.ComponentClass<PersonalizedNetworkLocalProps> = connect(PersonalizedNetworkModule.mapStateToProps, PersonalizedNetworkModule.mapDispatchToProps)(PersonalizedNetworkModule);