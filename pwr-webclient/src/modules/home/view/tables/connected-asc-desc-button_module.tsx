import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../../Store';
import {AscDescButton} from '../../../general/asc-desc-button_module';
import {ProfileAsyncActionCreator} from '../../../../reducers/profile/ProfileAsyncActionCreator';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link ConnectedAscDescButton.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ConnectedAscDescButtonProps {


}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link ConnectedAscDescButtonProps} and will then be
 * managed by redux.
 */
interface ConnectedAscDescButtonLocalProps {
    elementType: ProfileElementType;
    entryField: 'DATE' | 'DATE_START' | 'DATE_END' | 'NAME' | 'LEVEL' | 'DEGREE';
    viewProfileId: string;
    label?: string;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface ConnectedAscDescButtonLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ConnectedAscDescButtonDispatch {
    sortTable(localProps:ConnectedAscDescButtonLocalProps, sortOrder: 'ASC'|'DESC'): void;
}

class ConnectedAscDescButtonModule extends React.Component<
    ConnectedAscDescButtonProps
    & ConnectedAscDescButtonLocalProps
    & ConnectedAscDescButtonDispatch, ConnectedAscDescButtonLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ConnectedAscDescButtonLocalProps): ConnectedAscDescButtonProps {
        return {}
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ConnectedAscDescButtonDispatch {
        return {
            sortTable: (localProps, sortOrder) => {
                dispatch(ProfileAsyncActionCreator.sortView(localProps.elementType,localProps.entryField, sortOrder, localProps.viewProfileId))
            }
        }
    }

    private changeAscDesc = (sortOrder: 'ASC'|'DESC') => {
        this.props.sortTable(this.props, sortOrder);
    };

    render() {
        return (<AscDescButton label={this.props.label} onAscDescChange={this.changeAscDesc}/>);
    }
}

/**
 * @see ConnectedAscDescButtonModule. Connects an ASCDEC Button to the reducers.
 * @author nt
 * @since 06.06.2017
 */
export const ConnectedAscDescButton: React.ComponentClass<ConnectedAscDescButtonLocalProps> = connect(ConnectedAscDescButtonModule.mapStateToProps, ConnectedAscDescButtonModule.mapDispatchToProps)(ConnectedAscDescButtonModule);