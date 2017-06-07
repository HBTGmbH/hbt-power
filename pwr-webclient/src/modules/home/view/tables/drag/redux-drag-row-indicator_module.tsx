import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../../../Store';
import {ProfileAsyncActionCreator} from '../../../../../reducers/profile/ProfileAsyncActionCreator';
import {DragRowIndicator} from './drag-row-indicator_module.';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link ReduxDragIndicator.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ReduxDragIndicatorProps {

}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link ReduxDragIndicatorProps} and will then be
 * managed by redux.
 */
interface ReduxDragIndicatorLocalProps {
    viewProfileId: string;
    elementType: ProfileElementType;
    viewElementIndex: number;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface ReduxDragIndicatorLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ReduxDragIndicatorDispatch {
    swapElements(profileElementType: ProfileElementType, viewProfileId: string, index1: number, index2: number): void;
}

class ReduxDragIndicatorModule extends React.Component<
    ReduxDragIndicatorProps
    & ReduxDragIndicatorLocalProps
    & ReduxDragIndicatorDispatch, ReduxDragIndicatorLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ReduxDragIndicatorLocalProps): ReduxDragIndicatorProps {
        return {}
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReduxDragIndicatorDispatch {
        return {
            swapElements: (profileElementType, viewProfileId, index1, index2) => {
                dispatch(ProfileAsyncActionCreator.swapViewElements(profileElementType, viewProfileId, index1, index2));
            }
        }
    }

    private handleSwapElements = (i1: number, i2: number) => {
        this.props.swapElements(this.props.elementType,this.props.viewProfileId, i1, i2);
    };

    render() {
        return (<DragRowIndicator index={this.props.viewElementIndex} switchIndexes={this.handleSwapElements}/>);
    }
}

/**
 * @see ReduxDragIndicatorModule
 * @author nt
 * @since 07.06.2017
 */
export const ReduxDragIndicator: React.ComponentClass<ReduxDragIndicatorLocalProps> = connect(ReduxDragIndicatorModule.mapStateToProps, ReduxDragIndicatorModule.mapDispatchToProps)(ReduxDragIndicatorModule);