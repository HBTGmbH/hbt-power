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
        console.log('isLoggedIn', this.props.isLoggedIn);
        if (!this.props.isLoggedIn) {
            console.log('User is not logged in, redirect to login')
            return <Redirect to={{pathname: Paths.APP_ROOT}}></Redirect>;
        }
        if (this.props.requiresAdmin && !this.props.userIsAdmin) {
            console.log('Route requires admin but user is not admin, redirect to profile selection')
            return <Redirect to={{pathname: Paths.PROFILE_SELECT}}></Redirect>;
        }
        const rest = this.props;
        return (<Route {...rest}/>);
    }
}

export const AuthenticatedRoute: React.ComponentClass<AuthenticatedRouteDialogLocalProps> = connect(AuthenticatedRouteModule.mapStateToProps, AuthenticatedRouteModule.mapDispatchToProps)(AuthenticatedRouteModule) as any;
