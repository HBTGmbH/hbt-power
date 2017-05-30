import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../Store';
import {InternalDatabase} from '../../model/InternalDatabase';
import {ViewProfile} from '../../model/viewprofile/ViewProfile';
import {isNullOrUndefined} from 'util';
import {EducationTable} from './tables/education-table_module';
import {Divider, Paper} from 'material-ui';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link ViewProfileCard.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ViewProfileCardProps {
    database: InternalDatabase;
    viewProfile: ViewProfile;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link ViewProfileCardProps} and will then be
 * managed by redux.
 */
interface ViewProfileCardLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface ViewProfileCardLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ViewProfileCardDispatch {

}

class ViewProfileCardModule extends React.Component<
    ViewProfileCardProps
    & ViewProfileCardLocalProps
    & ViewProfileCardDispatch, ViewProfileCardLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ViewProfileCardLocalProps): ViewProfileCardProps {
        return {
            database: state.databaseReducer,
            viewProfile: state.databaseReducer.viewProfiles().get(state.databaseReducer.activeViewProfileId())
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ViewProfileCardDispatch {
        return {};
    }

    render() {
        if(!isNullOrUndefined(this.props.viewProfile)) {
            return (
                <div>
                    <Paper className="margin-5px">
                    </Paper>
                    <Paper className="margin-5px">
                    </Paper>
                    <Paper className="margin-5px">
                        <EducationTable key="EducationTable"/>
                    </Paper>
                    <Paper className="margin-5px">
                    </Paper>
                </div>

            );
        }
        return (<div/>);

    }
}

/**
 * @see ViewProfileCardModule
 * @author nt
 * @since 29.05.2017
 */
export const ViewProfileCard: React.ComponentClass<ViewProfileCardLocalProps> = connect(ViewProfileCardModule.mapStateToProps, ViewProfileCardModule.mapDispatchToProps)(ViewProfileCardModule);