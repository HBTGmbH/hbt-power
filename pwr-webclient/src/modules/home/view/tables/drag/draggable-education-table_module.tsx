import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../../../Store';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link DraggableEducationTable.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface DraggableEducationTableProps {

}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link DraggableEducationTableProps} and will then be
 * managed by redux.
 */
interface DraggableEducationTableLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface DraggableEducationTableLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface DraggableEducationTableDispatch {

}

class DraggableEducationTableModule extends React.Component<
    DraggableEducationTableProps
    & DraggableEducationTableLocalProps
    & DraggableEducationTableDispatch, DraggableEducationTableLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: DraggableEducationTableLocalProps): DraggableEducationTableProps {
        return {}
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): DraggableEducationTableDispatch {
        return {}
    }

    render() {
        return (<div></div>);
    }
}

/**
 * @see DraggableEducationTableModule
 * @author nt
 * @since 06.06.2017
 */
export const DraggableEducationTable: React.ComponentClass<DraggableEducationTableLocalProps> = connect(DraggableEducationTableModule.mapStateToProps, DraggableEducationTableModule.mapDispatchToProps)(DraggableEducationTableModule);