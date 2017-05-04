import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, DateFieldType, ProfileElementType} from '../../../../Store';
import {TouchTapEvent} from 'material-ui';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ProfileElement} from '../../profile-element_module';
import {EducationEntry} from '../../../../model/EducationEntry';
import {Education} from '../../../../model/Education';
import {SingleEducationElement} from './education-entry_module';
import {ProfileActionCreator} from '../../../../reducers/singleProfile/singleProfileActions';
import * as Immutable from 'immutable';

interface EducationProps {

    educationEntries: Immutable.Map<string, EducationEntry>;

    educations: Immutable.Map<string, Education>;

    userInitials: string;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface EducationLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface EducationLocalState {

}

interface EducationDispatch {
    changeEndDate(newDate: Date, id: string): void;
    changeStartDate(newDate: Date, id: string): void;
    onEducationEntryEducationChange(newEducationId: string, id: string): void;
    addEducationEntry(): void;
    deleteEducationEntry(educationEntryId: string): void;
}

class EducationModule extends React.Component<EducationProps & EducationLocalProps & EducationDispatch, EducationLocalState> {

    private static renderHeader() {
        return (
            <div></div>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: EducationLocalProps) : EducationProps {
        return {
            educationEntries : state.databaseReducer.profile.educationEntries,
            educations: state.databaseReducer.educations,
            userInitials: state.databaseReducer.loggedInUser
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : EducationDispatch {
        return {
            changeStartDate: function(newDate: Date, id: string) {
                dispatch(ProfileActionCreator.changeDateField(id, newDate, DateFieldType.EducationStartDate));
            },
            changeEndDate: function(newDate: Date, id: string) {
                dispatch(ProfileActionCreator.changeDateField(id, newDate, DateFieldType.EducationEndDate));
            },
            onEducationEntryEducationChange: function(newEducationId: string, id: string) {
                dispatch(ProfileActionCreator.changeItemId(newEducationId, id, ProfileElementType.EducationEntry));
            },
            addEducationEntry: function() {
                dispatch(ProfileActionCreator.createEntry(ProfileElementType.EducationEntry))
            },
            deleteEducationEntry: function(educationEntryId: string) {
                dispatch(ProfileActionCreator.deleteEntry(educationEntryId, ProfileElementType.EducationEntry));
            }
        };
    }

    private handleAddElement = (event: TouchTapEvent) => {
        this.props.addEducationEntry();
    };

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Education.Singular')}
                tableHeader={EducationModule.renderHeader()}
                onAddElement={this.handleAddElement}
            >
                {this.props.educationEntries.map((education, key) => {
                    return(
                    <SingleEducationElement
                        key={"SingleEducationElement." + key}
                        educationEntry={education}
                        educations={this.props.educations}
                        onChangeStartDate={this.props.changeStartDate}
                        onChangeEndDate={this.props.changeEndDate}
                        onEducationChange={this.props.onEducationEntryEducationChange}
                        onDelete={this.props.deleteEducationEntry}
                    />);
                }).toList()}
            </ProfileElement>
        );
    }
}

export const EducationList: React.ComponentClass<EducationLocalProps> = connect(EducationModule.mapStateToProps, EducationModule.mapDispatchToProps)(EducationModule);