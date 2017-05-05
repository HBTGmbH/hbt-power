import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, ProfileElementType} from '../../../../Store';
import {ProfileElement} from '../../profile-element_module';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {QualificationEntry} from '../../../../model/QualificationEntry';
import {SingleQualificationEntry} from './qualification-entry_module';
import * as Immutable from 'immutable';
import {TouchTapEvent} from 'material-ui';
import {NameEntity} from '../../../../model/NameEntity';
import {ProfileActionCreator} from '../../../../reducers/singleProfile/ProfileActionCreator';

interface QualificationProps {
    qualificationEntries: Immutable.Map<string, QualificationEntry>;
    qualifications: Immutable.Map<string, NameEntity>;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface QualificationLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface QualificationLocalState {

}

interface QualificationDispatch {
    addQualificationEntry(): void;
    deleteQualificationEntry(id: string): void;
    saveQualification(qualificationEntry: QualificationEntry, qualification: NameEntity): void;
}

class QualificationModule extends React.Component<QualificationProps & QualificationProps & QualificationDispatch, QualificationLocalState> {

    private static renderHeader() {
        return (
            <div></div>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: QualificationLocalProps) : QualificationProps {
        return {
            qualificationEntries : state.databaseReducer.profile.qualificationEntries,
            qualifications: state.databaseReducer.qualifications
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : QualificationDispatch {
        return {
            addQualificationEntry: function() {
                dispatch(ProfileActionCreator.createEntry(ProfileElementType.QualificationEntry));
            },
            deleteQualificationEntry: function(id: string) {
                dispatch(ProfileActionCreator.deleteEntry(id, ProfileElementType.QualificationEntry));
            },
            saveQualification: function(qualificationEntry: QualificationEntry, qualification: NameEntity){
                dispatch(ProfileActionCreator.saveEntry(qualificationEntry, qualification, ProfileElementType.QualificationEntry));
            }
        };
    }

    private handleAddElement = (event: TouchTapEvent) => {
        this.props.addQualificationEntry();
    };

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Qualification.Plural')}
                onAddElement={this.handleAddElement}
            >
                {this.props.qualificationEntries.map((q, key) => {
                    return (
                        <SingleQualificationEntry
                            key={'Qualification.SingleEntry.' + key}
                            qualificationEntry={q}
                            qualifications={this.props.qualifications}
                            onDelete={this.props.deleteQualificationEntry}
                            onSave={this.props.saveQualification}
                        />
                    );
                }).toArray()}
            </ProfileElement>
        );
    }
}

export const Qualifications: React.ComponentClass<QualificationLocalProps> = connect(QualificationModule.mapStateToProps, QualificationModule.mapDispatchToProps)(QualificationModule);