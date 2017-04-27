import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import {InternalDatabase} from '../../../model/InternalDatabase';
import {TextField} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ProfileActionCreator} from '../../../reducers/singleProfile/singleProfileActions';

interface CompanyPositionProps {
    currentCompanyPosition: string;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface CompanyPositionLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface CompanyPositionLocalState {

}

interface CompanyPositionDispatch {
    changeCurrentCompanyPosition(newPosition: string): void;
}

class CompanyPositionModule extends React.Component<CompanyPositionProps & CompanyPositionLocalProps & CompanyPositionDispatch, CompanyPositionLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: CompanyPositionLocalProps) : CompanyPositionProps {
        return {
            currentCompanyPosition: state.databaseReducer.profile.currentPosition
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<InternalDatabase>) : CompanyPositionDispatch {
        return {
            changeCurrentCompanyPosition: function(newPosition: string) {
                dispatch(ProfileActionCreator.changeCurrentPosition(newPosition));
            }
        }
    }

    private handleTextFieldChange = (event: object, newValue: string) => {
        this.props.changeCurrentCompanyPosition(newValue);
    };

    render() {
        return(
            <TextField
                hintText={PowerLocalize.get("HBT.CompanyPosition")}
                floatingLabelText={PowerLocalize.get("HBT.CompanyPosition")}
                value={this.props.currentCompanyPosition}
                onChange={this.handleTextFieldChange}
            />
        );
    }
}

export const CompanyPosition: React.ComponentClass<CompanyPositionLocalProps> = connect(CompanyPositionModule.mapStateToProps, CompanyPositionModule.mapDispatchToProps)(CompanyPositionModule);