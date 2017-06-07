import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, ProfileElementType} from '../../../../../Store';
import {TouchTapEvent} from 'material-ui';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {EducationEntry} from '../../../../../model/EducationEntry';
import * as Immutable from 'immutable';
import {NameEntity} from '../../../../../model/NameEntity';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {SingleEducationElement} from './education-entry_module';
import {ProfileElement} from '../../profile-element_module';

interface EducationProps {

    educationEntries: Immutable.Map<string, EducationEntry>;

    educations: Immutable.Map<string, NameEntity>;


    degrees: Immutable.List<string>;
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
    addEducationEntry(): void;
    deleteEducationEntry(educationEntryId: string): void;
    saveEducationEntry(educationEntry: EducationEntry, education: NameEntity): void;
}

class EducationModule extends React.Component<EducationProps & EducationLocalProps & EducationDispatch, EducationLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: EducationLocalProps) : EducationProps {
        return {
            educationEntries : state.databaseReducer.profile().educationEntries(),
            educations: state.databaseReducer.educations(),
            degrees: state.databaseReducer.degrees()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : EducationDispatch {
        return {
            addEducationEntry: function() {
                dispatch(ProfileActionCreator.createEntry(ProfileElementType.EducationEntry))
            },
            deleteEducationEntry: function(educationEntryId: string) {
                dispatch(ProfileActionCreator.deleteEntry(educationEntryId, ProfileElementType.EducationEntry));
            },
            saveEducationEntry: function(educationEntry, education) {
                dispatch(ProfileActionCreator.saveEntry(educationEntry, education, ProfileElementType.EducationEntry));
            }
        };
    }

    private handleAddElement = (event: TouchTapEvent) => {
        this.props.addEducationEntry();
    };

    /**
     *
     * @returns {any}
     */
    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Education.Singular')}
                onAddElement={this.handleAddElement}
            >
                {this.props.educationEntries.map((education, key) => {
                    return(
                        <SingleEducationElement
                            key={"SingleEducationElement." + key}
                            degrees={this.props.degrees}
                            educationEntry={education}
                            educations={this.props.educations}
                            onDelete={this.props.deleteEducationEntry}
                            onSave={this.props.saveEducationEntry}
                        />
                    );
                }).toList()}
            </ProfileElement>
        );
    }
}

export const EducationList: React.ComponentClass<EducationLocalProps> = connect(EducationModule.mapStateToProps, EducationModule.mapDispatchToProps)(EducationModule);