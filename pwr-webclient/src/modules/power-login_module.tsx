import {connect} from 'react-redux';
import * as React from 'react';
import {KeyboardEvent} from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../Store';
import {Paper, RaisedButton, TextField} from 'material-ui';
import {browserHistory} from 'react-router'
/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link PowerLogin.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface PowerLoginProps {

}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link PowerLoginProps} and will then be
 * managed by redux.
 */
interface PowerLoginLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface PowerLoginLocalState {
    initials: string;
    password: string;
    status: LoginStatus;
}

enum LoginStatus {
    INITIALS,
    PASSWORD,
    SUCCESS,
    REJECTED
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface PowerLoginDispatch {

}

class PowerLoginModule extends React.Component<
    PowerLoginProps
    & PowerLoginProps
    & PowerLoginDispatch, PowerLoginLocalState> {

    constructor(props:PowerLoginProps& PowerLoginProps& PowerLoginDispatch) {
        super(props);
        this.state = {
            initials: "",
            password: "",
            status: LoginStatus.INITIALS
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: PowerLoginProps): PowerLoginProps {
        return {}
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): PowerLoginDispatch {
        return {}
    }

    private handleInitialsInput = (event:any, value: string) => {
    this.setState({
        initials: value
        })
    };

    private handleInitialsInputKeyPress = (event: KeyboardEvent<{}>) => {
        if(event.key === 'Enter') {
            this.setState({
                status: LoginStatus.PASSWORD
            })
        }
    };

    private handlePasswordInput = (event:any, value: string) => {
        this.setState({
            password: value
        })
    };

    private handlePasswordKeyPress = (event: KeyboardEvent<{}>) => {
        if(event.key === 'Enter') {
            this.setState({
                status: LoginStatus.SUCCESS
            });
            browserHistory.push("/home");

        }
    };

    private renderInputField = () => {
        if(this.state.status === LoginStatus.INITIALS) {
            return (<TextField
                floatingLabelText="Kürzel"
                value={this.state.initials}
                onChange={this.handleInitialsInput}
                onKeyPress={this.handleInitialsInputKeyPress}
            />)
        } else if(this.state.status === LoginStatus.PASSWORD) {
            return (<TextField
                floatingLabelText="Passwort"
                value={this.state.password}
                onChange={this.handlePasswordInput}
                onKeyPress={this.handlePasswordKeyPress}
                type="password"
            />)
        } else if(this.state.status === LoginStatus.REJECTED) {
            return (<div/>)
        }
        return (<div/>);
    };

    render() {
        return (
        <div className="row">
            <div className="col-md-4 col-md-offset-4">
                <Paper style={{height: "400px"}}>
                    <br/>
                    <div className="row">
                        <div className="col-md-4 col-md-offset-1">
                            <img className="img-responsive" src="/img/logo_hbt.png"/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-offset-1">
                            <h1>Anmeldung</h1>
                            <h4>Weiter zu HBT Power</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-offset-1">
                            {this.renderInputField()}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-offset-1">
                            <RaisedButton label="Weiter" primary={true}/>
                        </div>
                    </div>

                </Paper>
            </div>
        </div>);
    }
}

/**
 * @see PowerLoginModule
 * @author nt
 * @since 11.05.2017
 */
export const PowerLogin: React.ComponentClass<PowerLoginLocalProps> = connect(PowerLoginModule.mapStateToProps, PowerLoginModule.mapDispatchToProps)(PowerLoginModule);