import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState} from '../Store';
import {IconButton, RaisedButton, Toolbar, ToolbarGroup, Drawer} from 'material-ui';
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
    menuOpen: boolean;
}

interface ToolbarDispatch {

}

class PowerToolbarModule extends React.Component<ToolbarProps & ToolbarLocalProps & ToolbarDispatch, ToolbarLocalState> {

    constructor(props: ToolbarProps & ToolbarLocalProps & ToolbarDispatch) {
        super(props);
        this.state = {menuOpen: false};
    }

    static mapStateToProps(state: ApplicationState, localProps: ToolbarLocalProps) : ToolbarProps {
        return {
            userInitials: state.databaseReducer.loggedInUser
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : ToolbarDispatch {
        return {

        };
    }

    private handleMenuClick = () => {
        this.setState({menuOpen: true});
    };

    render() {
        return(
            <div>
                <Drawer
                    docked={false}
                    open={this.state.menuOpen}
                    onRequestChange={(open) => this.setState({menuOpen: open})}
                >
                </Drawer>
                <Toolbar>
                    <ToolbarGroup firstChild={true}>
                        <IconButton iconClassName="material-icons" onClick={this.handleMenuClick} tooltip={PowerLocalize.get('Menu.Singular')}>menu</IconButton>
                        {PowerLocalize.get('Toolbar.LoggedInAs') + ': ' + this.props.userInitials}
                    </ToolbarGroup>
                </Toolbar>
            </div>
        );
    }
}

export const PowerToolbar: React.ComponentClass<ToolbarLocalProps> = connect(PowerToolbarModule.mapStateToProps, PowerToolbarModule.mapDispatchToProps)(PowerToolbarModule);;