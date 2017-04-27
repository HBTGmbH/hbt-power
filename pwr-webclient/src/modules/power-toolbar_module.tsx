
import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState} from '../Store';
import {MenuItem, RaisedButton, Toolbar, ToolbarGroup} from 'material-ui';
import {PowerLocalize} from '../localization/PowerLocalizer';

interface ToolbarProps {
    userInitials: string;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface ToolbarLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface ToolbarLocalState {

}

interface ToolbarDispatch {

}

class PowerToolbarModule extends React.Component<ToolbarProps & ToolbarLocalProps & ToolbarDispatch, ToolbarLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ToolbarLocalProps) : ToolbarProps {
        return {
            userInitials: state.databaseReducer.loggedInUser
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : ToolbarDispatch {
        return {

        }
    }

    render() {
        return(
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    <RaisedButton label="Profil" primary={true}/>
                    <RaisedButton label="Skills" primary={true}/>
                    <RaisedButton label="Logout" primary={true}/>
                    {PowerLocalize.get("Toolbar.LoggedInAs") + ": " + this.props.userInitials}
                </ToolbarGroup>
            </Toolbar>
        );
    }
}

export const PowerToolbar: React.ComponentClass<ToolbarLocalProps> = connect(PowerToolbarModule.mapStateToProps, PowerToolbarModule.mapDispatchToProps)(PowerToolbarModule);