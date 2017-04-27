import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, DateFieldType, ProfileElementType} from '../../../../Store';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ProfileElement} from '../../profile-element_module';
import {CareerElement} from '../../../../model/CareerElement';
import {CareerPosition} from '../../../../model/CareerPosition';
import {ProfileActionCreator, ProfileAsyncActionCreator} from '../../../../reducers/singleProfile/singleProfileActions';
import {SingleCareerElement} from './career-step_module';
import * as Immutable from 'immutable';
import {IconButton} from 'material-ui';

interface CareerProps {
    careerElements: Immutable.Map<number, CareerElement>;
    careerPositions: Immutable.Map<number, CareerPosition>;
    userInitials: string;
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
    changeCareerId(newId: number, id: number): void;
    removeCareerElement(id: number): void;
    addCareerElement(initials: string, positionId: number, careers: Immutable.Map<number, CareerPosition>): void;

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
            careerElements: state.databaseReducer.profile.careerElements,
            careerPositions: state.databaseReducer.careerPositions,
            userInitials: state.databaseReducer.loggedInUser
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : CareerDispatch {
        return {
            changeStartDate: function(newDate: Date, id: number) {
                dispatch(ProfileActionCreator.changeDateField(id, newDate, DateFieldType.CareerFrom));
            },
            changeEndDate: function(newDate: Date, id: number) {
                dispatch(ProfileActionCreator.changeDateField(id, newDate, DateFieldType.CareerTo));
            },
            changeCareerId: function(newId: number, id: number) {
                dispatch(ProfileActionCreator.changeItemId(newId, id, ProfileElementType.CareerEntry));
            },
            removeCareerElement: function(id: number) {
                dispatch(ProfileActionCreator.deleteEntry(id, ProfileElementType.CareerEntry));
            },
            addCareerElement: function(initials: string, positionId: number, careers: Immutable.Map<number, CareerPosition>) {
                let careerElement: CareerElement =  CareerElement.createDefault(positionId);
                dispatch(ProfileAsyncActionCreator.saveCareerElement(initials, careerElement, careers)) //FIXME hardcoding
            }
        };
    }


    private handleAddElement = () => {
        // FIXME this might result in problems when there are no position available
        let positionId: number = this.props.careerPositions.first().id;
        this.props.addCareerElement(this.props.userInitials, positionId, this.props.careerPositions);
    };

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Career.Qualifier')}
                tableHeader={CareerModule.renderHeader()}
                onAddElement={this.handleAddElement}
            >
                {
                    this.props.careerElements.map((value, key, index) => {
                        return (
                            <SingleCareerElement
                                key={"SingleCareerElement." + key}
                                careerElement={value}
                                careerPositions={this.props.careerPositions}
                                onStartDateChange={this.props.changeStartDate}
                                onEndDateChange={this.props.changeEndDate}
                                onCareerChange={this.props.changeCareerId}
                                onDelete={this.props.removeCareerElement}
                            />
                        )
                    }).toArray()
                }
            </ProfileElement>

        );
    }
}

export const Career: React.ComponentClass<CareerLocalProps> = connect(CareerModule.mapStateToProps, CareerModule.mapDispatchToProps)(CareerModule);