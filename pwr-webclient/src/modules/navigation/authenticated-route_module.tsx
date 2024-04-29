import * as React from 'react';
import {ApplicationState} from '../../reducers/reducerIndex';
import {ThunkDispatch} from 'redux-thunk';
import {LoginStatus} from '../../model/LoginStatus';
import {Redirect, Route} from 'react-router-dom';
import {RouteProps} from 'react-router';
import {Paths} from '../../Paths';
import {connect} from 'react-redux';
import {ProfileSelect} from "../profile-select_module";
import {ComponentType} from "react";

interface AuthenticatedRouteDialogProps {
    isLoggedIn: boolean;
    userIsAdmin: boolean;
}

interface AuthenticatedRouteDialogLocalProps extends RouteProps {
    requiresAdmin?: boolean;
    path?: string;
    component?: React.ComponentType;
}

interface AuthenticatedRouteDialogLocalState {

}

interface AuthenticatedRouteDialogDispatch {
}

class AuthenticatedRouteModule extends React.Component<AuthenticatedRouteDialogProps
    & AuthenticatedRouteDialogLocalProps
    & AuthenticatedRouteDialogDispatch, AuthenticatedRouteDialogLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: AuthenticatedRouteDialogLocalProps): AuthenticatedRouteDialogProps {
        return {
            isLoggedIn: state.crossCutting.loginStatus === LoginStatus.SUCCESS,
            userIsAdmin: state.adminReducer.loginStatus() === LoginStatus.SUCCESS,
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): AuthenticatedRouteDialogDispatch {
        return {};
    }

    render() {
        // FIXME@nt here we need to somehow store the link we try to route to so that, later on,
        let allowed = true;
        if (!this.props.isLoggedIn) {
            allowed = false;
        }
        if (this.props.requiresAdmin && !this.props.userIsAdmin) {
            allowed = false;
        }
        if (!allowed) {
            // if not allowed to route -> do not render that route!
            return <></>
        }
        const rest = this.props;
        return (<Route {...rest}/>);
    }
}

export const AuthenticatedRoute: React.ComponentClass<AuthenticatedRouteDialogLocalProps> = connect(AuthenticatedRouteModule.mapStateToProps, AuthenticatedRouteModule.mapDispatchToProps)(AuthenticatedRouteModule) as any;
