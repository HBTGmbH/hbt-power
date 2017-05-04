import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, DateFieldType, ProfileElementType} from '../../../../Store';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ProfileElement} from '../../profile-element_module';
import {CareerElement} from '../../../../model/CareerElement';
import {CareerPosition} from '../../../../model/CareerPosition';
import {ProfileActionCreator} from '../../../../reducers/singleProfile/singleProfileActions';
import {SingleCareerElement} from './career-step_module';
import * as Immutable from 'immutable';

interface CareerProps {
    careerElements: Immutable.Map<string, CareerElement>;
    careerPositions: Immutable.Map<string, CareerPosition>;
    userInitials: string;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for display, but also for persistence operations has to be placed in the Props interface,
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
    changeStartDate(newDate: Date, id: string): void;
    changeEndDate(newDate: Date, id: string): void;
    changeCareerId(newId: string, id: string): void;
    removeCareerElement(id: string): void;
    addCareerElement(): void;

}

class CareerModule extends React.Component<CareerProps & CareerLocalProps & CareerDispatch, CareerLocalState> {

    private static renderHeader() : JSX.Element {
        return (
            <td>TODO</td>
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
            changeStartDate: function(newDate: Date, id: string) {
                dispatch(ProfileActionCreator.changeDateField(id, newDate, DateFieldType.CareerFrom));
            },
            changeEndDate: function(newDate: Date, id: string) {
                dispatch(ProfileActionCreator.changeDateField(id, newDate, DateFieldType.CareerTo));
            },
            changeCareerId: function(newId: string, id: string) {
                dispatch(ProfileActionCreator.changeItemId(newId, id, ProfileElementType.CareerEntry));
            },
            removeCareerElement: function(id: string) {
                dispatch(ProfileActionCreator.deleteEntry(id, ProfileElementType.CareerEntry));
            },
            addCareerElement: function() {
                dispatch(ProfileActionCreator.createEntry(ProfileElementType.CareerEntry));
            }
        };
    }


    private handleAddElement = () => {
        this.props.addCareerElement();
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