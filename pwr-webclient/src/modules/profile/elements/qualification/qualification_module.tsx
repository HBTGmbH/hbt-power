import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, DateFieldType, ProfileElementType} from '../../../../Store';
import {ProfileElement} from '../../profile-element_module';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {Qualification} from '../../../../model/Qualification';
import {QualificationEntry} from '../../../../model/QualificationEntry';
import {SingleQualificationEntry} from './qualification-entry_module';
import {ProfileActionCreator} from '../../../../reducers/singleProfile/singleProfileActions';
import * as Immutable from 'immutable';
import {TouchTapEvent} from 'material-ui';

interface QualificationProps {
    qualificationEntries: Immutable.Map<string, QualificationEntry>;
    qualifications: Immutable.Map<string,Qualification>;
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
    onDateChange(newDate: Date, id: string): void;
    onQualificationChange(newQualificationId: string, entryId: string): void;
    addQualificationEntry(): void;
    deleteQualificationEntry(id: string): void;
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
            onDateChange: function(newDate, id: string) {
                dispatch(ProfileActionCreator.changeDateField(id, newDate, DateFieldType.QualificationDate));
            },
            onQualificationChange: function(newQualificationId: string, entryId: string) {
                dispatch(ProfileActionCreator.changeItemId(newQualificationId, entryId, ProfileElementType.QualificationEntry));
            },
            addQualificationEntry: function() {
                dispatch(ProfileActionCreator.createEntry(ProfileElementType.QualificationEntry));
            },
            deleteQualificationEntry: function(id: string) {
                dispatch(ProfileActionCreator.deleteEntry(id, ProfileElementType.QualificationEntry));
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
                tableHeader={QualificationModule.renderHeader()}
                onAddElement={this.handleAddElement}
            >
                {this.props.qualificationEntries.map((q, key) => {
                    return (
                        <SingleQualificationEntry
                            key={'Qualification.SingleEntry.' + key}
                            qualificationEntry={q}
                            qualifications={this.props.qualifications}
                            onDateChange={this.props.onDateChange}
                            onQualificationChange={this.props.onQualificationChange}
                            onDelete={this.props.deleteQualificationEntry}
                        />
                    );
                }).toArray()}
            </ProfileElement>
        );
    }
}

export const Qualifications: React.ComponentClass<QualificationLocalProps> = connect(QualificationModule.mapStateToProps, QualificationModule.mapDispatchToProps)(QualificationModule);