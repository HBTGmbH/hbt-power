import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';

interface ConsultantClusterInfoProps {

}

interface ConsultantClusterInfoLocalProps {

}

interface ConsultantClusterInfoLocalState {

}

interface ConsultantClusterInfoDispatch {

}

class ConsultantClusterInfoModule extends React.Component<
    ConsultantClusterInfoProps
    & ConsultantClusterInfoLocalProps
    & ConsultantClusterInfoDispatch, ConsultantClusterInfoLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ConsultantClusterInfoLocalProps): ConsultantClusterInfoProps {
        return {}
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ConsultantClusterInfoDispatch {
        return {}
    }

    render() {
        return (<div></div>);
    }
}

/**
 * @see ConsultantClusterInfoModule
 * @author nt
 * @since 22.06.2017
 */
export const ConsultantClusterInfo: React.ComponentClass<ConsultantClusterInfoLocalProps> = connect(ConsultantClusterInfoModule.mapStateToProps, ConsultantClusterInfoModule.mapDispatchToProps)(ConsultantClusterInfoModule);