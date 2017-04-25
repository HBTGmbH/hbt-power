import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, DateFieldType} from '../../../../Store';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ProfileElement} from '../../profile-element_module';
import {CareerElement} from '../../../../model/CareerElement';
import {CareerPosition} from '../../../../model/CareerPosition';
import {ProfileActionCreator} from '../../../../reducers/singleProfile/singleProfileActions';
import {SingleCareerElement} from './career-step_module';

interface CareerProps {
    /**
     * Associative array that maps an id(number) to a CareerElement
     */
    careerById: Array<CareerElement>;
    /**
     * Associative array that maps an id(number) to a CareerPosition
     */
    careerPositionsById: Array<CareerPosition>;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface CareerLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface CareerLocalState {

}

interface CareerDispatch {
    changeStartDate(newDate: Date, id: number): void;
    changeEndDate(newDate: Date, id: number): void;
}

class CareerModule extends React.Component<CareerProps & CareerLocalProps & CareerDispatch, CareerLocalState> {

    private static renderHeader() : JSX.Element {
        return (
            <tr>
                <th>{PowerLocalize.get("CareerModule.StartDate")}</th>
                <th>{PowerLocalize.get("CareerModule.EndDate")}</th>
                <th>{PowerLocalize.get("Qualifier.Singular")}</th>
            </tr>
        );
    }


    static mapStateToProps(state: ApplicationState, localProps: CareerLocalProps) : CareerProps {
        return {
            careerById: state.databaseReducer.careerById,
            careerPositionsById: state.databaseReducer.careerPositionsById
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : CareerDispatch {
        return {
            changeStartDate: function(newDate: Date, id: number) {
                dispatch(ProfileActionCreator.changeDateField(id, newDate, DateFieldType.CareerFrom))
            },
            changeEndDate: function(newDate: Date, id: number) {
                dispatch(ProfileActionCreator.changeDateField(id, newDate, DateFieldType.CareerTo))
            }
        };
    }

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Career.Qualifier')}
                subtitleCountedName={PowerLocalize.get('CareerStep.Qualifier')}
                tableHeader={CareerModule.renderHeader()}
            >
                {this.props.careerById.map((cp, index) => {
                    return (
                        <SingleCareerElement
                            key={"SingleCareerElement." + index}
                            careerElement={cp}
                            careerPositionsById={this.props.careerPositionsById}
                            onStartDateChange={this.props.changeStartDate}
                            onEndDateChange={this.props.changeEndDate}
                        />
                    )
                })}
            </ProfileElement>
        );
    }
}

export const Career: React.ComponentClass<CareerLocalProps> = connect(CareerModule.mapStateToProps, CareerModule.mapDispatchToProps)(CareerModule);