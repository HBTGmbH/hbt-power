import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../Store';
import {FlatButton, FontIcon, Paper, TextField} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';


/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link ViewCard.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ViewCardProps {

}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link ViewCardProps} and will then be
 * managed by redux.
 */
interface ViewCardLocalProps {
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface ViewCardLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ViewCardDispatch {

}

class ViewCardModule extends React.Component<ViewCardProps & ViewCardLocalProps & ViewCardDispatch, ViewCardLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ViewCardLocalProps): ViewCardProps {
        return {};
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ViewCardDispatch {
        return {};
    }

    render() {
        return (
            <Paper zDepth={3}>
                <div style={{padding:"30px"}}>
                    <div className="row">
                        <div className="col-md-12">
                            <TextField
                                fullWidth={true}
                                floatingLabelText={PowerLocalize.get("ViewCard.Name")}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <TextField
                                fullWidth={true}
                                floatingLabelText={PowerLocalize.get("ViewCard.Description")}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <FlatButton
                                label={PowerLocalize.get('Action.Edit')}
                                labelPosition="before"
                                icon={ <FontIcon className="material-icons">edit</FontIcon>}
                            />
                        </div>
                        <div className="col-md-4">
                            <FlatButton
                                label={PowerLocalize.get('Action.Generate')}
                                labelPosition="before"
                                primary={true}
                                icon={ <FontIcon className="material-icons">picture_as_pdf</FontIcon>}
                            />
                        </div>
                        <div className="col-md-4">
                            <FlatButton
                                label={PowerLocalize.get('Action.Delete')}
                                labelPosition="before"
                                secondary={true}
                                icon={ <FontIcon className="material-icons">delete</FontIcon>}
                            />
                        </div>
                    </div>
                </div>
            </Paper>
        );
    }
}

/**
 * @see ViewCardModule
 * @author nt
 * @since 23.05.2017
 */
export const ViewCard: React.ComponentClass<ViewCardLocalProps> = connect(ViewCardModule.mapStateToProps, ViewCardModule.mapDispatchToProps)(ViewCardModule);